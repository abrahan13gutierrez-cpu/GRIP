import { AuthShell } from '@/components/auth/auth-shell'
import { SignUpForm } from '@/components/auth/sign-up-form'

export default function SignUpPage() {
  return (
    <AuthShell
      heading="JOIN GRIP"
      subheading="Create your account to unlock the catcher campus and daily live coaching."
    >
      <SignUpForm />
    </AuthShell>
  )
}
