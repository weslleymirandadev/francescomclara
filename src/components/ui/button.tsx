import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-bold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[var(--color-s-900)] text-white hover:opacity-90 shadow-sm shadow-[var(--color-s-900)]/10",
        destructive: "bg-rose-500 text-white hover:bg-rose-600",
        outline: "border border-[var(--color-s-200)] bg-white hover:bg-[var(--color-s-50)] text-[var(--color-s-700)]",
        secondary: "bg-[var(--color-s-100)] text-[var(--color-s-900)] hover:bg-[var(--color-s-200)]",
        ghost: "hover:bg-[var(--color-s-100)] text-[var(--color-s-600)]",
        link: "text-[var(--color-s-900)] underline-offset-4 hover:underline",
        accent: "bg-[var(--clara-rose)] text-white hover:opacity-90 shadow-sm",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 px-3 text-xs",
        lg: "h-14 px-10 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn("cursor-pointer", buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }