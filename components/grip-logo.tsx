import Image from 'next/image'
import { cn } from '@/lib/utils'

export function GripLogo({
  size = 48,
  showWordmark = true,
  className,
}: {
  size?: number
  showWordmark?: boolean
  className?: string
}) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <Image
        src="/grip-logo.png"
        alt="GRIP Catching University"
        width={size}
        height={size}
        priority
        className="object-contain"
      />
      {showWordmark && (
        <div className="flex flex-col leading-none">
          <span className="font-mono text-lg font-bold tracking-[0.35em] text-foreground">
            GRIP
          </span>
          <span className="mt-1 font-mono text-[10px] font-medium tracking-[0.3em] text-primary">
            OWN THE GAME
          </span>
        </div>
      )}
    </div>
  )
}
