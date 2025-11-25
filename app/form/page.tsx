'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { Home, ArrowRight, Banknote } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import BuyHome from '@/app/form/products/BuyHome'
import Refinance from '@/app/form/products/Refinance'

function FormContent() {
  const searchParams = useSearchParams()
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    const product = searchParams.get('product')
    if (product === 'buy-home') {
      setSelectedOption('buy-home')
      setShowForm(true)
    } else if (product === 'refinance') {
      setSelectedOption('refinance')
      setShowForm(true)
    }
  }, [searchParams])

  const options = [
    {
      id: 'buy-home',
      title: 'Buy A Home',
      icon: Home,
    },
    {
      id: 'refinance',
      title: 'Refinance',
      icon: Banknote,
    },
  ]

  const selectionScreen = (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 px-4 pt-12 md:pt-24 pb-8 md:pb-12">
      <div className="w-full max-w-5xl mx-auto">
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-center text-[#246a99] mb-8 md:mb-16 font-sans">
          I&apos;m looking to:
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mb-8 md:mb-12 max-w-4xl mx-auto">
          {options.map((option) => {
            const Icon = option.icon
            const isSelected = selectedOption === option.id

            return (
              <button
                key={option.id}
                onClick={() => setSelectedOption(option.id)}
                className={`
                  relative p-6 md:p-10 rounded-2xl md:rounded-3xl border-2 transition-all duration-300 transform
                  flex flex-col items-center justify-center gap-4 md:gap-8
                  min-h-[200px] md:min-h-[280px] group
                  ${
                    isSelected
                      ? 'border-[#3498DB] bg-gradient-to-br from-blue-50 to-white shadow-xl md:shadow-2xl scale-105 ring-2 md:ring-4 ring-blue-100'
                      : 'border-gray-200 bg-white hover:border-[#3498DB] hover:shadow-xl md:hover:shadow-2xl hover:scale-105 hover:bg-gradient-to-br hover:from-blue-50 hover:to-white'
                  }
                `}
              >
                <div
                  className={`
                    p-5 md:p-8 rounded-full transition-all duration-300 shadow-md
                    ${
                      isSelected
                        ? 'bg-[#3498DB] text-white scale-110 shadow-blue-200'
                        : 'bg-gradient-to-br from-gray-100 to-gray-50 text-[#246a99] group-hover:bg-gradient-to-br group-hover:from-blue-100 group-hover:to-blue-50 group-hover:text-[#3498DB] group-hover:scale-110 group-hover:shadow-lg'
                    }
                  `}
                >
                  <Icon size={40} strokeWidth={1.5} className="md:w-14 md:h-14" />
                </div>

                <h3
                  className={`
                    text-lg md:text-2xl font-bold transition-colors duration-300
                    ${
                      isSelected
                        ? 'text-[#246a99]'
                        : 'text-gray-800 group-hover:text-[#3498DB]'
                    }
                  `}
                >
                  {option.title}
                </h3>
              </button>
            )
          })}
        </div>

        <div className="flex justify-center mt-8 md:mt-16">
          <button
            disabled={!selectedOption}
            onClick={() => {
              if (selectedOption) {
                setShowForm(true)
              }
            }}
            className={`
              px-8 md:px-10 py-4 md:py-5 rounded-lg md:rounded-xl font-bold text-base md:text-lg
              flex items-center gap-2 md:gap-3 transition-all duration-300 
              ${
                selectedOption
                  ? 'bg-[#3498DB] text-white hover:bg-[#246a99] shadow-lg hover:shadow-2xl hover:scale-110 cursor-pointer'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50'
              }
            `}
          >
            Next Step
            <ArrowRight size={20} strokeWidth={2.5} className="md:w-[22px] md:h-[22px]" />
          </button>
        </div>
      </div>
    </div>
  )

  // Show forms based on selection
  if (showForm && selectedOption === 'buy-home') {
    return <BuyHome />
  }

  if (showForm && selectedOption === 'refinance') {
    return <Refinance />
  }

  // Show selection screen
  return selectionScreen
}

export default function Form() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-[#246a99] text-xl font-semibold">Loading...</div>
      </div>
    }>
      <FormContent />
    </Suspense>
  )
}