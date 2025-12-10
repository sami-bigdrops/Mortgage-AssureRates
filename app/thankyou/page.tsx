import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import ThankYouContent from './ThankYouContent'

export default async function ThankYouPage() {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('thankyou_access')

  // If no access token cookie, redirect to home
  if (!accessToken) {
    redirect('/')
  }

  // Render the thank you page content
  return <ThankYouContent />
}
