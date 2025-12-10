'use client'

import React, { useEffect, useRef, useState } from 'react'

interface AddressInputProps {
  id: string
  label?: string
  value: string
  onChange: (value: string) => void
  onAddressSelect?: (address: string, city: string, state: string) => void
  onBlur?: () => void
  placeholder?: string
  required?: boolean
  className?: string
  error?: string
}

interface AutocompleteInstance {
  getPlace: () => {
    address_components?: Array<{
      long_name: string
      short_name: string
      types: string[]
    }>
    formatted_address?: string
  }
  addListener: (event: string, callback: () => void) => void
}

interface GoogleMapsPlaces {
  Autocomplete: {
    new (input: HTMLInputElement, options?: { types?: string[], componentRestrictions?: { country: string } }): AutocompleteInstance
  }
}

interface GoogleMaps {
  maps: {
    places: GoogleMapsPlaces
  }
}

declare global {
  interface Window {
    google?: GoogleMaps
  }
}

const AddressInput: React.FC<AddressInputProps> = ({
  id,
  label,
  value,
  onChange,
  onAddressSelect,
  onBlur,
  placeholder,
  required = false,
  className = '',
  error
}) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<AutocompleteInstance | null>(null)
  const [isScriptLoaded, setIsScriptLoaded] = useState(false)
  const isPlaceSelectingRef = useRef(false)

  useEffect(() => {
    // Load Google Places API script
    if (typeof window !== 'undefined') {
      if (window.google && window.google.maps && window.google.maps.places) {
        setIsScriptLoaded(true)
      } else {
        // Check if script is already being loaded
        const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`)
        if (existingScript) {
          // Script exists, wait for it to load
          const checkGoogle = setInterval(() => {
            if (window.google && window.google.maps && window.google.maps.places) {
              setIsScriptLoaded(true)
              clearInterval(checkGoogle)
            }
          }, 100)
          return () => clearInterval(checkGoogle)
        } else {
          // Load the script
          const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY
          if (!apiKey) {
            console.warn('Google Places API key not found. Please set NEXT_PUBLIC_GOOGLE_PLACES_API_KEY in your environment variables.')
            return
          }
          
          const script = document.createElement('script')
          script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
          script.async = true
          script.defer = true
          script.onload = () => {
            setIsScriptLoaded(true)
          }
          script.onerror = () => {
            console.error('Failed to load Google Places API script')
          }
          document.head.appendChild(script)
        }
      }
    }
  }, [])

  useEffect(() => {
    if (isScriptLoaded && inputRef.current && !autocompleteRef.current && window.google) {
      // Initialize Google Places Autocomplete
      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        inputRef.current,
        {
          types: ['address'],
          componentRestrictions: { country: 'us' }
        }
      )

      // Listen for place selection
      const autocomplete = autocompleteRef.current
      autocomplete.addListener('place_changed', () => {
        if (!autocomplete) return
        
        // Set flag to prevent blur validation
        isPlaceSelectingRef.current = true
        
        const place = autocomplete.getPlace()
        
        if (place && place.address_components) {
          let streetAddress = ''
          let city = ''
          let state = ''

          // Parse address components
          for (const component of place.address_components) {
            const componentType = component.types[0]

            switch (componentType) {
              case 'street_number':
                streetAddress = component.long_name + ' '
                break
              case 'route':
                streetAddress += component.long_name
                break
              case 'locality':
                city = component.long_name
                break
              case 'administrative_area_level_1':
                state = component.short_name
                break
            }
          }

          // If street_number and route are separate, combine them
          if (!streetAddress.trim()) {
            // Fallback: use formatted_address and extract street
            const formattedAddress = place.formatted_address || ''
            const addressParts = formattedAddress.split(',')
            streetAddress = addressParts[0] || ''
          }

          // Update the input value
          onChange(streetAddress.trim())

          // Call onAddressSelect callback with parsed data
          if (onAddressSelect && city && state) {
            onAddressSelect(streetAddress.trim(), city, state)
          }
          
          // Reset flag after a short delay to allow validation to run on next blur
          setTimeout(() => {
            isPlaceSelectingRef.current = false
          }, 100)
        } else {
          isPlaceSelectingRef.current = false
        }
      })
    }
  }, [isScriptLoaded, onChange, onAddressSelect])

  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="block text-base font-semibold text-gray-700 mb-3">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        ref={inputRef}
        type="text"
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => {
          // Only trigger validation if we're not in the middle of selecting a place
          if (!isPlaceSelectingRef.current && onBlur) {
            // Small delay to ensure place selection completes
            setTimeout(() => {
              if (!isPlaceSelectingRef.current) {
                onBlur()
              }
            }, 150)
          }
        }}
        placeholder={placeholder}
        required={required}
        className={`w-full px-4 py-4 text-base border-2 rounded-xl
          focus:outline-none focus:ring-2 transition-all duration-200 font-medium
          ${
            error
              ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
              : 'border-gray-300 focus:ring-[#3498DB] focus:border-transparent'
          }`}
      />
      {error && (
        <p className="mt-2 text-sm text-red-600 font-medium">{error}</p>
      )}
    </div>
  )
}

export default AddressInput

