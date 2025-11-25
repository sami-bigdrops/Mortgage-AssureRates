'use client'

import React, { useState, useEffect } from 'react'

interface RangeSliderProps {
  id: string
  label?: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  formatValue?: (value: number) => string
  required?: boolean
  className?: string
}

const RangeSlider: React.FC<RangeSliderProps> = ({
  id,
  label,
  value,
  onChange,
  min = 50000,
  max = 2000000,
  step = 5000,
  formatValue = (val) => `$${val.toLocaleString()}`,
  required = false,
  className = ''
}) => {
  const [currentValue, setCurrentValue] = useState(value)

  useEffect(() => {
    setCurrentValue(value)
  }, [value])

  // Calculate the appropriate step based on the current value
  const getStep = (val: number) => {
    if (val <= 195000) return 5000
    if (val <= 400000) return 10000
    if (val <= 1000000) return 20000
    return 250000
  }

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value)
    
    // Only apply smart stepping for large values (home values)
    if (max > 100000) {
      // Adjust to appropriate step for home values
      const currentStep = getStep(newValue)
      const adjustedValue = Math.round(newValue / currentStep) * currentStep
      setCurrentValue(adjustedValue)
      onChange(adjustedValue)
    } else {
      // For percentages or smaller values (including decimals), round to step precision
      // Handle floating point precision by rounding to appropriate decimal places
      const stepPrecision = step < 1 ? (step.toString().split('.')[1]?.length || 0) : 0
      const adjustedValue = Math.round((newValue / step)) * step
      const roundedValue = stepPrecision > 0 ? parseFloat(adjustedValue.toFixed(stepPrecision)) : adjustedValue
      setCurrentValue(roundedValue)
      onChange(roundedValue)
    }
  }

  // Calculate percentage for slider fill
  const percentage = ((currentValue - min) / (max - min)) * 100

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label 
          htmlFor={id} 
          className="block text-base font-semibold text-gray-700 mb-3"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Value Display */}
      <div className="mb-6">
        <div className="text-3xl md:text-4xl font-bold text-[#246a99] text-center">
          {formatValue(currentValue)}
        </div>
      </div>

      {/* Slider Container */}
      <div className="relative mb-2">
        <input
          type="range"
          id={id}
          min={min}
          max={max}
          step={step}
          value={currentValue}
          onChange={handleSliderChange}
          className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-6
            [&::-webkit-slider-thumb]:h-6
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-[#3498DB]
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:shadow-lg
            [&::-webkit-slider-thumb]:transition-all
            [&::-webkit-slider-thumb]:duration-200
            [&::-webkit-slider-thumb]:hover:scale-110
            [&::-webkit-slider-thumb]:hover:bg-[#246a99]
            [&::-moz-range-thumb]:w-6
            [&::-moz-range-thumb]:h-6
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-[#3498DB]
            [&::-moz-range-thumb]:border-0
            [&::-moz-range-thumb]:cursor-pointer
            [&::-moz-range-thumb]:shadow-lg
            [&::-moz-range-thumb]:transition-all
            [&::-moz-range-thumb]:duration-200
            [&::-moz-range-thumb]:hover:scale-110
            [&::-moz-range-thumb]:hover:bg-[#246a99]
          "
          style={{
            background: `linear-gradient(to right, #3498DB 0%, #3498DB ${percentage}%, #E5E7EB ${percentage}%, #E5E7EB 100%)`
          }}
        />
      </div>

      {/* Min and Max Labels */}
      <div className="flex justify-between text-sm text-gray-600 mt-2">
        <span>{formatValue(min)}</span>
        <span>{formatValue(max)}</span>
      </div>
    </div>
  )
}

export default RangeSlider

