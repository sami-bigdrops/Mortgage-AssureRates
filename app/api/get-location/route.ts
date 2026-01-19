import { NextRequest, NextResponse } from 'next/server'

// Cache for location data to improve TTFB
interface LocationData {
  city: string;
  zipCode: string;
  state: string;
  country: string;
  ip: string;
}

const locationCache = new Map<string, { data: LocationData; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export async function GET(request: NextRequest) {
  try {
    // Get client IP address using the same method as LeadProsper
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'

    // Check cache first
    const cached = locationCache.get(ip)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json(cached.data, {
        headers: {
          'Cache-Control': 'public, max-age=300, s-maxage=300',
          'Content-Type': 'application/json',
        }
      })
    }

    // For local development, try to get real IP from external service
    if (ip === 'unknown' || ip === '127.0.0.1' || ip === '::1') {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 2000)
        
        const ipResponse = await fetch('https://api.ipify.org?format=json', {
          signal: controller.signal
        })
        clearTimeout(timeoutId)
        
        if (!ipResponse.ok) {
          throw new Error(`IP service returned ${ipResponse.status}`)
        }
        
        const ipData = await ipResponse.json()
        const realIp = ipData.ip
        
        if (realIp && realIp !== '127.0.0.1') {
          // Use the real IP for geolocation
          const locationData = await getLocationFromIP(realIp)
          locationCache.set(realIp, { data: locationData, timestamp: Date.now() })
          return NextResponse.json(locationData, {
            headers: {
              'Cache-Control': 'public, max-age=300, s-maxage=300',
              'Content-Type': 'application/json',
            }
          })
        }
      } catch (error) {
        // Continue with local IP
      }
      
      const emptyResult = {
        city: '',
        zipCode: '',
        state: '',
        country: '',
        ip: ip
      }
      locationCache.set(ip, { data: emptyResult, timestamp: Date.now() })
      return NextResponse.json(emptyResult, {
        headers: {
          'Cache-Control': 'public, max-age=300, s-maxage=300',
          'Content-Type': 'application/json',
        }
      })
    }

    const locationData = await getLocationFromIP(ip)
    locationCache.set(ip, { data: locationData, timestamp: Date.now() })
    return NextResponse.json(locationData, {
      headers: {
        'Cache-Control': 'public, max-age=300, s-maxage=300',
        'Content-Type': 'application/json',
      }
    })
  } catch (error) {
    console.error('Location API error:', error)
    // Return empty location on error
    const emptyResult = {
      city: '',
      zipCode: '',
      state: '',
      country: '',
      ip: 'unknown'
    }
    return NextResponse.json(emptyResult, {
      headers: {
        'Cache-Control': 'public, max-age=60, s-maxage=60',
        'Content-Type': 'application/json',
      }
    })
  }
}

async function getLocationFromIP(ip: string): Promise<LocationData> {
  // Try multiple free APIs for better reliability with timeout
  const apis = [
    `https://ipapi.co/${ip}/json/`,
    `https://ip-api.com/json/${ip}`,
    `https://ipinfo.io/${ip}/json`
  ]

  for (const apiUrl of apis) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3000)
      
      const response = await fetch(apiUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; AssureRates/1.0)'
        },
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        continue
      }
      
      const data = await response.json()

      // Handle different API response formats
      let city = ''
      let zipCode = ''
      let state = ''
      let country = ''

      if (apiUrl.includes('ipapi.co')) {
        city = data.city || ''
        zipCode = data.postal || ''
        state = data.region || ''
        country = data.country_name || ''
      } else if (apiUrl.includes('ip-api.com')) {
        city = data.city || ''
        zipCode = data.zip || ''
        state = data.regionName || ''
        country = data.country || ''
      } else if (apiUrl.includes('ipinfo.io')) {
        city = data.city || ''
        zipCode = data.postal || ''
        state = data.region || ''
        country = data.country || ''
      }

      if (city && zipCode) {
        return {
          city: city,
          zipCode: zipCode,
          state: state,
          country: country,
          ip: ip
        }
      }
    } catch (error) {
      continue
    }
  }

  // If all APIs fail, return empty location
  return {
    city: '',
    zipCode: '',
    state: '',
    country: '',
    ip: ip
  }
}
