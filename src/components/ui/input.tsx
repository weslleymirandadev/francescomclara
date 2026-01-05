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
    
    // Usar estado controlado se fornecido, senão usar estado interno
    const showPassword = controlledShowPassword !== undefined ? controlledShowPassword : internalShowPassword
    const handleTogglePassword = () => {
      if (onTogglePassword) {
        onTogglePassword()
      } else {
        setInternalShowPassword(!internalShowPassword)
      }
    }
    
    const inputType = isPassword && showPassword ? "text" : type

    // Cores do sistema de design baseadas no globals.css
    const getColorClasses = (colorValue: string) => {
      const colorMap: Record<string, { border: string; ring: string; label: string }> = {
        primary: {
          border: "focus:border-ring",
          ring: "focus:ring-ring",
          label: "peer-focus:text-foreground",
        },
        secondary: {
          border: "focus:border-primary",
          ring: "focus:ring-primary",
          label: "peer-focus:text-primary",
        },
      }

      // Se for uma cor customizada (string que não está no mapa)
      // Retorna classes vazias - o usuário pode passar classes customizadas via className
      if (!colorMap[colorValue]) {
        return {
          border: "",
          ring: "",
          label: "",
        }
      }

      return colorMap[colorValue]
    }

    const colorClasses = getColorClasses(color)

    // Se não tiver label, retorna o input simples (compatibilidade com versão anterior)
    if (!label) {
      return (
        <div className="relative bg-inherit w-full">
          <input
            type={inputType}
            className={cn(
              "flex h-10 w-full rounded-md border border-input bg-inherit py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              isPassword ? "pr-10" : "px-3",
              !hasError && colorClasses.ring,
              !hasError && colorClasses.border,
              hasError && "border-destructive focus-visible:ring-destructive",
              className
            )}
            ref={ref}
            placeholder={placeholder}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={handleTogglePassword}
              className="absolute p-2 cursor-pointer right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
              tabIndex={-1}
            >
              {showPassword ? (
                <FaEyeSlash className="h-5 w-5" />
              ) : (
                <FaEye className="h-5 w-5" />
              )}
            </button>
          )}
        </div>
      )
    }

    // Input com label flutuante
    return (
      <div className="relative bg-inherit w-full">
        <input
          type={inputType}
          ref={ref}
          placeholder=" "
          className={cn(
            "peer h-10 w-full rounded-md border py-5 text-sm outline-none transition-colors border-input bg-inherit focus:ring-1 focus:ring-offset-0",
            isPassword ? "pr-10 pl-3" : "px-3",
            colorClasses.border,
            colorClasses.ring,
            hasError && "border-destructive focus:border-destructive focus:ring-destructive",
            className
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={handleTogglePassword}
            className="absolute p-2 cursor-pointer right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none z-10"
            tabIndex={-1}
          >
            {showPassword ? (
              <FaEyeSlash className="h-5 w-5" />
            ) : (
              <FaEye className="h-5 w-5" />
            )}
          </button>
        )}
        <label
          className={cn(
            "pointer-events-none line-clamp-1 text-nowrap absolute left-3 top-[-0.7rem] bg-inherit p-[2px] text-xs transition-all duration-200 ease-in-out",
            "peer-placeholder-shown:top-[0.45rem] peer-placeholder-shown:text-sm peer-placeholder-shown:text-muted-foreground",
            "peer-focus:top-[-0.7rem] peer-focus:text-xs",
            colorClasses.label,
            hasError ? "text-destructive peer-focus:text-destructive" : "text-muted-foreground"
          )}
        >
          {label}
        </label>
        {errorMessage && (
          <span className="text-xs text-destructive mt-1 block">{errorMessage}</span>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }