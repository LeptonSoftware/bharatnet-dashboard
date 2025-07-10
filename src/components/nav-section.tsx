import { Icon } from "@iconify/react";
import { Link, useLocation } from "react-router";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@rio.js/ui/components/sidebar";

export function NavSection({
  title,
  items,
}: {
  title: string;
  items: Array<{
    title: string;
    url: string;
    icon?: string;
    badge?: string;
  }>;
}) {
  const location = useLocation();
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{title}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              asChild
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
  );
}
