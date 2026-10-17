import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  isLoading?: boolean
  children: ReactNode
}

// ზოგადი ღილაკი: ფერი იცვლება variant-ით, დანარჩენი ატრიბუტები (onClick, type...) პირდაპირ გადადის
function Button({
  variant = 'primary',
  isLoading = false,
  children,
  disabled,
  className,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`btn-${variant} ${className ?? ''}`.trim()}
      disabled={disabled || isLoading}
      {...rest}
    >
      {isLoading ? 'ინახება...' : children}
    </button>
  )
}

export default Button
