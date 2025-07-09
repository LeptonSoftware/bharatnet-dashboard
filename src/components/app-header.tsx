import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@rio.js/ui/components/sidebar"

export function AppHeader({
  icon: Icon,
  name,
}: {
  icon: React.ElementType
  name: string
}) {
  return (
    <SidebarMenu className="border-b h-(--header-height) flex flex-col justify-center">
      <SidebarMenuItem className="px-2">
        <SidebarMenuButton size="lg" className="h-10">
          <div className="bg-transparent text-sidebar-accent-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
            <Icon className="size-6" />
          </div>
          <span className="text-base font-semibold">{name}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
