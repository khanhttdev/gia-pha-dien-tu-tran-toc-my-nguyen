import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { LandingPage } from '@/components/landing/landing-page'

export default async function RootPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let authState: 'unauthenticated' | 'pending' | 'approved' = 'unauthenticated'

  if (user) {
    const status = user.app_metadata?.status
    if (status === 'approved') {
      redirect('/home')
    } else {
      authState = 'pending'
    }
  }

  return <LandingPage authState={authState} />
}
