import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'fancy'
type ButtonSize = 'sm' | 'default' | 'lg' | 'xl'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  href?: string
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'default', href, ...props }, ref) => {
    const baseClasses = "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background-primary disabled:pointer-events-none disabled:opacity-50"

    const variants = {
      primary: "bg-gradient-to-r from-accent-primary to-accent-primary hover:from-accent-primaryHover hover:to-accent-primaryHover text-text-primary shadow-lg shadow-accent-primary/25 hover:shadow-xl hover:shadow-accent-primary/40 hover:scale-105 disabled:hover:scale-100",
      secondary: "bg-transparent border border-border-default text-text-primary hover:bg-text-primary/5 hover:border-border-hover disabled:hover:bg-transparent",
      ghost: "bg-transparent hover:bg-text-primary/5 text-text-secondary hover:text-text-primary",
      fancy: `
        group
        relative
        overflow-hidden
        bg-gradient-to-r from-indigo-600 to-purple-600
        text-white
        font-semibold
        transform transition-all duration-300
        hover:scale-[1.02]
        hover:shadow-[0_0_40px_rgba(102,126,234,0.6)]
        active:scale-[0.98]
        before:absolute
        before:inset-0
        before:-translate-x-full
        before:bg-gradient-to-r
        before:from-transparent
        before:via-white/30
        before:to-transparent
        before:transition-transform
        before:duration-1000
        hover:before:translate-x-full
      `
    }

    const sizes = {
      sm: "h-8 px-4 py-1.5 text-xs",
      default: "h-10 px-6 py-2",
      lg: "h-12 px-8 py-3 text-base",
      xl: "h-14 px-10 py-4 text-lg"
    }

    const buttonClasses = cn(baseClasses, variants[variant], sizes[size], className)

    // If href is provided, render as anchor
    if (href) {
      return (
        <a
          href={href}
          className={buttonClasses}
        >
          {props.children}
        </a>
      )
    }

    return (
      <button
        className={buttonClasses}
        ref={ref}
        {...props}
      />
    )
  }
)

Button.displayName = "Button"

export { Button }
export type { ButtonProps }
