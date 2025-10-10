import { LoginForm } from './components/LoginForm'
import { BrandingArea } from './components/BrandingArea'

export default function LoginPage() {
  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <LoginForm />
      <BrandingArea />
    </div>
  )
}

export const metadata = {
  title: 'Login - Village Management Platform',
  description: 'Sign in to your village management dashboard',
}