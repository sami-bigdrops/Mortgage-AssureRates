import React from 'react'
import { Star, BadgeCheck } from 'lucide-react'

const Testimonials = () => {
    const testimonials = [
        {
            name: 'Sarah M.',
            address: 'Austin, Texas',
            date: 'September 2025',
            rating: 5,
            testimonial: 'I was skeptical at first, but within 10 minutes I found out I could save $847 per month by refinancing. The whole process was straightforward and the team walked me through every step. Already saved over $5,000 in just 6 months!',
            verified: true
        },
        {
            name: 'Michael R.',
            address: 'Portland, Oregon',
            date: 'August 2025',
            rating: 5,
            testimonial: 'As a first-time homebuyer, I had no idea I was overpaying on my mortgage insurance. They found me a better rate and now I\'m saving $1,200 a month. That\'s an extra vacation every year! Highly recommend checking your mortgage.',
            verified: true
        },
        {
            name: 'Jennifer L.',
            address: 'Phoenix, Arizona',
            date: 'October 2025',
            rating: 5,
            testimonial: 'I\'ve had my mortgage for 8 years and thought I had a good deal. Turns out I was leaving money on the table. They helped me refinance and I\'m now saving $965 monthly. The process took less than 3 weeks from start to finish.',
            verified: true
        }
    ]
    
    return (
        <div className='w-full py-16 bg-[#F7F7F7]'>
            <div className='w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                <h2 className='text-3xl sm:text-4xl lg:text-5xl font-bold text-[#246a99] text-center mb-12'>
                    What Our Customers Say
                </h2>
                
                {/* Desktop Grid */}
                <div className='hidden lg:grid grid-cols-3 gap-8 w-full'>
                    {testimonials.map((testimonial, index) => (
                        <article key={index} className='bg-white rounded-lg p-6 shadow-sm border border-gray-200 flex flex-col min-h-[280px]'>
                            <div className='flex items-center justify-between mb-3'>
                                <div className='flex gap-1'>
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} className='w-5 h-5 fill-amber-400 text-amber-400' />
                                    ))}
                                </div>
                                {testimonial.verified && (
                                    <BadgeCheck className='w-5 h-5 text-blue-500' />
                                )}
                            </div>
                            <blockquote className='text-gray-800 text-base leading-relaxed mb-6 flex-grow'>
                                &ldquo;{testimonial.testimonial}&rdquo;
                            </blockquote>
                            <footer className='text-sm mt-auto border-t border-gray-100 pt-4'>
                                <div className='flex items-start justify-between'>
                                    <div>
                                        <p className='font-semibold text-gray-900'>{testimonial.name}</p>
                                        <p className='text-gray-600'>{testimonial.address}</p>
                                    </div>
                                    <div className='text-right'>
                                        <p className='text-xs text-gray-500'>{testimonial.date}</p>
                                        {testimonial.verified && (
                                            <p className='text-xs text-blue-600 font-medium mt-1'>Verified Customer</p>
                                        )}
                                    </div>
                                </div>
                            </footer>
                        </article>
                    ))}
                </div>

                {/* Mobile/Tablet Horizontal Scroll */}
                <div className='lg:hidden overflow-x-auto scrollbar-hide w-full'>
                    <div className='flex gap-6 pb-4' style={{ width: 'max-content' }}>
                        {testimonials.map((testimonial, index) => (
                            <article key={index} className='bg-white rounded-lg p-6 shadow-sm border border-gray-200 min-w-[300px] max-w-[350px] flex-shrink-0 flex flex-col min-h-[280px]'>
                                <div className='flex items-center justify-between mb-3'>
                                    <div className='flex gap-1'>
                                        {[...Array(testimonial.rating)].map((_, i) => (
                                            <Star key={i} className='w-5 h-5 fill-amber-400 text-amber-400' />
                                        ))}
                                    </div>
                                    {testimonial.verified && (
                                        <BadgeCheck className='w-5 h-5 text-blue-500' />
                                    )}
                                </div>
                                <blockquote className='text-gray-800 text-base leading-relaxed mb-6 flex-grow'>
                                    &ldquo;{testimonial.testimonial}&rdquo;
                                </blockquote>
                                <footer className='text-sm mt-auto'>
                                    <p className='font-semibold text-gray-900'>{testimonial.name}</p>
                                    <p className='text-gray-600'>{testimonial.address}</p>
                                </footer>
                            </article>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Testimonials