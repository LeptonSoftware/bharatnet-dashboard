import { ReactNode } from "react"
import { Link } from "react-router"

import { env } from "@rio.js/env"

interface AuthLayoutProps {
  children: ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link to="/" className="flex items-center gap-2 font-medium">
            <div className="bg-transparent text-primary-foreground flex size-8 items-center justify-center rounded-md">
              <img src="/logo.png" className="size-6" />
            </div>
            {env.PUBLIC_APP_NAME ?? "My App"}
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">{children}</div>
        </div>
        <div className="text-center text-sm text-muted-foreground ml-auto">
          &copy; {new Date().getFullYear()}{" "}
          {env.PUBLIC_COMPANY_NAME ?? "My Company"}
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <img
          src="/wallpaper.png"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  )
}
