import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { searchParams } = new URL(request.url)
    
    // Get addressZip from URL parameter (priority 1) or request body
    const urlZipCode = searchParams.get('zip_code')
    const addressZip = urlZipCode || body.addressZip || ''
    
    const { 
      productType, 
      zipCode, 
      propertyType, 
      propertyPurpose, 
      creditGrade, 
      estimatedHomeValue, 
      mortgageBalance, 
      firstMortgageInterest, 
      secondMortgage, 
      secondMortgageBalance, 
      secondMortgageInterest, 
      additionalCash, 
      loanType, 
      bankruptcyOrForeclosure, 
      currentlyEmployed, 
      lateMortgagePayments, 
      veteranStatus, 
      email, 
      firstName, 
      lastName, 
      address, 
      city, 
      addressState, 
      phoneNumber 
    } = body
    
    // Validate that we have addressZip (from URL or body)
    if (!addressZip || addressZip.length !== 5) {
      return NextResponse.json(
        { error: 'Address zip code is required. Please provide zip_code in URL or addressZip in request body.', missingFields: ['addressZip'] },
        { status: 400 }
      )
    }
    
    // Validate required fields
    const missingFields = []
    if (!productType) missingFields.push('productType')
    if (!zipCode || zipCode.length !== 5) missingFields.push('zipCode')
    if (!propertyType) missingFields.push('propertyType')
    if (!propertyPurpose) missingFields.push('propertyPurpose')
    if (!creditGrade) missingFields.push('creditGrade')
    if (!estimatedHomeValue) missingFields.push('estimatedHomeValue')
    if (!mortgageBalance) missingFields.push('mortgageBalance')
    if (firstMortgageInterest === undefined || firstMortgageInterest === null) missingFields.push('firstMortgageInterest')
    if (!secondMortgage) missingFields.push('secondMortgage')
    // secondMortgageBalance and secondMortgageInterest are required only if secondMortgage is 'yes'
    if (secondMortgage === 'yes') {
      if (secondMortgageBalance === undefined || secondMortgageBalance === null) missingFields.push('secondMortgageBalance')
      if (secondMortgageInterest === undefined || secondMortgageInterest === null) missingFields.push('secondMortgageInterest')
    }
    if (additionalCash === undefined || additionalCash === null) missingFields.push('additionalCash')
    if (!loanType) missingFields.push('loanType')
    if (!bankruptcyOrForeclosure) missingFields.push('bankruptcyOrForeclosure')
    if (!currentlyEmployed) missingFields.push('currentlyEmployed')
    if (!lateMortgagePayments) missingFields.push('lateMortgagePayments')
    if (!veteranStatus) missingFields.push('veteranStatus')
    if (!email) missingFields.push('email')
    if (!firstName) missingFields.push('firstName')
    if (!lastName) missingFields.push('lastName')
    if (!address) missingFields.push('address')
    if (!city) missingFields.push('city')
    if (!addressState) missingFields.push('addressState')
    if (!phoneNumber) missingFields.push('phoneNumber')
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: 'All fields are required', missingFields },
        { status: 400 }
      )
    }

    // Get client IP address
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'

    // Validate required environment variables
    // Check for refinance-specific env vars first, fallback to generic ones
    const campaignId = process.env.REFINANCE_LEADPROSPER_CAMPAIGN_ID || process.env.BUY_HOME_LEADPROSPER_CAMPAIGN_ID
    const supplierId = process.env.REFINANCE_LEADPROSPER_SUPPLIER_ID || process.env.BUY_HOME_LEADPROSPER_SUPPLIER_ID
    const apiKey = process.env.REFINANCE_LEADPROSPER_API_KEY || process.env.BUY_HOME_LEADPROSPER_API_KEY
    const apiUrl = process.env.LEADPROSPER_API_URL

    if (!campaignId || !supplierId || !apiKey || !apiUrl) {
      const missingVars = []
      if (!campaignId) missingVars.push('REFINANCE_LEADPROSPER_CAMPAIGN_ID or BUY_HOME_LEADPROSPER_CAMPAIGN_ID')
      if (!supplierId) missingVars.push('REFINANCE_LEADPROSPER_SUPPLIER_ID or BUY_HOME_LEADPROSPER_SUPPLIER_ID')
      if (!apiKey) missingVars.push('REFINANCE_LEADPROSPER_API_KEY or BUY_HOME_LEADPROSPER_API_KEY')
      if (!apiUrl) missingVars.push('LEADPROSPER_API_URL')
      
      return NextResponse.json(
        { 
          error: 'Server configuration error. Please contact support.',
          details: `Missing: ${missingVars.join(', ')}`
        },
        { status: 500 }
      )
    }

    // Prepare the data for LeadProsper
    const formData = {
      lp_campaign_id: campaignId,
      lp_supplier_id: supplierId,
      lp_key: apiKey,
      lp_subid1: '',
      lp_subid2: '',
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      productType: productType.trim(),
      zipCode: zipCode.trim(),
      propertyType: propertyType.trim(),
      propertyPurpose: propertyPurpose.trim(),
      creditGrade: creditGrade.trim(),
      estimatedHomeValue: estimatedHomeValue.toString().trim(),
      mortgageBalance: mortgageBalance.toString().trim(),
      firstMortgageInterest: firstMortgageInterest.toString().trim(),
      secondMortgage: secondMortgage.trim(),
      secondMortgageBalance: secondMortgage === 'yes' ? secondMortgageBalance.toString().trim() : '',
      secondMortgageInterest: secondMortgage === 'yes' ? secondMortgageInterest.toString().trim() : '',
      additionalCash: additionalCash.toString().trim(),
      loanType: loanType.trim(),
      bankruptcyOrForeclosure: bankruptcyOrForeclosure.trim(),
      currentlyEmployed: currentlyEmployed.trim(),
      lateMortgagePayments: lateMortgagePayments.trim(),
      veteranStatus: veteranStatus.trim(),
      address: address.trim(),
      city: city.trim(),
      addressState: addressState.trim(),
      addressZip: addressZip.trim(), // From URL or localStorage
      phoneNumber: phoneNumber.trim(),
      ip_address: ip,
      user_agent: request.headers.get('user-agent') || '',
      landing_page_url: request.headers.get('referer') || '',
    }

    // Send to LeadProsper
    const API_URL = apiUrl
    const apiResponse = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(formData)
    })

    // Get the raw response text
    const rawResponse = await apiResponse.text()

    // Try to parse as JSON
    let result
    try {
      result = JSON.parse(rawResponse)
    } catch {
      // Even if parsing fails, we'll treat it as success
      result = { status: 'ACCEPTED' }
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('LeadProsper response:', result)
    }

    if (result.status === 'ACCEPTED' || result.status === 'DUPLICATED' || result.status === 'ERROR') {
      // Generate unique access token for thank you page
      const accessToken = crypto.randomUUID()
      const expiresAt = Date.now() + (10 * 60 * 1000) // Token expires in 10 minutes
      
      const successResponse = { 
        success: true, 
        message: 'Form submitted successfully',
        redirectUrl: '/thankyou',
        leadProsperStatus: result.status,
        accessToken,
        expiresAt
      }
      
      // Set secure cookie for additional validation
      const nextResponse = NextResponse.json(successResponse, { status: 200 })
      nextResponse.cookies.set('thankyou_access', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 10 * 60 // 10 minutes
      })
      
      return nextResponse
    } else {
      const errorResponse = { 
        success: false, 
        error: 'Lead submission failed',
        leadProsperStatus: result.status
      }
      return NextResponse.json(errorResponse, { status: 400 })
    }
  } catch (error) {
    console.error('Error in submit-refinance:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
