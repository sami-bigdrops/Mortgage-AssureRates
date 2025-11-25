'use client'

import React from 'react'

interface ZipCodeInputProps {
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

const ZipCodeInput: React.FC<ZipCodeInputProps> = ({
  id,
  label,
  value,
  onChange,
  onBlur,
  placeholder = '12345',
  required = false,
  className = '',
  error
}) => {
  const handleChange = (inputValue: string) => {
    // Only allow digits and max 5 characters
    const numericValue = inputValue.replace(/\D/g, '').slice(0, 5)
    onChange(numericValue)
  }

  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="block text-base font-semibold text-gray-700 mb-3">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        type="text"
        id={id}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        maxLength={5}
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

export default ZipCodeInput
