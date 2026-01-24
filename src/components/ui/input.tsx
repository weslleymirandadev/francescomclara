"use client";

import * as React from "react"
import { cn } from "@/lib/utils"
import { FaEye, FaEyeSlash } from "react-icons/fa"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string | { message?: string }
  color?: "primary" | "secondary" | string
  showPassword?: boolean
  onTogglePassword?: () => void
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, color = "default", placeholder, showPassword: controlledShowPassword, onTogglePassword, ...props }, ref) => {
    const errorMessage = typeof error === "string" ? error : error?.message
    const hasError = !!errorMessage
    const [internalShowPassword, setInternalShowPassword] = React.useState(false)
    const isPassword = type === "password"
    
    const showPassword = controlledShowPassword !== undefined ? controlledShowPassword : internalShowPassword
    const handleTogglePassword = () => {
      if (onTogglePassword) {
        onTogglePassword()
      } else {
        setInternalShowPassword(!internalShowPassword)
      }
    }
    
    const inputType = isPassword && showPassword ? "text" : type

    const getColorClasses = (colorValue: string) => {
      const colorMap: Record<string, any> = {
        default: {
          border: "border-[var(--color-s-200)]",
          ring: "focus:ring-[var(--color-s-100)] focus:border-[var(--color-s-400)]",
          label: "peer-focus:text-[var(--color-s-600)]"
        },
        primary: {
          border: "border-[var(--color-s-200)]",
          ring: "focus:ring-[var(--clara-rose)]/10 focus:border-[var(--clara-rose)]",
          label: "peer-focus:text-[var(--clara-rose)]"
        }
      }
      return colorMap[colorValue] || colorMap.default
    }

    const colorClasses = getColorClasses(color)

    return (
      <div className="relative w-full group">
        <input
          type={inputType}
          placeholder={placeholder || " "} 
          ref={ref}
          className={cn(
            "peer flex w-full rounded-xl border bg-white px-4 py-3 text-sm transition-all duration-200 outline-none",
            "placeholder-transparent focus:placeholder-slate-400",
            colorClasses.border,
            colorClasses.ring,
            hasError && "border-rose-500 focus:border-rose-500 focus:ring-rose-100",
            className
          )}
          {...props}
        />
        
        {label && (
          <label
            className={cn(
              "absolute left-3 px-1 transition-all duration-200 pointer-events-none",
              "text-xs font-bold uppercase tracking-widest",
              "top-[-9px] bg-white z-10",
              "peer-placeholder-shown:top-[12px] peer-placeholder-shown:text-sm peer-placeholder-shown:font-medium peer-placeholder-shown:tracking-normal peer-placeholder-shown:bg-transparent peer-placeholder-shown:text-s-400",
              "peer-focus:top-[-9px] peer-focus:text-xs peer-focus:font-bold peer-focus:tracking-widest peer-focus:bg-white peer-focus:z-20",
              "peer-[:not(:placeholder-shown)]:top-[-9px] peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:font-bold peer-[:not(:placeholder-shown)]:bg-white",
              colorClasses.label,
              hasError ? "text-rose-500 peer-focus:text-rose-500" : "text-s-400"
            )}
          >
            {label}
          </label>
        )}

        {isPassword && (
          <button
            type="button"
            onClick={handleTogglePassword}
            className="absolute p-2 right-3 top-1/2 -translate-y-1/2 text-s-400 hover:text-s-700 transition-colors z-30"
            tabIndex={-1}
          >
            {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
          </button>
        )}

        {errorMessage && (
          <span className="text-[10px] font-bold text-rose-500 mt-1 ml-1 uppercase tracking-tight">
            {errorMessage}
          </span>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }