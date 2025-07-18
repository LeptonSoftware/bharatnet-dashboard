import { Icon } from "@iconify/react"
import { Link, useLocation } from "react-router"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@rio.js/ui/components/sidebar"
import { cn } from "@rio.js/ui/lib/utils"

export function SidebarSection({
  title,
  items,
  buttons,
  ...props
}: {
  title?: string
  buttons?: Array<
    {
      title: string
      icon?: string
      badge?: string
    } & React.ComponentPropsWithoutRef<typeof SidebarMenuButton>
  >
  items: Array<{
    title: string
    url: string
    icon?: string
    badge?: string
  }>
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  const location = useLocation()

  return (
    <SidebarGroup {...props}>
      {title && <SidebarGroupLabel>{title}</SidebarGroupLabel>}
      {buttons && (
        <SidebarMenu>
          {buttons.map(({ icon, title, className, ...buttonProps }) => (
            <SidebarMenuItem className="flex items-center gap-2" key={title}>
              <SidebarMenuButton
                className={cn(
                  "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear",
                  className,
                )}
                tooltip={title}
                {...buttonProps}
              >
                {icon && <Icon icon={icon} />}
                <span>{title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      )}
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              asChild
              tooltip={item.title}
              isActive={item.url === location.pathname}
            >
              <Link to={item.url} className="flex items-center gap-2">
                {item.icon && <Icon icon={item.icon} />}
                <span className="flex-1">{item.title}</span>
                {item.badge && (
                  <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
