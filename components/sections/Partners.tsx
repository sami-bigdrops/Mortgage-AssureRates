import React from 'react'
import Image from 'next/image'

const Partners = () => {

    const partner = [
        {
            name: 'Amerisave',
            image: '/amerisave-logo.svg'
        },
        {
            name: 'Veterans First Mortgage',
            image: '/veterans-logo.svg'
        },
        {
            name: 'Mutual of Omaha',
            image: '/mutual-logo.svg'
        },
        {
            name: 'Loan Depot',
            image: '/loandepot-logo.svg'
        },
    ]

  return (
    <div className='w-full py-0 pt-40 md:pt-20 pb-16 lg:pb-0 lg:pt-0 lg:py-16 min-h-content flex flex-col relative'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <h2 className='text-lg font-base text-center'>We Partner With Top Providers</h2>
        </div>
        <div className='w-full max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4'>
            {partner.map((partner) => (
                <div key={partner.name} className='flex flex-col items-center justify-center'>
                    <Image 
                        src={partner.image} 
                        alt={partner.name} 
                        width={50} 
                        height={10} 
                        className='w-45 h-45 object-contain'
                        loading="lazy"
                    />
                </div>
            ))}
        </div>
    </div>
  )
}

export default Partners