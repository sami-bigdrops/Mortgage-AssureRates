/**
 * Comprehensive validation utilities for form inputs
 */

/**
 * Validates USA ZIP code
 * @param zipCode - 5-digit ZIP code string
 * @returns {valid: boolean, error?: string}
 */
export function validateZipCode(zipCode: string): { valid: boolean; error?: string } {
  if (!zipCode) {
    return { valid: false, error: 'ZIP code is required' }
  }

  // Remove any spaces or dashes
  const cleaned = zipCode.replace(/[\s-]/g, '')

  // Check length
  if (cleaned.length !== 5) {
    return { valid: false, error: 'ZIP code must be exactly 5 digits' }
  }

  // Check if all digits
  if (!/^\d{5}$/.test(cleaned)) {
    return { valid: false, error: 'ZIP code must contain only numbers' }
  }

  // Validate USA ZIP code range (00001-99999)
  const zipNum = parseInt(cleaned, 10)
  if (zipNum < 1 || zipNum > 99999 || cleaned === '00000') {
    return { valid: false, error: 'Please enter a valid USA ZIP code' }
  }

  // Check for reserved/invalid ZIP code ranges
  // ZIP codes starting with 666 are reserved (not assigned)
  if (cleaned.startsWith('666')) {
    return { valid: false, error: 'Please enter a valid USA ZIP code' }
  }

  return { valid: true }
}

/**
 * Common email typos to detect and suggest corrections
 */
const EMAIL_TYPO_PATTERNS: Array<{ pattern: RegExp; suggestion: string }> = [
  { pattern: /@ggmail\.com$/i, suggestion: '@gmail.com' },
  { pattern: /@gmial\.com$/i, suggestion: '@gmail.com' },
  { pattern: /@gmail\.con$/i, suggestion: '@gmail.com' },
  { pattern: /@gmail\.coms$/i, suggestion: '@gmail.com' },
  { pattern: /@gmai\.com$/i, suggestion: '@gmail.com' },
  { pattern: /@gmai\./i, suggestion: '@gmail.' },
  { pattern: /@gmaail\.com$/i, suggestion: '@gmail.com' },
  { pattern: /@yahoo\.con$/i, suggestion: '@yahoo.com' },
  { pattern: /@yahoo\.coms$/i, suggestion: '@yahoo.com' },
  { pattern: /@yaho\.com$/i, suggestion: '@yahoo.com' },
  { pattern: /@yahooo\.com$/i, suggestion: '@yahoo.com' },
  { pattern: /@outlok\.com$/i, suggestion: '@outlook.com' },
  { pattern: /@outlook\.con$/i, suggestion: '@outlook.com' },
  { pattern: /@outlook\.coms$/i, suggestion: '@outlook.com' },
  { pattern: /@hotmai\.com$/i, suggestion: '@hotmail.com' },
  { pattern: /@hotmail\.con$/i, suggestion: '@hotmail.com' },
  { pattern: /@hotmail\.coms$/i, suggestion: '@hotmail.com' },
  { pattern: /\.coms$/i, suggestion: '.com' },
  { pattern: /\.con$/i, suggestion: '.com' },
  { pattern: /\.coom$/i, suggestion: '.com' },
  { pattern: /\.comm$/i, suggestion: '.com' },
  { pattern: /\.cm$/i, suggestion: '.com' },
  { pattern: /\.om$/i, suggestion: '.com' },
]

/**
 * Validates email address with regex and typo detection
 * @param email - Email string to validate
 * @returns {valid: boolean, error?: string, suggestion?: string}
 */
export function validateEmail(email: string): {
  valid: boolean
  error?: string
  suggestion?: string
} {
  if (!email) {
    return { valid: false, error: 'Email address is required' }
  }

  // Trim whitespace
  const trimmed = email.trim()

  if (!trimmed) {
    return { valid: false, error: 'Email address is required' }
  }

  // Check for common typos
  for (const { pattern, suggestion } of EMAIL_TYPO_PATTERNS) {
    if (pattern.test(trimmed)) {
      const corrected = trimmed.replace(pattern, suggestion)
      return {
        valid: false,
        error: `Did you mean "${corrected}"?`,
        suggestion: corrected,
      }
    }
  }

  // Basic email regex validation
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

  if (!emailRegex.test(trimmed)) {
    return { valid: false, error: 'Please enter a valid email address' }
  }

  // Check for common mistakes
  if (trimmed.includes('..')) {
    return { valid: false, error: 'Email cannot contain consecutive dots' }
  }

  if (trimmed.startsWith('.') || trimmed.endsWith('.')) {
    return { valid: false, error: 'Email cannot start or end with a dot' }
  }

  if (trimmed.includes('@.') || trimmed.includes('.@')) {
    return { valid: false, error: 'Invalid email format' }
  }

  // Check domain
  const parts = trimmed.split('@')
  if (parts.length !== 2) {
    return { valid: false, error: 'Email must contain exactly one @ symbol' }
  }

  const [, domain] = parts
  if (!domain || !domain.includes('.')) {
    return { valid: false, error: 'Email domain must contain a dot (e.g., .com)' }
  }

  // Validate domain doesn't end with dot
  if (domain.endsWith('.')) {
    return { valid: false, error: 'Email domain cannot end with a dot' }
  }

  // Check for valid TLD (at least 2 characters)
  const tld = domain.split('.').pop()
  if (!tld || tld.length < 2) {
    return { valid: false, error: 'Email must have a valid domain extension' }
  }

  return { valid: true }
}

/**
 * Validates first name or last name
 * @param name - Name string to validate
 * @param fieldName - Field name for error messages (e.g., 'First name' or 'Last name')
 * @returns {valid: boolean, error?: string}
 */
