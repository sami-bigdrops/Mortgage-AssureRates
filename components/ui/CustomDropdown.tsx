'use client'

import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, Search, Check } from 'lucide-react'

interface CustomDropdownProps {
  id: string
  label?: string
  placeholder?: string
  value: string
  options: string[]
  onChange: (value: string) => void
  required?: boolean
  searchable?: boolean
  disabled?: boolean
  className?: string
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  id,
  label,
  placeholder = 'Select an option...',
  value,
  options,
  onChange,
  required = false,
  searchable = true,
  disabled = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchQuery('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen, searchable])

  // Filter options based on search query
  const filteredOptions = searchable
    ? options.filter(option =>
        option.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options

  const handleSelect = (option: string) => {
    onChange(option)
    setIsOpen(false)
    setSearchQuery('')
  }

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen)
    }
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label 
          htmlFor={id} 
          className="block text-base font-semibold text-gray-700 mb-3"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Dropdown Button */}
      <button
        type="button"
        id={id}
        onClick={toggleDropdown}
        disabled={disabled}
        className={`
          w-full px-4 py-4 text-base border-2 rounded-xl 
          focus:outline-none focus:ring-2 focus:ring-[#3498DB] focus:border-transparent
          transition-all duration-200 text-left flex items-center justify-between
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white cursor-pointer hover:border-[#3498DB]'}
          ${isOpen ? 'border-[#3498DB] ring-2 ring-[#3498DB]' : 'border-gray-300'}
          ${value ? 'text-gray-900 font-medium' : 'text-gray-500'}
        `}
      >
        <span className="truncate">
          {value || placeholder}
        </span>
        <ChevronDown 
          className={`ml-2 flex-shrink-0 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          size={20}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border-2 border-[#3498DB] rounded-xl shadow-2xl max-h-[320px] overflow-hidden">
          {/* Search Input */}
          {searchable && (
            <div className="sticky top-0 bg-white p-3 border-b border-gray-200">
              <div className="relative">
                <Search 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3498DB] focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Options List */}
          <div className="overflow-y-auto max-h-[240px]">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleSelect(option)}
                  className={`
                    w-full px-4 py-3 text-left text-base transition-colors duration-150
                    flex items-center justify-between group
                    ${value === option
                      ? 'bg-blue-50 text-[#246a99] font-semibold'
                      : 'text-gray-700 hover:bg-blue-50 hover:text-[#3498DB]'
                    }
                  `}
                >
                  <span>{option}</span>
                  {value === option && (
                    <Check 
                      className="text-[#3498DB] flex-shrink-0"
                      size={18}
                    />
                  )}
                </button>
              ))
            ) : (
              <div className="px-4 py-6 text-center text-gray-500 text-sm">
                No results found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default CustomDropdown

