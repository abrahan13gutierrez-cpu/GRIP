import Link from 'next/link'
import { AuthShell } from '@/components/auth/auth-shell'
import { Button } from '@/components/ui/button'

export default function AuthErrorPage() {
  return (
    <AuthShell
      heading="SOMETHING WENT WRONG"
      subheading="We couldn't complete that request. Let's get you back in the game."
    >
      <div className="flex flex-col gap-5 text-center">
        <p className="text-sm leading-relaxed text-muted-foreground">
          Your authentication link may have expired or already been used. Please
          try logging in again.
        </p>
        <Button asChild className="h-11 w-full">
          <Link href="/auth/login">Back to login</Link>
        </Button>
      </div>
    </AuthShell>
  )
}