export function validateName(name: string, fieldName: string = 'Name'): {
  valid: boolean
  error?: string
} {
  if (!name) {
    return { valid: false, error: `${fieldName} is required` }
  }

  const trimmed = name.trim()

  if (!trimmed) {
    return { valid: false, error: `${fieldName} is required` }
  }

  // Check minimum length
  if (trimmed.length < 2) {
    return { valid: false, error: `${fieldName} must be at least 2 characters` }
  }

  // Check maximum length
  if (trimmed.length > 50) {
    return { valid: false, error: `${fieldName} must be less than 50 characters` }
  }

  // Check for valid characters (letters, spaces, hyphens, apostrophes)
  if (!/^[a-zA-Z\s'-]+$/.test(trimmed)) {
    return {
      valid: false,
      error: `${fieldName} can only contain letters, spaces, hyphens, and apostrophes`,
    }
  }

  // Check for consecutive special characters
  if (/['-]{2,}/.test(trimmed) || /\s{2,}/.test(trimmed)) {
    return { valid: false, error: `${fieldName} contains invalid characters` }
  }

  // Check that name doesn't start or end with special characters
  if (/^['-\s]/.test(trimmed) || /['-\s]$/.test(trimmed)) {
    return { valid: false, error: `${fieldName} cannot start or end with special characters` }
  }

  return { valid: true }
}

/**
 * Validates street address
 * @param address - Address string to validate
 * @returns {valid: boolean, error?: string}
 */
export function validateAddress(address: string): { valid: boolean; error?: string } {
  if (!address) {
    return { valid: false, error: 'Street address is required' }
  }

  const trimmed = address.trim()

  if (!trimmed) {
    return { valid: false, error: 'Street address is required' }
  }

  // Check minimum length
  if (trimmed.length < 5) {
    return { valid: false, error: 'Please enter a valid street address' }
  }

  // Check maximum length
  if (trimmed.length > 100) {
    return { valid: false, error: 'Address must be less than 100 characters' }
  }

  // Basic validation - should contain at least one number (house/building number)
  if (!/\d/.test(trimmed)) {
    return { valid: false, error: 'Address should include a street number' }
  }

  // Check for valid characters
  if (!/^[a-zA-Z0-9\s.,#-]+$/.test(trimmed)) {
    return {
      valid: false,
      error: 'Address contains invalid characters',
    }
  }

  return { valid: true }
}

/**
 * Validates city name
 * @param city - City string to validate
 * @returns {valid: boolean, error?: string}
 */
export function validateCity(city: string): { valid: boolean; error?: string } {
  if (!city) {
    return { valid: false, error: 'City is required' }
  }

  const trimmed = city.trim()

  if (!trimmed) {
    return { valid: false, error: 'City is required' }
  }

  // Check minimum length
  if (trimmed.length < 2) {
    return { valid: false, error: 'City name must be at least 2 characters' }
  }

  // Check maximum length
  if (trimmed.length > 50) {
    return { valid: false, error: 'City name must be less than 50 characters' }
  }

  // Check for valid characters (letters, spaces, hyphens, apostrophes)
  if (!/^[a-zA-Z\s'-]+$/.test(trimmed)) {
    return {
      valid: false,
      error: 'City can only contain letters, spaces, hyphens, and apostrophes',
    }
  }

  // Check for consecutive special characters
  if (/['-]{2,}/.test(trimmed) || /\s{2,}/.test(trimmed)) {
    return { valid: false, error: 'City name contains invalid characters' }
  }

  // Check that city doesn't start or end with special characters
  if (/^['-\s]/.test(trimmed) || /['-\s]$/.test(trimmed)) {
    return { valid: false, error: 'City name cannot start or end with special characters' }
  }

  return { valid: true }
}

/**
 * Validates phone number
 * @param phoneNumber - Phone number string (formatted or unformatted)
 * @returns {valid: boolean, error?: string}
 */
export function validatePhoneNumber(phoneNumber: string): { valid: boolean; error?: string } {
  if (!phoneNumber) {
    return { valid: false, error: 'Phone number is required' }
  }

  // Extract digits only
  const digits = phoneNumber.replace(/\D/g, '')

  // Check length
  if (digits.length !== 10) {
    if (digits.length < 10) {
      return { valid: false, error: 'Phone number must be 10 digits' }
    } else {
      return { valid: false, error: 'Phone number must be exactly 10 digits' }
    }
  }

  // Check for valid area code (first 3 digits cannot start with 0 or 1)
  const areaCode = digits.substring(0, 3)
  if (areaCode.startsWith('0') || areaCode.startsWith('1')) {
    return { valid: false, error: 'Please enter a valid phone number' }
  }

  // Check for valid exchange code (4th-6th digits cannot start with 0 or 1)
  const exchangeCode = digits.substring(3, 6)
  if (exchangeCode.startsWith('0') || exchangeCode.startsWith('1')) {
    return { valid: false, error: 'Please enter a valid phone number' }
  }

  // Check for obviously invalid numbers (all same digits)
  if (/^(\d)\1{9}$/.test(digits)) {
    return { valid: false, error: 'Please enter a valid phone number' }
  }

  return { valid: true }
}

/**
 * Validates that a field is not empty
 * @param value - Value to validate
 * @param fieldName - Field name for error message
 * @returns {valid: boolean, error?: string}
 */
export function validateRequired(value: string | number): {
  valid: boolean
  error?: string
} {
  if (value === null || value === undefined) {
    return { valid: false, error: 'This field is required' }
  }

  if (typeof value === 'string' && !value.trim()) {
    return { valid: false, error: 'This field is required' }
  }

  return { valid: true }
}

