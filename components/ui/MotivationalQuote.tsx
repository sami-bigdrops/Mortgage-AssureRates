'use client'

import React from 'react'

interface MotivationalQuoteProps {
  step: number
  formType?: 'buy-home' | 'refinance'
}

const MotivationalQuote: React.FC<MotivationalQuoteProps> = ({ step, formType = 'buy-home' }) => {
  const buyHomeQuotes = [
    // Quotes for steps 1-5 (first 5 steps)
    {
      text: "You're making great progress! Every answer brings you closer to owning your dream home. Keep it up!",
    },
    // Quotes for steps 6-10 (next 5 steps)
    {
      text: "Excellent work! You're more than halfway there. Your future home is waiting for you - let's finish strong!",
    },
    // Quotes for steps 11-15 (next 5 steps)
    {
      text: "You're almost at the finish line! Just a couple more steps and you'll be one step closer to getting the keys to your new home!",
    },
    // Quotes for step 16
    {
      text: "Final stretch! Your dream home is just moments away. You're doing amazing!",
    },
    // Quote for step 17 (final step)
    {
      text: "Last step! You're about to submit your information and get one step closer to your dream home. You've got this!",
    }
  ]

  const refinanceQuotes = [
    // Quotes for steps 1-5 (first 5 steps)
    {
      text: "You're off to a great start! Every detail you provide helps us find you the best refinance options. Keep going!",
    },
    // Quotes for steps 6-10 (next 5 steps)
    {
      text: "Great progress! You're unlocking better rates and terms. The savings are worth it - let's keep moving forward!",
    },
    // Quotes for steps 11-15 (next 5 steps)
    {
      text: "Almost there! Just a few more questions and we'll be able to show you amazing refinance opportunities that could save you money!",
    },
    // Quotes for steps 16-19 (next steps)
    {
      text: "You're in the final stretch! Just a couple more details and you'll be one step closer to better mortgage terms!",
    },
    // Quote for step 20 (final step)
    {
      text: "Last step! You're about to submit your information and unlock potential savings. You've got this!",
    }
  ]

  const quotes = formType === 'refinance' ? refinanceQuotes : buyHomeQuotes

  // Determine which quote set to show based on step range and form type
  let quoteIndex = 0
  if (formType === 'refinance') {
    // Refinance: 20 steps total
    if (step >= 1 && step <= 5) {
      quoteIndex = 0
    } else if (step >= 6 && step <= 10) {
      quoteIndex = 1
    } else if (step >= 11 && step <= 15) {
      quoteIndex = 2
    } else if (step >= 16 && step <= 19) {
      quoteIndex = 3
    } else if (step === 20) {
      quoteIndex = 4 // Final step quote for refinance
    }
  } else {
    // BuyHome: 17 steps total
    if (step >= 1 && step <= 5) {
      quoteIndex = 0
    } else if (step >= 6 && step <= 10) {
      quoteIndex = 1
    } else if (step >= 11 && step <= 15) {
      quoteIndex = 2
    } else if (step === 16) {
      quoteIndex = 3
    } else if (step === 17) {
      quoteIndex = 4 // Final step quote for buy-home
    }
  }

  const quote = quotes[quoteIndex]

  return (
    <div className="w-full max-w-xl px-4 mx-auto">
      <p className="text-xs md:text-sm font-medium text-[#246a99] leading-relaxed text-center" style={{ wordBreak: 'normal', overflowWrap: 'break-word' }}>
        {quote.text}
      </p>
    </div>
  )
}

export default MotivationalQuote

