import Link from 'next/link'
import React from 'react'
import Image from 'next/image'

const Navbar = () => {
    return (
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center items-center h-20">
              <div className="flex-shrink-0">
                <Link href="/" className="block">
                  <Image
                    src="/logo.svg"
                    alt="AssureRates Logo"
                    width={180}
                    height={40}
                    priority
                    quality={90}
                    loading="eager"
                    className="h-auto w-60 cursor-pointer"
                  />
                </Link>
              </div>
            </div>
          </div>
        </nav>
      )
}

export default Navbar