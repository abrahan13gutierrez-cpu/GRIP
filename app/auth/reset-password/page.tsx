import { AuthScreen } from '@/components/auth/auth-screen'
import { AuthCard } from '@/components/auth/auth-card'
import { ResetPasswordForm } from '@/components/auth/reset-password-form'

export default function ResetPasswordPage() {
  return (
    <AuthScreen>
      <AuthCard title="Nueva contraseña" backHref="/auth/login">
        <ResetPasswordForm />
      </AuthCard>
    </AuthScreen>
  )
}
