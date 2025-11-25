'use client'

import React from 'react'

interface PhoneInputProps {
  id: string
  label?: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  placeholder?: string
  required?: boolean
  className?: string
  error?: string
}

const formatPhoneNumber = (value: string): string => {
  // Remove all non-digits
  const phoneNumber = value.replace(/\D/g, '')
  
  // Don't format if empty
  if (!phoneNumber) return ''
  
  // Format as (XXX) XXX-XXXX
  if (phoneNumber.length <= 3) {
    return `(${phoneNumber}`
  } else if (phoneNumber.length <= 6) {
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`
  } else {
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`
  }
}

const PhoneInput: React.FC<PhoneInputProps> = ({
  id,
  label,
  value,
  onChange,
  onBlur,
  placeholder = '(123) 456-7890',
  required = false,
  className = '',
  error
}) => {
  const handleChange = (inputValue: string) => {
    const formatted = formatPhoneNumber(inputValue)
    onChange(formatted)
  }

  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="block text-base font-semibold text-gray-700 mb-3">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        type="tel"
        id={id}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        maxLength={14}
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

export default PhoneInput
