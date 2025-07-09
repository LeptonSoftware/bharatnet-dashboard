import { createClient } from "@/lib/supabase/client"
import { useState } from "react"

import { Button } from "@rio.js/ui/components/button"
import { Input } from "@rio.js/ui/components/input"
import { Label } from "@rio.js/ui/components/label"
import { cn } from "@rio.js/ui/lib/utils"

export function UpdatePasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleForgotPassword = async (e: React.FormEvent) => {
    const supabase = createClient()
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      // Update this route to redirect to an authenticated route. The user already has an active session.
      location.href = "/protected"
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={handleForgotPassword}
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Reset Your Password</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Please enter your new password below.
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="password">New password</Label>
          <Input
            id="password"
            type="password"
            placeholder="New password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save new password"}
        </Button>
      </div>
    </form>
  )
}
