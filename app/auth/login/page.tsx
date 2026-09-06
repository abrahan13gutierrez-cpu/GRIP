import { AuthShell } from '@/components/auth/auth-shell'
import { LoginForm } from '@/components/auth/login-form'

export default function LoginPage() {
  return (
    <AuthShell
      heading="WELCOME BACK"
      subheading="Log in to enter the campus, join the broadcast, and own the game."
    >
      <LoginForm />
    </AuthShell>
  )
}
