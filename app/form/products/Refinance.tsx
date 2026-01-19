'use client'

import React, { useState, useEffect, useCallback } from 'react'
import TrustedForm from '@/components/trustedForm'
import { ArrowLeft, DollarSign, Loader2 } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { RadioButtonGroup, RangeSlider, TextInput, AddressInput, StateDropdown, PhoneInput, type RadioOption } from '@/components/ui'
import ProgressBar from '@/components/ui/ProgressBar'
import { validateZipCode, validateEmail, validateName, validateAddress, validateCity, validatePhoneNumber } from '@/utils/validation'
import Link from 'next/link'

const Refinance = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isInitialized, setIsInitialized] = useState(false)
  const [trustedFormCertUrl, setTrustedFormCertUrl] = useState("")
  const [formData, setFormData] = useState({
    productType: 'PP_REFI',
    zipCode: '',
    propertyType: '',
    propertyPurpose: '',
    creditGrade: '',
    estimatedHomeValue: 250000,
    mortgageBalance: 0,
    firstMortgageInterest: 5.25,
    secondMortgage: '',
    secondMortgageBalance: 0,
    secondMortgageInterest: 6,
    additionalCash: 0,
    loanType: '',
    bankruptcyOrForeclosure: '',
    currentlyEmployed: '',
    lateMortgagePayments: '',
    veteranStatus: '',
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    addressState: '',
    phoneNumber: '',
  })

  // Load form data and current step from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && !isInitialized) {
      try {
        const savedFormData = localStorage.getItem('refinance_form_data')
        const savedCurrentStep = localStorage.getItem('refinance_current_step')
        
        if (savedFormData) {
          const parsedData = JSON.parse(savedFormData)
          setFormData(prev => ({ ...prev, ...parsedData }))
        }
        
        // Check URL params for zip_code if not in saved data
        const urlZip = searchParams.get('zip_code')
        if (urlZip && urlZip.length === 5) {
          setFormData(prev => {
            // Only update if zipCode is empty or different
            if (!prev.zipCode || prev.zipCode !== urlZip) {
              return { ...prev, zipCode: urlZip }
            }
            return prev
          })
          // Store in localStorage for button redirect
          localStorage.setItem('zip_code', urlZip)
          // Clean URL to /form/refinance after reading zip_code (remove query params)
          if (typeof window !== 'undefined') {
            window.history.replaceState({}, '', '/form/refinance')
          }
        } else {
          // If no URL zip, get from localStorage (only if not in saved form data)
          if (typeof window !== 'undefined') {
            const hasZipInSavedData = savedFormData ? JSON.parse(savedFormData).zipCode : false
            if (!hasZipInSavedData) {
              const storedZip = localStorage.getItem('zip_code')
              if (storedZip && storedZip.length === 5) {
                setFormData(prev => {
                  if (!prev.zipCode) {
                    return { ...prev, zipCode: storedZip }
                  }
                  return prev
                })
              }
            }
          }
        }
        
        if (savedCurrentStep) {
          const step = parseInt(savedCurrentStep, 10)
          if (step >= 1 && step <= 19) {
            setCurrentStep(step)
          }
        }
      } catch (error) {
        console.error('Error loading form data from localStorage:', error)
      }
      setIsInitialized(true)
    }
  }, [isInitialized, searchParams])

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && isInitialized) {
      try {
        localStorage.setItem('refinance_form_data', JSON.stringify(formData))
      } catch (error) {
        console.error('Error saving form data to localStorage:', error)
      }
    }
  }, [formData, isInitialized])

  // Save current step to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && isInitialized) {
      try {
        localStorage.setItem('refinance_current_step', currentStep.toString())
      } catch (error) {
        console.error('Error saving current step to localStorage:', error)
      }
    }
  }, [currentStep, isInitialized])

  // Clear localStorage on successful submission
  const clearFormData = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('refinance_form_data')
      localStorage.removeItem('refinance_current_step')
    }
  }

  // Handle TrustedForm certificate data
  const handleTrustedFormReady = useCallback((certUrl: string) => {
    if (certUrl) {
      setTrustedFormCertUrl(certUrl)
    }
  }, [])

  const handleInputChange = (field: string, value: string | number, autoAdvance = false) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
    
    // Auto-advance to next step if enabled
    if (autoAdvance) {
      // Use setTimeout to ensure state is updated first
      setTimeout(() => {
        setCurrentStep(prev => prev + 1)
      }, 150)
    }
  }

  // Validate field on blur
  const validateField = (field: string, value: string | number) => {
    let validation: { valid: boolean; error?: string } = { valid: true }

    switch (field) {
      case 'zipCode':
        validation = validateZipCode(String(value))
        break
      case 'email':
        validation = validateEmail(String(value))
        break
      case 'firstName':
        validation = validateName(String(value), 'First name')
        break
      case 'lastName':
        validation = validateName(String(value), 'Last name')
        break
      case 'address':
        validation = validateAddress(String(value))
        break
      case 'city':
        validation = validateCity(String(value))
        break
      case 'phoneNumber':
        validation = validatePhoneNumber(String(value))
        break
    }

    if (!validation.valid && validation.error) {
      setErrors(prev => ({ ...prev, [field]: validation.error! }))
    } else {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }

    return validation.valid
  }

  const handleNext = async () => {
    if (isStepValid()) {
      if (currentStep === 19) {
        // Submit form to LeadProsper
        setIsSubmitting(true)
        
        try {
          // Get addressZip from URL or localStorage (this is for the address)
          let addressZip = ''
          const urlZip = searchParams.get('zip_code')
          if (urlZip && urlZip.length === 5) {
            addressZip = urlZip
            // Also store in localStorage for fallback
            if (typeof window !== 'undefined') {
              localStorage.setItem('zip_code', urlZip)
            }
          } else if (typeof window !== 'undefined') {
            const storedZip = localStorage.getItem('zip_code')
            if (storedZip && storedZip.length === 5) {
              addressZip = storedZip
            }
          }

          // Strip formatting from phone number (remove all non-digits)
          const unformattedPhone = formData.phoneNumber.replace(/\D/g, '')

          // Get TrustedForm certificate URL - check state first, then DOM as fallback
          let certUrl = trustedFormCertUrl
          if (!certUrl && typeof window !== 'undefined') {
            const certInput = document.getElementById('xxTrustedFormCertUrl_0') as HTMLInputElement
            const certInputByName = document.querySelector('input[name="xxTrustedFormCertUrl"]') as HTMLInputElement
            const certInputToCheck = certInput || certInputByName
            if (certInputToCheck?.value?.trim()) {
              certUrl = certInputToCheck.value.trim()
            }
          }

          const formDataToSubmit = {
            ...formData,
            phoneNumber: unformattedPhone, // Submit unformatted phone number
            addressZip: addressZip, // Use zip code from URL/localStorage for address
            trustedformCertUrl: certUrl || '', // Include TrustedForm certificate URL
          }

          const response = await fetch('/api/submit-refinance', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(formDataToSubmit),
          })

          const result = await response.json()

          if (result.success) {
            // Clear form data from localStorage on successful submission
            clearFormData()
            // Redirect to thank you page (from API response or default)
            const redirectUrl = result.redirectUrl || '/thankyou'
            router.push(redirectUrl)
          } else {
            alert('Form submission failed. Please try again.')
            setIsSubmitting(false)
          }
        } catch (error) {
          console.error('Error submitting form:', error)
          alert('An error occurred. Please try again.')
          setIsSubmitting(false)
        }
      } else {
        setCurrentStep(prev => prev + 1)
      }
    }
  }

  const handleBack = () => {
    setCurrentStep(prev => {
      // If on step 10 and user selected "No" for secondMortgage, go back to step 7
      if (prev === 10 && formData.secondMortgage === 'no') {
        return 7
      }
      // Otherwise, go back one step normally
      return prev - 1
    })
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.propertyType !== ''
      case 2:
        return formData.propertyPurpose !== ''
      case 3:
        return formData.creditGrade !== ''
      case 4:
        return formData.estimatedHomeValue > 0
      case 5:
        return formData.mortgageBalance > 0 && formData.mortgageBalance <= formData.estimatedHomeValue
      case 6:
        return formData.firstMortgageInterest >= 3 && formData.firstMortgageInterest <= 24
      case 7:
        return formData.secondMortgage !== ''
      case 8:
        return formData.secondMortgageBalance >= 0 && formData.secondMortgageBalance <= 3000000
      case 9:
        return formData.secondMortgageInterest >= 0 && formData.secondMortgageInterest <= 24
      case 10:
        return formData.additionalCash >= 0 && formData.additionalCash <= 2000000
      case 11:
        return formData.loanType !== ''
      case 12:
        return formData.bankruptcyOrForeclosure !== ''
      case 13:
        return formData.currentlyEmployed !== ''
      case 14:
        return formData.lateMortgagePayments !== ''
      case 15:
        return formData.veteranStatus !== ''
      case 16:
        return validateEmail(formData.email).valid && !errors.email
      case 17:
        return (
          validateName(formData.firstName, 'First name').valid &&
          validateName(formData.lastName, 'Last name').valid &&
          !errors.firstName &&
          !errors.lastName
        )
      case 18:
        return (
          validateAddress(formData.address).valid &&
          validateCity(formData.city).valid &&
          formData.addressState !== '' &&
          !errors.address &&
          !errors.city
        )
      case 19:
        return validatePhoneNumber(formData.phoneNumber).valid && !errors.phoneNumber
      default:
        return false
    }
  }


  // Handler for redirecting to buy-home form with zip code from localStorage
  const handleRedirectToBuyHome = () => {
    // Get zip code from localStorage first (stored when user clicks Continue in Hero)
    let zipCode = ''
    
    if (typeof window !== 'undefined') {
      const storedZip = localStorage.getItem('zip_code')
      if (storedZip && storedZip.length === 5) {
        zipCode = storedZip
      }
    }
    
    // Fallback to URL params if localStorage doesn't have it
    if (!zipCode) {
      const urlZip = searchParams.get('zip_code')
      if (urlZip && urlZip.length === 5) {
        zipCode = urlZip
      }
    }
    
    // Final fallback to formData.zipCode
    if (!zipCode && formData.zipCode && formData.zipCode.length === 5) {
      zipCode = formData.zipCode
    }
    
    // Build redirect URL with zip code if available
    const redirectUrl = zipCode 
      ? `/form/buy-home?zip_code=${zipCode}`
      : '/form/buy-home'
    
    router.push(redirectUrl)
  }

  // Calculate default mortgage balance (70% of estimated home value)
  const getDefaultMortgageBalance = () => {
    return Math.round(formData.estimatedHomeValue * 0.7)
  }

  // Calculate default additional cash (80% of home value minus existing mortgage balances)
  const getDefaultAdditionalCash = () => {
    const maxLoanAmount = Math.round(formData.estimatedHomeValue * 0.8)
    const totalMortgageBalances = formData.mortgageBalance + formData.secondMortgageBalance
    const defaultCash = Math.max(0, maxLoanAmount - totalMortgageBalances)
    return defaultCash
  }

  // Get min and max for mortgage balance
  const getMortgageBalanceMin = () => {
    return 50000
  }

  const getMortgageBalanceMax = () => {
    // Max is 100% of estimated home value, but display cap at $1.5M
    return Math.min(formData.estimatedHomeValue, 1500000)
  }

  // Format mortgage balance value for display
  const formatMortgageBalance = (val: number) => {
    if (val <= 50000) return '$50k or less'
    if (val >= 1500000) return '$1.5M or more'
    return `$${val.toLocaleString()}`
  }

  // Format first mortgage interest rate for display
  const formatInterestRate = (val: number) => {
    if (val <= 3) return '3% or less'
    // Always show the actual value with 2 decimal places (.25, .5, .75)
    return `${val.toFixed(2)}%`
  }

  // Format second mortgage balance value for display
  const formatSecondMortgageBalance = (val: number) => {
    if (val === 0) return '$0'
    if (val <= 50000) return '$50k or less'
    if (val >= 3000000) return '$3M or more'
    return `$${val.toLocaleString()}`
  }

  // Format second mortgage interest rate for display
  const formatSecondInterestRate = (val: number) => {
    // Always show the actual value with 2 decimal places (.25, .5, .75)
    return `${val.toFixed(2)}%`
  }

  // Format additional cash value for display
  const formatAdditionalCash = (val: number) => {
    if (val === 0) return '$0'
    return `$${val.toLocaleString()}`
  }

  // Initialize mortgage balance to 70% of estimated home value when step 5 is reached
  useEffect(() => {
    if (currentStep === 5 && formData.mortgageBalance === 0) {
      const defaultBalance = Math.round(formData.estimatedHomeValue * 0.7)
      setFormData(prev => ({
        ...prev,
        mortgageBalance: defaultBalance
      }))
    }
  }, [currentStep, formData.estimatedHomeValue, formData.mortgageBalance])

  // Initialize additional cash to 80% of home value minus mortgage balances when step 10 is reached
  // Formula: additionalCash = (80% × estimatedHomeValue) - (mortgageBalance + secondMortgageBalance)
  useEffect(() => {
    if (currentStep === 10) {
      // Always recalculate based on current values: 80% of EST_VAL minus (BAL_ONE + BAL_TWO)
      const maxLoanAmount = Math.round(formData.estimatedHomeValue * 0.8)
      const totalMortgageBalances = formData.mortgageBalance + formData.secondMortgageBalance
      const defaultCash = Math.max(0, maxLoanAmount - totalMortgageBalances)
      
      // Only set if the current value is 0 or hasn't been set yet
      setFormData(prev => {
        if (prev.additionalCash === 0 || prev.additionalCash === undefined) {
          return {
            ...prev,
            additionalCash: defaultCash
          }
        }
        return prev
      })
    }
  }, [currentStep, formData.estimatedHomeValue, formData.mortgageBalance, formData.secondMortgageBalance])

  const propertyTypes: RadioOption[] = [
    { id: 'SINGLE_FAMILY', label: 'Single Family' },
    { id: 'MULTI_FAMILY', label: 'Multi Family' },
    { id: 'CONDO', label: 'Condo' },
    { id: 'TOWNHOME', label: 'Townhome' },
    { id: 'MOBILEHOME', label: 'Mobilehome' },
  ]

  const propertyPurposeOptions: RadioOption[] = [
    { id: 'PRIMARY', label: 'Primary Residence' },
    { id: 'SECONDARY_VACTN', label: 'Vacation Home' },
    { id: 'INVESTMENT', label: 'Investment Home' },
  ]

  const creditGrades: RadioOption[] = [
    { id: 'EXCELLENT', label: 'Excellent (680+)' },
    { id: 'GOOD', label: 'Good (640-679)' },
    { id: 'AVERAGE', label: 'Average (600-639)' },
    { id: 'FAIR', label: 'Fair (560-599)' },
  ]

  const secondMortgageOptions: RadioOption[] = [
    { id: 'yes', label: 'Yes' },
    { id: 'no', label: 'No' },
  ]

  const loanTypeOptions: RadioOption[] = [
    { id: 'FIXED', label: 'Fixed' },
    { id: 'ADJUSTABLE', label: 'Adjustable' },
    { id: 'FIXED_OR_ADJUSTABLE', label: "Don't know" },
  ]

  const bankruptcyOptions: RadioOption[] = [
    { id: 'yes', label: 'Yes' },
    { id: 'no', label: 'No' },
  ]

  const employmentOptions: RadioOption[] = [
    { id: 'yes', label: 'Yes' },
    { id: 'no', label: 'No' },
  ]

  const lateMortgagePaymentsOptions: RadioOption[] = [
    { id: 'NONE', label: 'None' },
    { id: 'ONE', label: 'One' },
    { id: 'TWO_OR_MORE', label: 'Two or More' },
  ]

  const veteranStatusOptions: RadioOption[] = [
    { id: 'yes', label: 'Yes' },
    { id: 'no', label: 'No' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 px-4 pt-6 pb-6">
      <div className="w-full max-w-2xl mx-auto">
        {/* Progress Indicator */}
        <ProgressBar 
          currentStep={currentStep}
          totalSteps={19}
          icon={<DollarSign size={20} className="text-[#3498DB]" />}
          formType="refinance"
        />

        {/* Form Card */}
        <form 
          onSubmit={(e) => {
            e.preventDefault()
            if (currentStep === 19 && isStepValid()) {
              handleNext()
            }
          }}
          className="bg-white rounded-2xl md:rounded-3xl shadow-xl p-4 md:p-6"
        >
          <TrustedForm onCertUrlReady={handleTrustedFormReady} />
          {/* Step 1: Property Type */}
          {currentStep === 1 && (
            <>
              <h2 className="text-xl md:text-2xl font-bold text-[#246a99] mb-4 md:mb-5 font-sans">
                What type of property are you refinancing?
              </h2>

              <RadioButtonGroup
                label="Select Property Type"
                options={propertyTypes}
                value={formData.propertyType}
                onChange={(value) => handleInputChange('propertyType', value, true)}
                required
                className="mb-4"
              />
            </>
          )}

          {/* Step 2: Property Purpose */}
          {currentStep === 2 && (
            <>
              <h2 className="text-xl md:text-2xl font-bold text-[#246a99] mb-4 md:mb-5 font-sans">
                What is the purpose of this property?
              </h2>

              <RadioButtonGroup
                label="Select Property Purpose"
                options={propertyPurposeOptions}
                value={formData.propertyPurpose}
                onChange={(value) => handleInputChange('propertyPurpose', value, true)}
                required
                className="mb-4"
              />
            </>
          )}

          {/* Step 3: Credit Grade */}
          {currentStep === 3 && (
            <>
              <h2 className="text-xl md:text-2xl font-bold text-[#246a99] mb-4 md:mb-5 font-sans">
                How would you rate your credit?
              </h2>

              <RadioButtonGroup
                label="Select Credit Grade"
                options={creditGrades}
                value={formData.creditGrade}
                onChange={(value) => handleInputChange('creditGrade', value, true)}
                required
                className="mb-4"
              />
            </>
          )}

          {/* Step 4: Estimated Home Value */}
          {currentStep === 4 && (
            <>
              <h2 className="text-xl md:text-2xl font-bold text-[#246a99] mb-4 md:mb-5 font-sans">
                What is your estimated home value?
              </h2>

              <RangeSlider
                id="estimatedHomeValue"
                label="Select Home Value"
                value={formData.estimatedHomeValue}
                onChange={(value) => handleInputChange('estimatedHomeValue', value)}
                min={50000}
                max={2000000}
                required
                className="mb-4"
              />
            </>
          )}

          {/* Step 5: Mortgage Balance */}
          {currentStep === 5 && (
            <>
              <h2 className="text-xl md:text-2xl font-bold text-[#246a99] mb-4 md:mb-5 font-sans">
                What is your current mortgage balance?
              </h2>

              <RangeSlider
                id="mortgageBalance"
                label="Select Mortgage Balance"
                value={formData.mortgageBalance || getDefaultMortgageBalance()}
                onChange={(value) => {
                  // Ensure value doesn't exceed 100% of home value (cannot force LTVs below 100%)
                  const maxBalance = formData.estimatedHomeValue
                  const adjustedValue = Math.min(value, maxBalance)
                  
                  // Apply range averaging logic for submission
                  // Store the actual selected value, will convert to average on submission
                  setFormData(prev => ({
                    ...prev,
                    mortgageBalance: adjustedValue
                  }))
                }}
                min={getMortgageBalanceMin()}
                max={getMortgageBalanceMax()}
                step={5000}
                formatValue={formatMortgageBalance}
                required
                className="mb-4"
              />
            </>
          )}

          {/* Step 6: First Mortgage Interest Rate */}
          {currentStep === 6 && (
            <>
              <h2 className="text-xl md:text-2xl font-bold text-[#246a99] mb-4 md:mb-5 font-sans">
                What is your current first mortgage interest rate?
              </h2>

              <RangeSlider
                id="firstMortgageInterest"
                label="Select Interest Rate"
                value={formData.firstMortgageInterest}
                onChange={(value) => handleInputChange('firstMortgageInterest', value)}
                min={3}
                max={24}
                step={0.25}
                formatValue={formatInterestRate}
                required
                className="mb-4"
              />
            </>
          )}

          {/* Step 7: Second Mortgage */}
          {currentStep === 7 && (
            <>
              <h2 className="text-xl md:text-2xl font-bold text-[#246a99] mb-4 md:mb-5 font-sans">
                Do you have a 2nd Mortgage?
              </h2>

              <RadioButtonGroup
                
                options={secondMortgageOptions}
                value={formData.secondMortgage}
                onChange={(value) => {
                  handleInputChange('secondMortgage', value, false)
                  // If "No" is selected, skip to step 10 (additionalCash)
                  // If "Yes" is selected, go to step 8 (secondMortgageBalance)
                  setTimeout(() => {
                    setCurrentStep(value === 'no' ? 10 : 8)
                  }, 150)
                }}
                required
                className="mb-4"
              />
            </>
          )}

          {/* Step 8: Second Mortgage Balance */}
          {currentStep === 8 && (
            <>
              <h2 className="text-xl md:text-2xl font-bold text-[#246a99] mb-4 md:mb-5 font-sans">
                What is your current second mortgage balance?
              </h2>

              <RangeSlider
                id="secondMortgageBalance"
                label="Select Second Mortgage Balance"
                value={formData.secondMortgageBalance}
                onChange={(value) => handleInputChange('secondMortgageBalance', value)}
                min={0}
                max={3000000}
                step={5000}
                formatValue={formatSecondMortgageBalance}
                required
                className="mb-4"
              />
            </>
          )}

          {/* Step 9: Second Mortgage Interest Rate */}
          {currentStep === 9 && (
            <>
              <h2 className="text-xl md:text-2xl font-bold text-[#246a99] mb-4 md:mb-5 font-sans">
                What is your current second mortgage interest rate?
              </h2>

              <RangeSlider
                id="secondMortgageInterest"
                label="Select Interest Rate"
                value={formData.secondMortgageInterest}
                onChange={(value) => handleInputChange('secondMortgageInterest', value)}
                min={0}
                max={24}
                step={0.25}
                formatValue={formatSecondInterestRate}
                required
                className="mb-4"
              />
            </>
          )}

          {/* Step 10: Additional Cash */}
          {currentStep === 10 && (
            <>
              <h2 className="text-xl md:text-2xl font-bold text-[#246a99] mb-4 md:mb-5 font-sans">
                How much additional cash do you wish to borrow?
              </h2>

              <RangeSlider
                id="additionalCash"
                label="Select Additional Cash Amount"
                value={formData.additionalCash > 0 ? formData.additionalCash : getDefaultAdditionalCash()}
                onChange={(value) => handleInputChange('additionalCash', value)}
                min={0}
                max={2000000}
                step={5000}
                formatValue={formatAdditionalCash}
                required
                className="mb-4"
              />
            </>
          )}

          {/* Step 11: Loan Type */}
          {currentStep === 11 && (
            <>
              <h2 className="text-xl md:text-2xl font-bold text-[#246a99] mb-4 md:mb-5 font-sans">
                What type of interest rate do you prefer?
              </h2>

              <RadioButtonGroup
                label="Select Loan Type"
                options={loanTypeOptions}
                value={formData.loanType}
                onChange={(value) => handleInputChange('loanType', value, true)}
                required
                className="mb-4"
              />
            </>
          )}

          {/* Step 12: Bankruptcy or Foreclosure */}
          {currentStep === 12 && (
            <>
              <h2 className="text-xl md:text-2xl font-bold text-[#246a99] mb-4 md:mb-5 font-sans">
                Have you been in bankruptcy or foreclosure in the past three years?
              </h2>

              <RadioButtonGroup
                
                options={bankruptcyOptions}
                value={formData.bankruptcyOrForeclosure}
                onChange={(value) => handleInputChange('bankruptcyOrForeclosure', value, true)}
                required
                className="mb-4"
              />
            </>
          )}

          {/* Step 13: Currently Employed */}
          {currentStep === 13 && (
            <>
              <h2 className="text-xl md:text-2xl font-bold text-[#246a99] mb-4 md:mb-5 font-sans">
                Are you currently employed?
              </h2>

              <RadioButtonGroup
                
                options={employmentOptions}
                value={formData.currentlyEmployed}
                onChange={(value) => handleInputChange('currentlyEmployed', value, true)}
                required
                className="mb-4"
              />
            </>
          )}

          {/* Step 14: Late Mortgage Payments */}
          {currentStep === 14 && (
            <>
              <h2 className="text-xl md:text-2xl font-bold text-[#246a99] mb-4 md:mb-5 font-sans">
                Any late mortgage payments in the past year?
              </h2>

              <RadioButtonGroup
                
                options={lateMortgagePaymentsOptions}
                value={formData.lateMortgagePayments}
                onChange={(value) => handleInputChange('lateMortgagePayments', value, true)}
                required
                columns={1}
                className="mb-4"
              />
            </>
          )}

          {/* Step 15: Veteran Status */}
          {currentStep === 15 && (
            <>
              <h2 className="text-xl md:text-2xl font-bold text-[#246a99] mb-4 md:mb-5 font-sans">
                You or spouse a servicemember or veteran?
              </h2>

              <RadioButtonGroup
                
                options={veteranStatusOptions}
                value={formData.veteranStatus}
                onChange={(value) => handleInputChange('veteranStatus', value, true)}
                required
                className="mb-4"
              />
            </>
          )}

          {/* Step 16: Email */}
          {currentStep === 16 && (
            <>
              <h2 className="text-xl md:text-2xl font-bold text-[#246a99] mb-4 md:mb-5 font-sans">
                What&apos;s your email address?
              </h2>

              <TextInput
                id="email"
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(value) => handleInputChange('email', value)}
                onBlur={() => validateField('email', formData.email)}
                error={errors.email}
                placeholder="example@email.com"
                required
                className="mb-4"
              />
            </>
          )}

          {/* Step 17: First Name and Last Name */}
          {currentStep === 17 && (
            <>
              <h2 className="text-xl md:text-2xl font-bold text-[#246a99] mb-4 md:mb-5 font-sans">
                What&apos;s your name?
              </h2>

              <div className="mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextInput
                    id="firstName"
                    label="First Name"
                    value={formData.firstName}
                    onChange={(value) => handleInputChange('firstName', value)}
                    onBlur={() => validateField('firstName', formData.firstName)}
                    error={errors.firstName}
                    placeholder="John"
                    required
                  />
                  <TextInput
                    id="lastName"
                    label="Last Name"
                    value={formData.lastName}
                    onChange={(value) => handleInputChange('lastName', value)}
                    onBlur={() => validateField('lastName', formData.lastName)}
                    error={errors.lastName}
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>
            </>
          )}

          {/* Step 18: Address, City, State */}
          {currentStep === 18 && (
            <>
              <h2 className="text-xl md:text-2xl font-bold text-[#246a99] mb-4 md:mb-5 font-sans">
                What&apos;s your address?
              </h2>

              <div className="mb-4 space-y-4">
                {/* Address */}
                <AddressInput
                  id="address"
                  label="Street Address"
                  value={formData.address}
                  onChange={(value) => handleInputChange('address', value)}
                  onAddressSelect={(address, city, state) => {
                    handleInputChange('address', address)
                    handleInputChange('city', city)
                    handleInputChange('addressState', state)
                    // Clear errors for these fields
                    if (errors.address) {
                      setErrors(prev => {
                        const newErrors = { ...prev }
                        delete newErrors.address
                        return newErrors
                      })
                    }
                    if (errors.city) {
                      setErrors(prev => {
                        const newErrors = { ...prev }
                        delete newErrors.city
                        return newErrors
                      })
                    }
                  }}
                  onBlur={() => validateField('address', formData.address)}
                  error={errors.address}
                  placeholder="123 Main Street"
                  required
                />

                {/* City and State */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextInput
                    id="city"
                    label="City"
                    value={formData.city}
                    onChange={(value) => handleInputChange('city', value)}
                    onBlur={() => validateField('city', formData.city)}
                    error={errors.city}
                    placeholder="New York"
                    required
                  />
                  <StateDropdown
                    id="addressState"
                    label="State"
                    placeholder="Choose a state..."
                    value={formData.addressState}
                    onChange={(stateId) => handleInputChange('addressState', stateId)}
                    required
                  />
                </div>
              </div>
            </>
          )}

          {/* Step 19: Phone Number and Submit */}
          {currentStep === 19 && (
            <>
              <h2 className="text-xl md:text-2xl font-bold text-[#246a99] mb-4 md:mb-5 font-sans">
                What&apos;s your phone number?
              </h2>

              <PhoneInput
                id="phoneNumber"
                label="Phone Number"
                value={formData.phoneNumber}
                onChange={(value) => handleInputChange('phoneNumber', value)}
                onBlur={() => validateField('phoneNumber', formData.phoneNumber)}
                error={errors.phoneNumber}
                required
                className="mb-4"
              />

              {/* Navigation Buttons - Step 19 */}
              <div className="flex gap-3 mb-4">
                {currentStep > 1 && (
                  <button
                    onClick={handleBack}
                    className="px-5 py-3 rounded-xl font-bold text-sm md:text-base
                      border-2 border-gray-300 text-gray-700 hover:border-[#3498DB] hover:text-[#3498DB]
                      transition-all duration-300 hover:shadow-lg flex items-center gap-2"
                  >
                    <ArrowLeft size={18} />
                    Back
                  </button>
                )}
                <button
                  onClick={handleNext}
                  disabled={!isStepValid() || isSubmitting}
                  className={`
                    flex-1 py-3 rounded-xl font-bold text-sm md:text-base
                    transition-all duration-300 flex items-center justify-center gap-2
                    ${
                      !isStepValid() || isSubmitting
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-[#3498DB] text-white hover:bg-[#246a99] shadow-lg hover:shadow-xl hover:scale-105 cursor-pointer'
                    }
                  `}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Details'
                  )}
                </button>
              </div>

              {/* Disclaimer */}
              <div className="mb-4 p-3 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-xs text-gray-600 leading-relaxed">
                By clicking Submit Details, you agree to: (1) our <Link href="https://securerights.org/tc/" target="_blank">TERMS OF USE</Link>, which include a Class Waiver and Mandatory Arbitration Agreement, (2) our <Link href="https://securerights.org/privacy/" target="_blank">PRIVACY POLICY</Link>, and (3) receive notices and other <Link href="https://securerights.org/electroniccommunications/" target="_blank">COMMUNICATIONS ELECTRONICALLY</Link>. By clicking Submit Details, you: (a) provide your express written consent and binding signature under the ESIGN Act for Leadpoint, Inc. dba SecureRights, a Delaware corporation, to share your information with up to four (4) of its <Link href="https://securerights.org/networkmembers/" target="_blank">PREMIER PARTNERS</Link> and/or third parties acting on their behalf to contact you via telephone, mobile device (including SMS and MMS) and/or email, including but not limited to texts or calls made using an automated telephone dialing system, AI-generated voice and text messages, or pre-recorded or artificial voice messages, regarding financial services or other offers related to homeownership; (b) understand that your consent is valid even if your telephone number is currently listed on any state, federal, local or corporate Do Not Call list; (c) represent that you are the wireless subscriber or customary user of the wireless number(s) provided with authority to consent; (d) understand your consent is not required in order to obtain any good or service; (e) represent that you have received and reviewed the <Link href="https://securerights.org/licenses/" target="_blank">MORTGAGE BROKER DISCLOSURES</Link> for your state; and (f) provide your consent under the Fair Credit Reporting Act for SecureRights and/or its <Link href="https://securerights.org/licenses/" target="_blank">PREMIER PARTNERS</Link> to obtain information from your personal credit profile to prequalify you for credit options and connect you with an appropriate partner. You may choose to speak with an individual service provider by dialing (844) 326-3442. Leadpoint, Inc. NMLS 3175.
                </p>
              </div>
            </>
          )}

          {/* Navigation Buttons - All other steps */}
          {currentStep !== 19 && (
            <div className="flex gap-3">
            {currentStep > 1 && (
              <button
                onClick={handleBack}
                className="px-5 py-3 rounded-xl font-bold text-sm md:text-base
                  border-2 border-gray-300 text-gray-700 hover:border-[#3498DB] hover:text-[#3498DB]
                  transition-all duration-300 hover:shadow-lg flex items-center gap-2"
              >
                <ArrowLeft size={18} />
                Back
              </button>
            )}
            {/* Only show Continue/Submit button for steps without radio buttons */}
            {(() => {
              // Steps with radio buttons that auto-advance: 1, 2, 3, 7, 11, 12, 13, 14, 15
              const radioButtonSteps = [1, 2, 3, 7, 11, 12, 13, 14, 15]
              const hasRadioButton = radioButtonSteps.includes(currentStep)
              
              // Show button for steps without radio buttons (step 19 is handled separately)
              if (!hasRadioButton) {
                const isDisabled = !isStepValid()
                return (
                  <button
                    onClick={handleNext}
                    disabled={isDisabled}
                    className={`
                      ${currentStep > 1 ? '' : 'flex-1'} py-3 rounded-xl font-bold text-sm md:text-base
                      transition-all duration-300 flex items-center justify-center gap-2
                      ${
                        !isDisabled
                          ? 'bg-[#3498DB] text-white hover:bg-[#246a99] shadow-lg hover:shadow-xl hover:scale-105 cursor-pointer'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }
                      ${currentStep > 1 ? 'flex-1' : 'w-full'}
                    `}
                  >
                    Continue
                  </button>
                )
              }
              return null
            })()}
          </div>
          )}
        </form>

        {/* Redirect Button - Only show on step 1, outside the card */}
        {currentStep === 1 && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={handleRedirectToBuyHome}
              className="w-full px-6 py-4 rounded-xl font-semibold text-base
                border-2 border-[#246a99] text-[#246a99] 
                hover:bg-[#246a99] hover:text-white
                transition-all duration-300 hover:shadow-lg hover:scale-105
                bg-white"
            >
              Need a Home Purchase Loan?
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function RefinanceWrapper() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-[#246a99] text-xl font-semibold">Loading...</div>
      </div>
    }>
      <Refinance />
    </React.Suspense>
  )
}
