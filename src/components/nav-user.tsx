import { Icon } from "@iconify/react"
import { useNavigate } from "react-router"

import { useObserver, useRio } from "@rio.js/client"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@rio.js/ui/components/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@rio.js/ui/components/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@rio.js/ui/components/sidebar"
import { useTheme } from "@rio.js/ui/components/theme-provider"

export function NavUser() {
  using _ = useObserver()
  const { isMobile } = useSidebar()
  const { setTheme, theme } = useTheme()
  const navigate = useNavigate()
  const rio = useRio()
  const user = rio.auth.me

  if (!user) {
    throw new Error("User not found")
  }

  const name: string = user.user_metadata.full_name ?? user.email?.split("@")[0]
  const initials = name
    .split(/[ -\.]/)
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg grayscale">
                <AvatarImage
                  src={user.user_metadata.avatar_url}
                  alt={user.user_metadata.full_name}
                />
                <AvatarFallback className="rounded-lg">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {user.user_metadata.full_name ?? user.email?.split("@")[0]}
                </span>
                <span className="text-muted-foreground truncate text-xs">
                  {user.email}
                </span>
              </div>
              <Icon icon="tabler:dots-vertical" className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage
                    src={user.user_metadata.avatar_url}
                    alt={user.user_metadata.full_name}
                  />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {user.user_metadata.full_name}
                  </span>
                  <span className="text-muted-foreground truncate text-xs">
                    {user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Icon icon="tabler:user-circle" />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Icon icon="tabler:credit-card" />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Icon icon="tabler:notification" />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => {
                  setTheme(theme === "light" ? "dark" : "light")
                }}
              >
                <Icon icon="tabler:palette" />
                Toggle Theme
                <Icon
                  icon={theme === "light" ? "tabler:sun" : "tabler:moon"}
                  className="ml-auto size-4"
                />
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={async () => {
                const response = await rio.auth.logout()
                if (response.success && response.redirectTo) {
                  navigate(response.redirectTo)
                }
              }}
            >
              <Icon icon="tabler:logout" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
