import React from 'react'
import { DollarSign, Clock, TrendingUp } from 'lucide-react'
import Link from 'next/link'

const Features = () => {

  const features = [
    {
      icon: DollarSign,
      title: 'Clients save $1,200 a month on average.',
      description: 'Our platform helps you discover hidden savings opportunities in your mortgage.'
    },
    {
      icon: Clock,
      title: '95% of clients discover savings in minutes.',
      description: 'Quick analysis that shows you exactly where you can save on your mortgage payments.'
    },
    {
      icon: TrendingUp,
      title: 'Over $34 million in client savings the last 2 months.',
      description: 'Join thousands of satisfied clients who are already saving big on their mortgages.'
    }
  ]
  
  return (
    <div className="w-full px-4 sm:px-6 lg:px-10 py-0 md:py-10 lg:py-12">
      <div className="w-full max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl text-[#246a99] font-bold mb-4">
            Save Big, Get Cash Quickly
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Discover how much you can save on your mortgage with our simple, fast, and transparent process.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div 
                key={index} 
                className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-[#e8f4f4] p-3 rounded-lg flex-shrink-0">
                    <Icon className="w-6 h-6 text-[#3b9b9b]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Features