import Link from 'next/link'
import { AuthShell } from '@/components/auth/auth-shell'
import { Button } from '@/components/ui/button'

export default function SignUpSuccessPage() {
  return (
    <AuthShell
      heading="CHECK YOUR EMAIL"
      subheading="Your account is created. Confirm your email to activate your campus access."
    >
      <div className="flex flex-col gap-5 text-center">
        <p className="text-sm leading-relaxed text-muted-foreground">
          We sent a confirmation link to your inbox. Click it to verify your
          email, then log in to complete phone verification and enter the
          campus.
        </p>
        <Button asChild className="h-11 w-full">
          <Link href="/auth/login">Go to login</Link>
        </Button>
      </div>
    </AuthShell>
  )
}
