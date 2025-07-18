import { useObserver, useRio } from "@rio.js/client"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@rio.js/ui/components/avatar"
import { cn } from "@rio.js/ui/lib/utils"

export function AppUserInfo() {
  using _ = useObserver()
  const rio = useRio()
  const user = rio.auth.me

  if (!user) {
    throw new Error("User not found")
  }

  return (
    <div className="grid flex-1 text-left text-sm leading-tight">
      <span className="truncate font-medium">
        {user.user_metadata.full_name}
      </span>
      <span className="text-muted-foreground truncate text-xs">
        {user.email}
      </span>
    </div>
  )
}

export function AppUserAvatar({
  className,
  ...props
}: React.ComponentProps<typeof Avatar>) {
  using _ = useObserver()
  const rio = useRio()
  const user = rio.auth.me

  if (!user) {
    throw new Error("User not found")
  }

  const name: string = user.user_metadata.full_name ?? user.email?.split("@")[0]

  const initials = name
    .split(/[ -\.]/)
    .map((n) => n[0].toUpperCase())
    .join("")

  return (
    <Avatar
      className={cn("h-8 w-8 rounded-lg grayscale", className)}
      {...props}
    >
      <AvatarImage
        src={user.user_metadata.avatar_url}
        alt={user.user_metadata.full_name}
      />
      <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
    </Avatar>
  )
}
