import Link from 'next/link'
import { AuthScreen } from '@/components/auth/auth-screen'
import { AuthCard } from '@/components/auth/auth-card'
import { SignUpForm } from '@/components/auth/sign-up-form'

export default function SignUpPage() {
  return (
    <AuthScreen>
      <AuthCard
        title="Crea tu cuenta en GRIP"
        backHref="/auth/login"
        footer={
          <>
            {'¿Ya tienes cuenta? '}
            <Link
              href="/auth/login"
              className="text-foreground underline-offset-4 hover:underline"
            >
              Inicia sesión
            </Link>
          </>
        }
      >
        <SignUpForm />
      </AuthCard>
    </AuthScreen>
  )
}
