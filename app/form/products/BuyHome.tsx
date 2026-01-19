'use client'

import React, { useState, useEffect, useCallback } from 'react'
import TrustedForm from '@/components/trustedForm'
import { ArrowLeft, Home, Loader2 } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { RangeSlider, StateDropdown, TextInput, AddressInput, ZipCodeInput, PhoneInput, RadioButtonGroup, type RadioOption } from '@/components/ui'
import ProgressBar from '@/components/ui/ProgressBar'
import { validateZipCode, validateEmail, validateName, validateAddress, validateCity, validatePhoneNumber } from '@/utils/validation'
import Link from 'next/link'

const BuyHome = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isInitialized, setIsInitialized] = useState(false)
  const [trustedFormCertUrl, setTrustedFormCertUrl] = useState("")
  const [formData, setFormData] = useState({
    productType: 'PP_NEWHOME',
    state: '',
    propertyZipCode: '', // From step 2 - property zip code
    propertyType: '',
    creditGrade: '',
    foundHome: '',
    timelineToBuy: '',
    estimatedHomeValue: 250000,
    downPayment: 20, // Store percentage (default 20%)
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
        const savedFormData = localStorage.getItem('buyhome_form_data')
        const savedCurrentStep = localStorage.getItem('buyhome_current_step')
        
        if (savedFormData) {
          const parsedData = JSON.parse(savedFormData)
          setFormData(prev => ({ ...prev, ...parsedData }))
        }
        
        // Check URL params for zip_code if not in saved data
        const urlZip = searchParams.get('zip_code')
        if (urlZip && urlZip.length === 5) {
          // Store in localStorage for button redirect
          localStorage.setItem('zip_code', urlZip)
          // Clean URL to /form/buy-home after reading zip_code (remove query params)
          if (typeof window !== 'undefined') {
            window.history.replaceState({}, '', '/form/buy-home')
          }
        }
        
        if (savedCurrentStep) {
          const step = parseInt(savedCurrentStep, 10)
          if (step >= 1 && step <= 17) {
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
        localStorage.setItem('buyhome_form_data', JSON.stringify(formData))
      } catch (error) {
        console.error('Error saving form data to localStorage:', error)
      }
    }
  }, [formData, isInitialized])

  // Save current step to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && isInitialized) {
      try {
        localStorage.setItem('buyhome_current_step', currentStep.toString())
      } catch (error) {
        console.error('Error saving current step to localStorage:', error)
      }
    }
  }, [currentStep, isInitialized])

  // Clear localStorage on successful submission
  const clearFormData = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('buyhome_form_data')
      localStorage.removeItem('buyhome_current_step')
    }
  }

  // Handle TrustedForm certificate data
  const handleTrustedFormReady = useCallback((certUrl: string) => {
    if (certUrl) {
      setTrustedFormCertUrl(certUrl)
    }
  }, [])

    // Also check for TrustedForm certificate URL periodically in case callback doesn't fire
    useEffect(() => {
      if (typeof window === "undefined") return;
      
      let intervalId: NodeJS.Timeout | null = null;
      let timeoutId: NodeJS.Timeout | null = null;
      
      const checkTrustedFormCert = () => {
        // Try multiple possible field names/IDs
        const certInput = document.getElementById('xxTrustedFormCertUrl_0') as HTMLInputElement;
        const certInputByName = document.querySelector('input[name="xxTrustedFormCertUrl"]') as HTMLInputElement;
        const certInputToCheck = certInput || certInputByName;
        
        if (certInputToCheck) {
          const certValue = certInputToCheck.value?.trim();
          if (certValue && certValue !== trustedFormCertUrl) {
            setTrustedFormCertUrl(certValue);
            if (intervalId) {
              clearInterval(intervalId);
              intervalId = null;
            }
            return true;
          }
        }
        return false;
      };
  
      // Wait a bit for TrustedForm script to initialize
      const startDelay = setTimeout(() => {
        // Check immediately
        checkTrustedFormCert();
  
        // Check periodically until we have the cert URL or timeout
        intervalId = setInterval(() => {
          checkTrustedFormCert();
        }, 1000); // Check every 1 second
  
        // Clear interval after 20 seconds (extended timeout)
        timeoutId = setTimeout(() => {
          if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
          }
          // Final check
          const found = checkTrustedFormCert();
          if (!found && !trustedFormCertUrl) {
            const scriptLoaded = document.querySelector('script[src*="trustedform.js"]');
            if (!scriptLoaded) {
              console.error("TrustedForm: Script not found in DOM");
            }
          }
        }, 20000);
      }, 2000); // Wait 2 seconds for script to load
  
      return () => {
        clearTimeout(startDelay);
        if (intervalId) clearInterval(intervalId);
        if (timeoutId) clearTimeout(timeoutId);
      };
    }, [trustedFormCertUrl]);

  const handleInputChange = (field: string, value: string | number, autoAdvance = false) => {
    // Capture current step before state update
    const stepToAdvance = currentStep
    
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
    if (autoAdvance && stepToAdvance < 17) {
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
      case 'propertyZipCode':
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

  // Handler for redirecting to refinance form with zip code from localStorage
  const handleRedirectToRefinance = () => {
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
    
    // Build redirect URL with zip code if available
    const redirectUrl = zipCode 
      ? `/form/refinance?zip_code=${zipCode}`
      : '/form/refinance'
    
    router.push(redirectUrl)
  }

  const handleNext = async () => {
    if (isStepValid()) {
      if (currentStep === 17) {
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

          const response = await fetch('/api/submit-buy-home', {
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
    setCurrentStep(prev => prev - 1)
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.state !== ''
      case 2:
        return validateZipCode(formData.propertyZipCode).valid && !errors.propertyZipCode
      case 3:
        return formData.propertyType !== ''
      case 4:
        return formData.creditGrade !== ''
      case 5:
        return formData.foundHome !== ''
      case 6:
        return formData.timelineToBuy !== ''
      case 7:
        return formData.estimatedHomeValue > 0
      case 8:
        return formData.downPayment > 0
      case 9:
        return formData.loanType !== ''
      case 10:
        return formData.bankruptcyOrForeclosure !== ''
      case 11:
        return formData.currentlyEmployed !== ''
      case 12:
        return formData.lateMortgagePayments !== ''
      case 13:
        return formData.veteranStatus !== ''
      case 14:
        return validateEmail(formData.email).valid && !errors.email
      case 15:
        return (
          validateName(formData.firstName, 'First name').valid &&
          validateName(formData.lastName, 'Last name').valid &&
          !errors.firstName &&
          !errors.lastName
        )
      case 16:
        return (
          validateAddress(formData.address).valid &&
          validateCity(formData.city).valid &&
          formData.addressState !== '' &&
          !errors.address &&
          !errors.city
        )
      case 17:
        return validatePhoneNumber(formData.phoneNumber).valid && !errors.phoneNumber
      default:
        return false
    }
  }

  // Calculate down payment dollar amount for display
  const getDownPaymentAmount = () => {
    return Math.round((formData.downPayment / 100) * formData.estimatedHomeValue)
  }

  const propertyTypes: RadioOption[] = [
    { id: 'SINGLE_FAM', label: 'Single Family' },
    { id: 'MULTI_FAM', label: 'Multi Family' },
    { id: 'CONDO', label: 'Condo' },
    { id: 'TOWNHOME', label: 'Townhome' },
    { id: 'MOBILEHOME', label: 'Mobilehome' },
  ]

  const creditGrades: RadioOption[] = [
    { id: 'EXCELLENT', label: 'Excellent (680+)' },
    { id: 'GOOD', label: 'Good (640-679)' },
    { id: 'AVERAGE', label: 'Average (600-639)' },
    { id: 'FAIR', label: 'Fair (560-599)' },
  ]

  const homeFoundOptions: RadioOption[] = [
    { id: 'YES', label: 'Yes' },
    { id: 'NO', label: 'No' },
  ]

  const timelineToBuyOptions: RadioOption[] = [
    { id: 'IMMEDIATELY', label: 'Immediately' },
    { id: '30_DAYS', label: '1 to 2 Months' },
    { id: '60_DAYS', label: '2 to 3 Months' },
    { id: '90_DAYS', label: '3 Months or Longer' },
    { id: 'NO_TIME_CONSTRAINT', label: 'Not Sure' },
  ]

  const loanTypeOptions: RadioOption[] = [
    { id: 'FIXED', label: 'Fixed' },
    { id: 'ADJUSTABLE', label: 'Adjustable' },
    { id: 'FIXED_OR_ADJUSTABLE', label: "Don't know" },
  ]

  const bankruptcyOptions: RadioOption[] = [
    { id: 'YES', label: 'Yes' },
    { id: 'NO', label: 'No' },
  ]

  const employmentOptions: RadioOption[] = [
    { id: 'YES', label: 'Yes' },
    { id: 'NO', label: 'No' },
  ]

  const lateMortgagePaymentsOptions: RadioOption[] = [
    { id: 'NONE', label: 'None' },
    { id: 'ONE', label: 'One' },
    { id: 'TWO_OR_MORE', label: 'Two or More' },
  ]

  const veteranStatusOptions: RadioOption[] = [
    { id: 'YES', label: 'Yes' },
    { id: 'NO', label: 'No' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 px-4 pt-6 pb-6">
      <div className="w-full max-w-2xl mx-auto">
        {/* Progress Indicator */}
        <ProgressBar 
          currentStep={currentStep}
          totalSteps={17}
          icon={<Home size={20} className="text-[#3498DB]" />}
          formType="buy-home"
        />

        {/* Form Card */}
        <form 
          onSubmit={(e) => {
            e.preventDefault()
            if (currentStep === 17 && isStepValid()) {
              handleNext()
            }
          }}
          className="bg-white rounded-2xl md:rounded-3xl shadow-xl p-4 md:p-6"
        >
          
          <TrustedForm onCertUrlReady={handleTrustedFormReady} />

          {/* Step 1: State */}
          {currentStep === 1 && (
            <>
              <h2 className="text-xl md:text-2xl font-bold text-[#246a99] mb-4 md:mb-5 font-sans">
            What state is the property located in?
          </h2>

              <StateDropdown
            id="state"
            label="Select State"
            placeholder="Choose a state..."
            value={formData.state}
                onChange={(stateId) => handleInputChange('state', stateId)}
                required
                className="mb-4"
              />
            </>
          )}

          {/* Step 2: Zip Code */}
          {currentStep === 2 && (
            <>
              <h2 className="text-xl md:text-2xl font-bold text-[#246a99] mb-4 md:mb-5 font-sans">
                What is the property&apos;s zip code?
              </h2>

              <ZipCodeInput
                id="propertyZipCode"
                label="Enter Zip Code"
                value={formData.propertyZipCode}
                onChange={(value) => handleInputChange('propertyZipCode', value)}
                onBlur={() => validateField('propertyZipCode', formData.propertyZipCode)}
                error={errors.propertyZipCode}
                required
                className="mb-4"
              />
            </>
          )}

          {/* Step 3: Property Type */}
          {currentStep === 3 && (
            <>
              <h2 className="text-xl md:text-2xl font-bold text-[#246a99] mb-4 md:mb-5 font-sans">
                What type of property are you buying?
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

          {/* Step 4: Credit Grade */}
          {currentStep === 4 && (
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

          {/* Step 5: Have you found a home */}
          {currentStep === 5 && (
            <>
              <h2 className="text-xl md:text-2xl font-bold text-[#246a99] mb-4 md:mb-5 font-sans">
                Have you found a home?
              </h2>

<RadioButtonGroup
                
                options={homeFoundOptions}
                value={formData.foundHome}
                onChange={(value) => handleInputChange('foundHome', value, true)}
                required
                className="mb-4"
              />
            </>
          )}

          {/* Step 6: Timeline to Buy */}
          {currentStep === 6 && (
            <>
              <h2 className="text-xl md:text-2xl font-bold text-[#246a99] mb-4 md:mb-5 font-sans">
                When are you likely to buy a home?
              </h2>

<RadioButtonGroup
                label="Select Timeline"
                options={timelineToBuyOptions}
                value={formData.timelineToBuy}
                onChange={(value) => handleInputChange('timelineToBuy', value, true)}
                required
                className="mb-4"
              />
            </>
          )}

          {/* Step 7: Estimated Home Value */}
          {currentStep === 7 && (
            <>
              <h2 className="text-xl md:text-2xl font-bold text-[#246a99] mb-4 md:mb-5 font-sans">
                What is the estimated home value?
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

          {/* Step 8: Down Payment */}
          {currentStep === 8 && (
            <>
              <h2 className="text-xl md:text-2xl font-bold text-[#246a99] mb-4 md:mb-5 font-sans">
                How much are you planning to put down?
              </h2>

<div className="mb-3 text-center">
                <p className="text-base text-gray-600">
                  Amount: <span className="font-bold text-[#246a99] text-xl">
                    ${getDownPaymentAmount().toLocaleString()}
                  </span>
                </p>
              </div>

              <RangeSlider
                id="downPayment"
                label="Select Down Payment Percentage"
                value={formData.downPayment}
                onChange={(value) => handleInputChange('downPayment', value)}
                min={5}
                max={90}
                step={5}
                formatValue={(val) => `${val}%`}
                required
                className="mb-4"
              />
            </>
          )}

          {/* Step 9: Loan Type */}
          {currentStep === 9 && (
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

          {/* Step 10: Bankruptcy or Foreclosure */}
          {currentStep === 10 && (
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

          {/* Step 11: Currently Employed */}
          {currentStep === 11 && (
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

          {/* Step 12: Late Mortgage Payments */}
          {currentStep === 12 && (
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

          {/* Step 13: Veteran Status */}
          {currentStep === 13 && (
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

          {/* Step 14: Email */}
          {currentStep === 14 && (
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

          {/* Step 15: First Name and Last Name */}
          {currentStep === 15 && (
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

          {/* Step 16: Address, City, State, Zip */}
          {currentStep === 16 && (
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

          {/* Step 17: Phone Number and Submit */}
          {currentStep === 17 && (
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

              {/* Navigation Buttons - Step 17 */}
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
          {currentStep !== 17 && (
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
                // Steps with radio buttons that auto-advance: 3, 4, 5, 6, 9, 10, 11, 12, 13
                const radioButtonSteps = [3, 4, 5, 6, 9, 10, 11, 12, 13]
                const hasRadioButton = radioButtonSteps.includes(currentStep)
                
                // Show button for steps without radio buttons (step 17 is handled separately)
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
              onClick={handleRedirectToRefinance}
              className="w-full px-6 py-4 rounded-xl font-semibold text-base
                border-2 border-[#246a99] text-[#246a99] 
                hover:bg-[#246a99] hover:text-white
                transition-all duration-300 hover:shadow-lg hover:scale-105
                bg-white"
            >
              Need to Refinance?
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function BuyHomeWrapper() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-[#246a99] text-xl font-semibold">Loading...</div>
      </div>
    }>
      <BuyHome />
    </React.Suspense>
  )
}