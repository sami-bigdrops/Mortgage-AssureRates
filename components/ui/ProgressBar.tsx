'use client'

import React, { ReactNode } from 'react'
import MotivationalQuote from './MotivationalQuote'

interface ProgressBarProps {
  currentStep: number
  totalSteps: number
  icon: ReactNode
  formType?: 'buy-home' | 'refinance'
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  currentStep,
  totalSteps,
  icon,
  formType = 'buy-home'
}) => {
  const percentage = Math.max(0, Math.min((currentStep / totalSteps) * 100, 100))

  return (
    <div className="mb-8 md:mb-12">
      <div className="flex items-center justify-center mb-4">
        <MotivationalQuote step={currentStep} formType={formType} />
      </div>
      <div className="relative w-full bg-gray-200 rounded-full h-3">
        <div 
          className="bg-[#3498DB] h-3 rounded-full transition-all duration-300 relative"
          style={{ width: `${percentage}%` }}
        />
        {/* Icon with background circle */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 flex items-center justify-center transition-all duration-300 z-10"
          style={{ left: `calc(${percentage}% - 18px)` }}
        >
          <div className="bg-white rounded-full p-2 shadow-lg border-2 border-[#3498DB] flex items-center justify-center">
            {icon}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center mt-3">
        <span className="text-sm md:text-base font-semibold text-[#246a99]">
          {Math.round(percentage)}% Complete
        </span>
      </div>
    </div>
  )
}

export default ProgressBar

