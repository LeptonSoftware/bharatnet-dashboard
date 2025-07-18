import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@rio.js/ui/components/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@rio.js/ui/components/sidebar"
import { cn } from "@rio.js/ui/lib/utils"

export function SidebarDropdownMenuTrigger({
  children,
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuTrigger>) {
  return (
    <DropdownMenuTrigger asChild>
      <SidebarMenuButton
        size="lg"
        className={cn(
          "data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground",
          className,
        )}
        {...props}
      >
        {children}
      </SidebarMenuButton>
    </DropdownMenuTrigger>
  )
}

export function SidebarDropdownMenu({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>{children}</DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

export function SidebarDropdownMenuContent({
  className,
  children,
  ...props
}: {
  children: React.ReactNode
  className?: string
} & React.ComponentProps<typeof DropdownMenuContent>) {
  const { isMobile } = useSidebar()

  return (
    <DropdownMenuContent
      className={cn(
        "w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg",
        className,
      )}
      side={isMobile ? "bottom" : "right"}
      align="end"
      sideOffset={4}
      {...props}
    >
      {children}
    </DropdownMenuContent>
  )
}
