import { Icon } from "@iconify/react"
import { useNavigate } from "react-router"

import { useObserver, useRio } from "@rio.js/client"
import {
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@rio.js/ui/components/dropdown-menu"
import { useTheme } from "@rio.js/ui/components/theme-provider"

import { AppUserAvatar, AppUserInfo } from "./app-user"
import {
  SidebarDropdownMenu,
  SidebarDropdownMenuContent,
  SidebarDropdownMenuTrigger,
} from "./sidebar-dropdown"

export function AppUserDropdownMenu() {
  return (
    <SidebarDropdownMenu>
      <SidebarDropdownMenuTrigger>
        <AppUserAvatar />
        <AppUserInfo />
        <Icon icon="tabler:dots-vertical" className="ml-auto size-4" />
      </SidebarDropdownMenuTrigger>
      <SidebarDropdownMenuContent>
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <AppUserAvatar />
            <AppUserInfo />
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
          <ToggleThemeDropdownItem />
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <LogoutDropdownItem />
      </SidebarDropdownMenuContent>
    </SidebarDropdownMenu>
  )
}

export function LogoutDropdownItem() {
  using _ = useObserver()
  const navigate = useNavigate()
  const rio = useRio()
  return (
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
  )
}

export function ToggleThemeDropdownItem() {
  using _ = useObserver()
  const { setTheme, theme } = useTheme()
  return (
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
  )
}
