'use client'

import React from 'react'

export interface RadioOption {
  id: string
  label: string
}

interface RadioButtonGroupProps {
  label?: string
  options: RadioOption[]
  value: string
  onChange: (value: string) => void
  required?: boolean
  columns?: 1 | 2
  className?: string
}

const RadioButtonGroup: React.FC<RadioButtonGroupProps> = ({
  label,
  options,
  value,
  onChange,
  required = false,
  columns = 1,
  className = ''
}) => {
  const gridCols = columns === 2 ? 'grid-cols-2' : 'grid-cols-1'

  return (
    <div className={className}>
      {label && (
        <label className="block text-base font-semibold text-gray-700 mb-4">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className={`grid ${gridCols} gap-3`}>
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={`
              w-full px-6 py-4 rounded-xl font-semibold text-base
              border-2 transition-all duration-200
              ${
                columns === 2 ? 'text-center' : 'text-left'
              }
              ${
                value === option.id
                  ? 'bg-blue-50 border-[#3498DB] text-[#246a99] ring-2 ring-blue-100'
                  : 'bg-white border-gray-300 text-gray-700 hover:border-[#3498DB] hover:bg-blue-50'
              }
            `}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default RadioButtonGroup
