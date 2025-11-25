'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { validateZipCode } from '@/utils/validation'

const Hero = () => {
  const [zipCode, setZipCode] = useState('')
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [zipCodeError, setZipCodeError] = useState<string>('')

  // Function to fetch user location using server-side IP detection (same as LeadProsper)
  const fetchUserLocation = useCallback(async () => {
    try {
      setIsLoadingLocation(true)
      // Use our API route that uses the same IP detection method as LeadProsper
      const response = await fetch('/api/get-location', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      if (data.zipCode) {
        setZipCode(data.zipCode)
      } else {
        // Keep empty if location not available
        setZipCode('')
      }
    } catch {
      // Keep empty on error
      setZipCode('')
    } finally {
      setIsLoadingLocation(false)
    }
  }, [])

  // Fetch location after initial render to avoid blocking FCP
  useEffect(() => {
    // Use requestIdleCallback for better performance, fallback to setTimeout
    const scheduleLocationFetch = () => {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => fetchUserLocation(), { timeout: 2000 })
      } else {
        setTimeout(() => fetchUserLocation(), 100)
      }
    }
    
    scheduleLocationFetch()
  }, [fetchUserLocation])

  // Function to get cookie value
  const getCookie = (name: string): string | null => {
    if (typeof document === 'undefined') return null
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null
    return null
  }

  // Function to handle redirect
  const handleContinue = () => {
    // Validate ZIP code using validation utility
    const validation = validateZipCode(zipCode)
    if (!validation.valid) {
      setZipCodeError(validation.error || 'Please enter a valid 5-digit ZIP code')
      return
    }

    // Store zip code in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('zip_code', zipCode)
    }

    // Get UTM parameters from cookies
    const utmSource = getCookie('utm_source') || ''
    const utmId = getCookie('utm_id') || ''
    const utmS1 = getCookie('utm_s1') || ''

    // Build the redirect URL with zip_code
    const baseUrl = '/form/refinance'
    const params = new URLSearchParams({
      zip_code: zipCode,
    })

    // Map UTM parameters to affiliate tracking parameters
    if (utmSource) params.set('subid', utmSource)
    if (utmId) params.set('subid2', utmId)
    if (utmS1) params.set('c1', utmS1)

    const redirectUrl = `${baseUrl}?${params.toString()}`
    
    // Redirect to the quote page
    window.location.href = redirectUrl
  }

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleContinue()
    }
  }

  return (
    <div className='w-full min-h-content sm:min-h-[1000px] xl:min-h-[400px] bg-gradient-to-b from-[#8EC4F6] to-[#FFF] flex flex-col relative pb-20 lg:py-20'>
      {/* Background Illustration */}
        <div className='w-full absolute right-0 top-[85%] xl:top-1/2 md:top-1/2 transform lg:-translate-y-1/2 z-0 max-w-3xl mx-auto'>
        <Image
          width={1000}
          height={1000}
          src='/landing-illustration.svg'
          alt='Modern city skyline with eco-friendly buildings'
          className='w-full h-auto max-h-[1000px] sm:max-h-[400px] md:max-h-[700px] xl:max-h-[700px] object-contain'
          priority
          quality={90}
          loading="eager"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

        {/* Main Content Section */}
        <div className='w-full flex-1 flex items-start justify-center lg:justify-start px-8 sm:px-24 lg:px-32 xl:py-12 py-8 relative z-10'>
        <div className='w-full'>
          {/* Content */}
          <div className='max-w-2xl space-y-8 mx-auto lg:mx-0 py-0 lg:py-16'>
            <h1 className='text-[32px] font-[800] text-[#12266D] leading-tight text-center lg:text-left max-w-[360px] lg:max-w-none mx-auto lg:mx-0'>
            See how much cash your home could unlock today!
            </h1>
            
            <div className='bg-[#12266D] rounded-xl p-6 sm:p-8 max-w-2xl mx-auto lg:mx-0 shadow-2xl'>
              <p className='text-white font-[800] text-[18px] mb-6'>
                What is your current ZIP Code?
              </p>
              
              {/* Mobile: Stacked layout */}
              <div className='block sm:hidden space-y-4'>
                <input
                  type='text'
                  placeholder={isLoadingLocation ? 'Detecting your location...' : 'Zip Code e.g. 11102'}
                  value={zipCode}
                  onChange={(e) => {
                    const value = e.target.value
                    // Only allow digits and limit to 5 characters
                    if (/^\d{0,5}$/.test(value)) {
                      setZipCode(value)
                      // Clear error when user starts typing
                      if (zipCodeError) {
                        setZipCodeError('')
                      }
                    }
                  }}
                  onBlur={() => {
                    const validation = validateZipCode(zipCode)
                    if (!validation.valid) {
                      setZipCodeError(validation.error || '')
                    } else {
                      setZipCodeError('')
                    }
                  }}
                  onKeyPress={handleKeyPress}
                  disabled={isLoadingLocation}
                  className={`w-full px-4 py-4 text-gray-900 text-[18px] font-[600] rounded-lg border transition-all duration-200 h-14 bg-white focus:outline-none focus:ring-2 ${
                    zipCodeError
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:ring-orange-400 focus:border-orange-400'
                  } ${
                    isLoadingLocation ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                />
                {zipCodeError && (
                  <p className="mt-2 text-sm text-red-600 font-medium">{zipCodeError}</p>
                )}
                <button 
                  onClick={handleContinue}
                  disabled={isLoadingLocation || !validateZipCode(zipCode).valid}
                  className={`w-full px-4 py-4 rounded-lg font-[600] transition-all duration-200 flex items-center justify-center gap-2 text-[18px] h-14 text-white ${
                    isLoadingLocation || !validateZipCode(zipCode).valid
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-[#F7782B] hover:bg-[#e06c27]'
                  }`}
                >
                  {isLoadingLocation ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin text-white font-[800]"></div>
                      Loading...
                    </>
                  ) : (
                    <>
                      Continue <ArrowRight className='w-4 h-4 text-white font-[600]' />
                    </>
                  )}
                </button>
              </div>

              {/* Tablet and Desktop: Button inside input */}
              <div className='hidden sm:block'>
                <div className='relative'>
                  <input
                    type='text'
                    placeholder={isLoadingLocation ? 'Detecting your location...' : 'Zip Code e.g. 11102'}
                    value={zipCode}
                    onChange={(e) => {
                      const value = e.target.value
                      // Only allow digits and limit to 5 characters
                      if (/^\d{0,5}$/.test(value)) {
                        setZipCode(value)
                        // Clear error when user starts typing
                        if (zipCodeError) {
                          setZipCodeError('')
                        }
                      }
                    }}
                    onBlur={() => {
                      const validation = validateZipCode(zipCode)
                      if (!validation.valid) {
                        setZipCodeError(validation.error || '')
                      } else {
                        setZipCodeError('')
                      }
                    }}
                    onKeyPress={handleKeyPress}
                    disabled={isLoadingLocation}
                    className={`w-full px-4 py-4 pr-32 text-gray-900 text-[18px] font-[600] rounded-lg border transition-all duration-200 h-18 bg-white focus:outline-none focus:ring-2 ${
                      zipCodeError
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-orange-400 focus:border-orange-400'
                    } ${
                      isLoadingLocation ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  />
                  <button 
                    onClick={handleContinue}
                    disabled={isLoadingLocation || !validateZipCode(zipCode).valid}
                    className={`absolute right-0 top-0 px-14 py-2 rounded-r-lg font-[600] transition-all duration-200 flex items-center gap-2 text-[18px] h-18 text-white ${
                      isLoadingLocation || !validateZipCode(zipCode).valid
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-[#F7782B] hover:bg-[#e06c27]'
                    }`}
                  >
                    {isLoadingLocation ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin text-white font-[800]"></div>
                        Loading...
                      </>
                    ) : (
                      <>
                        Continue <ArrowRight className='w-4 h-4 text-white font-[600]' />
                      </>
                    )}
                  </button>
                </div>
                {zipCodeError && (
                  <p className="mt-2 text-sm text-red-600 font-medium">{zipCodeError}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Hero