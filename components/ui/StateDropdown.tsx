'use client'

import React from 'react'
import CustomDropdown from './CustomDropdown'

export interface USState {
  id: string
  label: string
}

const usStates: USState[] = [
  { id: 'AL', label: 'Alabama' },
  { id: 'AK', label: 'Alaska' },
  { id: 'AZ', label: 'Arizona' },
  { id: 'AR', label: 'Arkansas' },
  { id: 'CA', label: 'California' },
  { id: 'CO', label: 'Colorado' },
  { id: 'CT', label: 'Connecticut' },
  { id: 'DE', label: 'Delaware' },
  { id: 'FL', label: 'Florida' },
  { id: 'GA', label: 'Georgia' },
  { id: 'HI', label: 'Hawaii' },
  { id: 'ID', label: 'Idaho' },
  { id: 'IL', label: 'Illinois' },
  { id: 'IN', label: 'Indiana' },
  { id: 'IA', label: 'Iowa' },
  { id: 'KS', label: 'Kansas' },
  { id: 'KY', label: 'Kentucky' },
  { id: 'LA', label: 'Louisiana' },
  { id: 'ME', label: 'Maine' },
  { id: 'MD', label: 'Maryland' },
  { id: 'MA', label: 'Massachusetts' },
  { id: 'MI', label: 'Michigan' },
  { id: 'MN', label: 'Minnesota' },
  { id: 'MS', label: 'Mississippi' },
  { id: 'MO', label: 'Missouri' },
  { id: 'MT', label: 'Montana' },
  { id: 'NE', label: 'Nebraska' },
  { id: 'NV', label: 'Nevada' },
  { id: 'NH', label: 'New Hampshire' },
  { id: 'NJ', label: 'New Jersey' },
  { id: 'NM', label: 'New Mexico' },
  { id: 'NY', label: 'New York' },
  { id: 'NC', label: 'North Carolina' },
  { id: 'ND', label: 'North Dakota' },
  { id: 'OH', label: 'Ohio' },
  { id: 'OK', label: 'Oklahoma' },
  { id: 'OR', label: 'Oregon' },
  { id: 'PA', label: 'Pennsylvania' },
  { id: 'RI', label: 'Rhode Island' },
  { id: 'SC', label: 'South Carolina' },
  { id: 'SD', label: 'South Dakota' },
  { id: 'TN', label: 'Tennessee' },
  { id: 'TX', label: 'Texas' },
  { id: 'UT', label: 'Utah' },
  { id: 'VT', label: 'Vermont' },
  { id: 'VA', label: 'Virginia' },
  { id: 'WA', label: 'Washington' },
  { id: 'WV', label: 'West Virginia' },
  { id: 'WI', label: 'Wisconsin' },
  { id: 'WY', label: 'Wyoming' }
]

interface StateDropdownProps {
  id: string
  label?: string
  placeholder?: string
  value: string // Stores the state ID (e.g., 'CA')
  onChange: (stateId: string) => void // Returns the state ID
  required?: boolean
  className?: string
}

const StateDropdown: React.FC<StateDropdownProps> = ({
  id,
  label = 'State',
  placeholder = 'Choose a state...',
  value,
  onChange,
  required = false,
  className = ''
}) => {
  // Convert state ID to label for display
  const displayValue = value 
    ? usStates.find(state => state.id === value)?.label || ''
    : ''

  const handleChange = (selectedLabel: string) => {
    const selectedState = usStates.find(state => state.label === selectedLabel)
    if (selectedState) {
      onChange(selectedState.id)
    }
  }

  return (
    <CustomDropdown
      id={id}
      label={label}
      placeholder={placeholder}
      value={displayValue}
      options={usStates.map(state => state.label)}
      onChange={handleChange}
      required={required}
      searchable={true}
      className={className}
    />
  )
}

export { usStates }
export default StateDropdown
