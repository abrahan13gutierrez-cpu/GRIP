import { AuthScreen } from '@/components/auth/auth-screen'
import { AuthCard } from '@/components/auth/auth-card'
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form'

export default function ForgotPasswordPage() {
  return (
    <AuthScreen>
      <AuthCard title="Recuperar acceso" backHref="/auth/login">
        <ForgotPasswordForm />
      </AuthCard>
    </AuthScreen>
  )
}
