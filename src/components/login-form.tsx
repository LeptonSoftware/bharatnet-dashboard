import { Icon } from "@iconify/react"
import { useState } from "react"
import { Link, Navigate, useNavigate, useSearchParams } from "react-router"

import { useObserver, useRio } from "@rio.js/client"
import { Button } from "@rio.js/ui/components/button"
import { Input } from "@rio.js/ui/components/input"
import { Label } from "@rio.js/ui/components/label"
import { cn } from "@rio.js/ui/lib/utils"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  using _ = useObserver()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const rio = useRio()
  const navigate = useNavigate()

  const [searchParams] = useSearchParams()

  if (rio.auth.isLoggedIn()) {
    return <Navigate to={searchParams.get("to") || "/"} />
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await rio.auth.login({
        email,
        password,
      })
      if (error) throw error
      // Update this route to redirect to an authenticated route. The user already has an active session.
      navigate(searchParams.get("to") || "/", {
        viewTransition: true,
      })
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={handleLogin}
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Login to your account</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Enter your email below to login to your account
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="grid gap-3">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
            <a
              href="/forgot-password"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Forgot your password?
            </a>
          </div>
          <Input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Login"}
        </Button>
        <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
          <span className="bg-background text-muted-foreground relative z-10 px-2">
            Or continue with
          </span>
        </div>
        <Button
          variant="outline"
          className="w-full"
          type="button"
          onClick={async () => {
            const response = await rio.auth.login({
              provider: "google",
            })
            if (response.success) {
              navigate(searchParams.get("to") || "/", {
                viewTransition: true,
              })
            }
          }}
        >
          <Icon icon="mdi:google" />
          Login with Google
        </Button>
      </div>
      <div className="text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link to="/sign-up" className="underline underline-offset-4">
          Sign up
        </Link>
      </div>
    </form>
  )
}
