import { Link } from "react-router"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@rio.js/ui/components/sidebar"

export function AppHeader({
  icon: Icon,
  name,
  ...props
}: {
  icon: React.ElementType
  name: string
} & ({ href: string } | { onClick: () => void })) {
  let button =
    "href" in props ? (
      <SidebarMenuButton size="lg" className="h-10" asChild>
        <Link to={props.href}>
          <div className="bg-transparent text-sidebar-accent-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
            <Icon className="size-6" />
          </div>
          <span className="text-base font-semibold">{name}</span>
        </Link>
      </SidebarMenuButton>
    ) : (
      <SidebarMenuButton size="lg" className="h-10" onClick={props.onClick}>
        <div className="bg-transparent text-sidebar-accent-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
          <Icon className="size-6" />
        </div>
        <span className="text-base font-semibold">{name}</span>
      </SidebarMenuButton>
    )

  return (
    <SidebarMenu className="border-b h-(--header-height) flex flex-col justify-center">
      <SidebarMenuItem className="px-2">{button}</SidebarMenuItem>
    </SidebarMenu>
  )
}
