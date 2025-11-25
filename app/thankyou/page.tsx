'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { CheckCircle2, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import { validateZipCode } from '@/utils/validation'

export default function ThankYouPage() {
  const [autoZipCode, setAutoZipCode] = useState('')
  const [autoZipCodeError, setAutoZipCodeError] = useState<string>('')
  const [homeZipCode, setHomeZipCode] = useState('')
  const [homeZipCodeError, setHomeZipCodeError] = useState<string>('')
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)

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
        // Set ZIP code for both inputs
        setAutoZipCode(data.zipCode)
        setHomeZipCode(data.zipCode)
      } else {
        // Keep empty if location not available
        setAutoZipCode('')
        setHomeZipCode('')
      }
    } catch {
      // Keep empty on error
      setAutoZipCode('')
      setHomeZipCode('')
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

  const handleAutoContinue = () => {
    const validation = validateZipCode(autoZipCode)
    if (!validation.valid) {
      setAutoZipCodeError(validation.error || 'Please enter a valid 5-digit ZIP code')
      return
    }

    // Get UTM parameters from cookies
    const utmSource = getCookie('utm_source') || ''
    const utmId = getCookie('utm_id') || ''
    const utmS1 = getCookie('utm_s1') || ''

    // Build the redirect URL
    const baseUrl = 'https://quote.assurerates.com'
    const params = new URLSearchParams({
      zip_code: autoZipCode,
      referrer: 'auto.assurerates.com',
      tid: '3108'
    })

    // Map UTM parameters to affiliate tracking parameters
    if (utmSource) params.set('subid', utmSource)
    if (utmId) params.set('subid2', utmId)
    if (utmS1) params.set('c1', utmS1)

    const redirectUrl = `${baseUrl}/form?${params.toString()}`
    
    // Redirect to the quote page
    window.location.href = redirectUrl
  }

  const handleHomeContinue = () => {
    const validation = validateZipCode(homeZipCode)
    if (!validation.valid) {
      setHomeZipCodeError(validation.error || 'Please enter a valid 5-digit ZIP code')
      return
    }

    // Get UTM parameters from cookies
    const utmSource = getCookie('utm_source') || ''
    const utmId = getCookie('utm_id') || ''
    const utmS1 = getCookie('utm_s1') || ''

    // Build the redirect URL
    const baseUrl = 'https://homequote.assurerates.com'
    const params = new URLSearchParams({
      zip_code: homeZipCode,
      referrer: 'home.assurerates.com',
      tid: '3108'
    })

    // Map UTM parameters to affiliate tracking parameters
    if (utmSource) params.set('subid', utmSource)
    if (utmId) params.set('subid2', utmId)
    if (utmS1) params.set('c1', utmS1)

    const redirectUrl = `${baseUrl}/form?${params.toString()}`
    
    // Redirect to the quote page
    window.location.href = redirectUrl
  }

  const handleAutoKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAutoContinue()
    }
  }

  const handleHomeKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleHomeContinue()
    }
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-4 md:py-8 px-4">
      <div className="w-full max-w-6xl mx-auto">
        {/* Main Thank You Section */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden mb-6 md:mb-8">
          <div className="bg-gradient-to-r from-[#246a99] to-[#3498DB] px-6 md:px-10 py-8 md:py-10 text-center">
            {/* Success Icon */}
            <div className="flex justify-center mb-4">
              <div className="bg-white rounded-full p-3 shadow-lg">
                <CheckCircle2 size={56} className="text-green-600" />
              </div>
            </div>

            {/* Thank You Message */}
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 font-sans">
              Thank You!
            </h1>
            
            <p className="text-lg md:text-xl text-blue-100 mb-0 font-medium">
              Your mortgage application has been submitted successfully.
            </p>
          </div>

          {/* Contact Message Section */}
          <div className="p-6 md:p-8">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 md:p-7 border-l-4 border-[#3498DB]">
              <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-xl md:text-2xl font-bold text-[#246a99] mb-3 font-sans">
                  We will reach you shortly
                </h2>
                <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                  Our team of mortgage experts will contact you within 24 hours to discuss your options 
                  and answer any questions you may have. We&apos;re here to help make your homeownership dreams come true.
                </p>
              </div>
            </div>

            {/* Email Confirmation Message */}
            <div className="mt-4 md:mt-6">
              <div className="bg-white rounded-xl p-5 md:p-6 border-2 border-gray-200">
                <div className="max-w-3xl mx-auto text-center">
                  <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                    A confirmation message has been sent to your email address. The message contains 
                    information about your mortgage application and next steps. Please make sure to check 
                    your spam folder if you don&apos;t see it in your inbox.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Other Verticals Section */}
        <div className="mb-6">
          <div className="text-center mb-6 md:mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-[#246a99] mb-2 font-sans">
              Explore Other AssureRates Services
            </h2>
            <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
              Discover more ways we can help you protect and finance what matters most
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {/* AssureRates Auto Card */}
            <div className="bg-white rounded-xl md:rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-100 group">
              {/* Logo Header */}
              <div className="bg-gradient-to-br from-blue-500 via-blue-400 to-blue-500 px-5 md:px-6 py-5 md:py-6">
                <div className="flex justify-center items-center">
                  <div className="bg-white rounded-lg p-3 md:p-4 shadow-lg">
                    <Image 
                      src="/auto-assurerates.svg" 
                      alt="AssureRates Auto" 
                      width={180} 
                      height={80}
                      className="h-10 md:h-12 w-auto"
                    />
                  </div>
                </div>
              </div>

              {/* Auto Content */}
              <div className="p-5 md:p-6">
                <h3 className="text-xl md:text-2xl font-bold text-[#246a99] mb-3 font-sans text-center">
                  AssureRates Auto Insurance
                </h3>
                
                <p className="text-gray-600 mb-4 text-sm md:text-base leading-relaxed text-center">
                  Get the best auto financing options tailored to your needs. 
                  Compare rates from top lenders and drive away with your dream car today!
                </p>

                {/* Mobile: Stacked layout */}
                <div className="block sm:hidden space-y-4">
                  <input
                    type="text"
                    placeholder={isLoadingLocation ? 'Detecting your location...' : 'Zip Code e.g. 11102'}
                    value={autoZipCode}
                    onChange={(e) => {
                      const value = e.target.value
                      if (/^\d{0,5}$/.test(value)) {
                        setAutoZipCode(value)
                        if (autoZipCodeError) {
                          setAutoZipCodeError('')
                        }
                      }
                    }}
                    onBlur={() => {
                      const validation = validateZipCode(autoZipCode)
                      if (!validation.valid) {
                        setAutoZipCodeError(validation.error || '')
                      } else {
                        setAutoZipCodeError('')
                      }
                    }}
                    onKeyPress={handleAutoKeyPress}
                    disabled={isLoadingLocation}
                    className={`w-full px-4 py-4 text-gray-900 text-[18px] font-[600] rounded-lg border transition-all duration-200 h-14 bg-white focus:outline-none focus:ring-2 ${
                      autoZipCodeError
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-orange-400 focus:border-orange-400'
                    } ${
                      isLoadingLocation ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  />
                  {autoZipCodeError && (
                    <p className="mt-2 text-sm text-red-600 font-medium">{autoZipCodeError}</p>
                  )}
                  <button 
                    onClick={handleAutoContinue}
                    disabled={isLoadingLocation || !validateZipCode(autoZipCode).valid}
                    className={`w-full px-4 py-4 rounded-lg font-[600] transition-all duration-200 flex items-center justify-center gap-2 text-[18px] h-14 text-white ${
                      isLoadingLocation || !validateZipCode(autoZipCode).valid
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
                <div className="hidden sm:block">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={isLoadingLocation ? 'Detecting your location...' : 'Zip Code e.g. 11102'}
                      value={autoZipCode}
                      onChange={(e) => {
                        const value = e.target.value
                        if (/^\d{0,5}$/.test(value)) {
                          setAutoZipCode(value)
                          if (autoZipCodeError) {
                            setAutoZipCodeError('')
                          }
                        }
                      }}
                      onBlur={() => {
                        const validation = validateZipCode(autoZipCode)
                        if (!validation.valid) {
                          setAutoZipCodeError(validation.error || '')
                        } else {
                          setAutoZipCodeError('')
                        }
                      }}
                      onKeyPress={handleAutoKeyPress}
                      disabled={isLoadingLocation}
                      className={`w-full px-4 py-4 pr-32 text-gray-900 text-[18px] font-[600] rounded-lg border transition-all duration-200 h-18 bg-white focus:outline-none focus:ring-2 ${
                        autoZipCodeError
                          ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                          : 'border-gray-300 focus:ring-orange-400 focus:border-orange-400'
                      } ${
                        isLoadingLocation ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    />
                    <button 
                      onClick={handleAutoContinue}
                      disabled={isLoadingLocation || !validateZipCode(autoZipCode).valid}
                      className={`absolute right-0 top-0 px-14 py-2 rounded-r-lg font-[600] transition-all duration-200 flex items-center gap-2 text-[18px] h-18 text-white ${
                        isLoadingLocation || !validateZipCode(autoZipCode).valid
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
                  {autoZipCodeError && (
                    <p className="mt-2 text-sm text-red-600 font-medium">{autoZipCodeError}</p>
                  )}
                </div>

                {/* Fact/Stat */}
                <div className="bg-blue-50 rounded-lg p-4 mt-4 border-2 border-blue-200">
                  <p className="text-xs md:text-sm font-bold text-blue-900 mb-1 text-center">
                    💡 Did You Know?
                  </p>
                  <p className="text-sm md:text-base text-blue-800 text-center font-semibold">
                    Our customers save an average of $610/year on auto insurance
                  </p>
                </div>
              </div>
            </div>

            {/* AssureRates Home Card */}
            <div className="bg-white rounded-xl md:rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-100 group">
              {/* Logo Header */}
              <div className="bg-gradient-to-br from-blue-500 via-blue-400 to-blue-500 px-5 md:px-6 py-5 md:py-6">
                <div className="flex justify-center items-center">
                  <div className="bg-white rounded-lg p-3 md:p-4 shadow-lg">
                    <Image 
                      src="/auto-assurerates.svg" 
                      alt="AssureRates Home" 
                      width={180} 
                      height={80}
                      className="h-10 md:h-12 w-auto"
                    />
                  </div>
                </div>
              </div>

              {/* Home Content */}
              <div className="p-5 md:p-6">
                <h3 className="text-xl md:text-2xl font-bold text-[#246a99] mb-3 font-sans text-center">
                  AssureRates Home Insurance
                </h3>
                
                <p className="text-gray-600 mb-4 text-sm md:text-base leading-relaxed text-center">
                  Protect your biggest investment with comprehensive home insurance. 
                  Get instant quotes and save on your home protection coverage.
                </p>

                {/* Mobile: Stacked layout */}
                <div className="block sm:hidden space-y-4">
                  <input
                    type="text"
                    placeholder={isLoadingLocation ? 'Detecting your location...' : 'Zip Code e.g. 11102'}
                    value={homeZipCode}
                    onChange={(e) => {
                      const value = e.target.value
                      if (/^\d{0,5}$/.test(value)) {
                        setHomeZipCode(value)
                        if (homeZipCodeError) {
                          setHomeZipCodeError('')
                        }
                      }
                    }}
                    onBlur={() => {
                      const validation = validateZipCode(homeZipCode)
                      if (!validation.valid) {
                        setHomeZipCodeError(validation.error || '')
                      } else {
                        setHomeZipCodeError('')
                      }
                    }}
                    onKeyPress={handleHomeKeyPress}
                    disabled={isLoadingLocation}
                    className={`w-full px-4 py-4 text-gray-900 text-[18px] font-[600] rounded-lg border transition-all duration-200 h-14 bg-white focus:outline-none focus:ring-2 ${
                      homeZipCodeError
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-orange-400 focus:border-orange-400'
                    } ${
                      isLoadingLocation ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  />
                  {homeZipCodeError && (
                    <p className="mt-2 text-sm text-red-600 font-medium">{homeZipCodeError}</p>
                  )}
                  <button 
                    onClick={handleHomeContinue}
                    disabled={isLoadingLocation || !validateZipCode(homeZipCode).valid}
                    className={`w-full px-4 py-4 rounded-lg font-[600] transition-all duration-200 flex items-center justify-center gap-2 text-[18px] h-14 text-white ${
                      isLoadingLocation || !validateZipCode(homeZipCode).valid
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
                <div className="hidden sm:block">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={isLoadingLocation ? 'Detecting your location...' : 'Zip Code e.g. 11102'}
                      value={homeZipCode}
                      onChange={(e) => {
                        const value = e.target.value
                        if (/^\d{0,5}$/.test(value)) {
                          setHomeZipCode(value)
                          if (homeZipCodeError) {
                            setHomeZipCodeError('')
                          }
                        }
                      }}
                      onBlur={() => {
                        const validation = validateZipCode(homeZipCode)
                        if (!validation.valid) {
                          setHomeZipCodeError(validation.error || '')
                        } else {
                          setHomeZipCodeError('')
                        }
                      }}
                      onKeyPress={handleHomeKeyPress}
                      disabled={isLoadingLocation}
                      className={`w-full px-4 py-4 pr-32 text-gray-900 text-[18px] font-[600] rounded-lg border transition-all duration-200 h-18 bg-white focus:outline-none focus:ring-2 ${
                        homeZipCodeError
                          ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                          : 'border-gray-300 focus:ring-orange-400 focus:border-orange-400'
                      } ${
                        isLoadingLocation ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    />
                    <button 
                      onClick={handleHomeContinue}
                      disabled={isLoadingLocation || !validateZipCode(homeZipCode).valid}
                      className={`absolute right-0 top-0 px-14 py-2 rounded-r-lg font-[600] transition-all duration-200 flex items-center gap-2 text-[18px] h-18 text-white ${
                        isLoadingLocation || !validateZipCode(homeZipCode).valid
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
                  {homeZipCodeError && (
                    <p className="mt-2 text-sm text-red-600 font-medium">{homeZipCodeError}</p>
                  )}
                </div>

                {/* Fact/Stat */}
                <div className="bg-blue-50 rounded-lg p-4 mt-4 border-2 border-blue-200">
                  <p className="text-xs md:text-sm font-bold text-blue-900 mb-1 text-center">
                    💡 Did You Know?
                  </p>
                  <p className="text-sm md:text-base text-blue-800 text-center font-semibold">
                    Over 50,000 homes protected with our comprehensive coverage
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
