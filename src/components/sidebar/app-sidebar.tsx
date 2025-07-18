import { Icon } from "@iconify/react"
import * as React from "react"

import { env } from "@rio.js/env"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarProvider,
  SidebarRail,
} from "@rio.js/ui/components/sidebar"

import { AppHeader } from "./app-header"
import { AppUserDropdownMenu } from "./app-user-menu"
import { TeamSwitcher } from "./team-switcher"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
    role: "admin", // This would come from auth context
  },
  teams: [
    {
      id: "lepton",
      name: "Lepton Software",
      logo: ({ ...props }) => (
        <img src="/lepton-logo-small.png" {...props} alt="Lepton Software" />
      ),
      plan: "Enterprise",
    },
    {
      id: "acme",
      name: "Acme Inc",
      logo: ({ ...props }) => <Icon icon="tabler:building" {...props} />,
      plan: "Enterprise",
    },
    {
      id: "acme-corp",
      name: "Acme Corp.",
      logo: ({ ...props }) => <Icon icon="tabler:building" {...props} />,
      plan: "Startup",
    },
  ],
  // Personal/User Section - Available to all users
  personalNav: [
    {
      title: "My Dashboard",
      url: "/dashboard",
      icon: "tabler:dashboard",
    },
    {
      title: "My Tasks",
      url: "/tasks",
      icon: "tabler:checklist",
      badge: "5", // Number of pending tasks
    },
    {
      title: "My Approvals",
      url: "/approvals",
      icon: "tabler:thumb-up",
      badge: "3", // Number of pending approvals
    },
    {
      title: "My Workflows",
      url: "/my-workflows",
      icon: "tabler:git-branch",
    },
    {
      title: "Notifications",
      url: "/notifications",
      icon: "tabler:bell",
      badge: "12", // Number of unread notifications
    },
  ],
  // Workflow Admin Section - Only for admins
  adminNav: [
    {
      title: "All Workflows",
      url: "/admin/workflows",
      icon: "tabler:git-branch",
    },
    {
      title: "Workflow Runs",
      url: "/admin/workflow-runs",
      icon: "tabler:play",
    },
    {
      title: "System Analytics",
      url: "/admin/analytics",
      icon: "tabler:chart-line",
    },
    {
      title: "Teams",
      url: "/admin/teams",
      icon: "tabler:users",
    },
    {
      title: "Members",
      url: "/admin/members",
      icon: "tabler:user",
    },
    {
      title: "User Management",
      url: "/admin/users",
      icon: "tabler:user-cog",
    },
    {
      title: "Workflow Templates",
      url: "/admin/templates",
      icon: "tabler:template",
    },
  ],
  // Team Management Section - For team leads and admins
  teamNav: [
    {
      title: "Team Dashboard",
      url: "/team/dashboard",
      icon: "tabler:dashboard",
    },
    {
      title: "Team Workflows",
      url: "/team/workflows",
      icon: "tabler:git-branch",
    },
    {
      title: "Team Members",
      url: "/team/members",
      icon: "tabler:users",
    },
    {
      title: "Team Analytics",
      url: "/team/analytics",
      icon: "tabler:chart-dots",
    },
  ],
  // Secondary navigation - Available to all users
  navSecondary: [
    {
      title: "Settings",
      url: "/settings",
      icon: "tabler:settings",
    },
    {
      title: "Help & Support",
      url: "/help",
      icon: "tabler:help",
    },
    {
      title: "Search",
      url: "/search",
      icon: "tabler:search",
    },
  ],
}

export function AppSidebarProvider({
  children,
  style,
  ...props
}: React.ComponentProps<typeof SidebarProvider> & {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider
      style={
        {
          "--header-height": "calc(var(--spacing) * 12)",
          ...style,
        } as React.CSSProperties
      }
      {...props}
    >
      {children}
    </SidebarProvider>
  )
}

export function AppSidebar({
  children,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  children: React.ReactNode
}) {
  return (
    <Sidebar {...props}>
      <SidebarHeader className="gap-1 p-0">
        <AppHeader
          icon={({ ...props }) => <img src="/logo.png" {...props} />}
          name={env.PUBLIC_APP_NAME}
          href="/"
        />
        {/* <TeamSwitcher
          teams={data.teams}
          activeTeamId={data.teams[0].id}
          onActiveTeamChange={() => {}}
          onAddTeam={() => {}}
        /> */}
      </SidebarHeader>
      <SidebarContent>{children}</SidebarContent>
      <SidebarFooter className="border-t">
        <AppUserDropdownMenu />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
