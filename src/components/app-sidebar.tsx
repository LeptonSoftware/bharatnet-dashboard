import { Icon } from "@iconify/react";
import { AudioWaveform, GalleryVerticalEnd } from "lucide-react";
import * as React from "react";

import { env } from "@rio.js/env";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@rio.js/ui/components/sidebar";

import { NavDocuments } from "@/components/nav-documents";
import { NavFooter } from "@/components/nav-footer";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";

import { AppHeader } from "./app-header";
import { NavSection } from "./nav-section";
import { TeamSwitcher } from "./team-switcher";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Lepton Software",
      logo: ({ ...props }) => (
        <img src="/lepton-logo-small.png" {...props} alt="Lepton Software" />
      ),
      plan: "SmartProjects",
    },
    // {
    //   name: "Acme Inc",
    //   logo: GalleryVerticalEnd,
    //   plan: "Enterprise",
    // },
    // {
    //   name: "Acme Corp.",
    //   logo: AudioWaveform,
    //   plan: "Startup",
    // },
  ],
  navMain: [
    {
      title: "Home",
      url: "/",
      icon: "tabler:home",
    },
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: "tabler:dashboard",
    },
    {
      title: "Analytics",
      url: "#",
      icon: "tabler:chart-bar",
    },
    {
      title: "Projects",
      url: "#",
      icon: "tabler:folder",
    },
    {
      title: "Team",
      url: "#",
      icon: "tabler:users",
    },
  ],
  navClouds: [
    {
      title: "Capture",
      icon: "tabler:camera",
      isActive: true,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Proposal",
      icon: "tabler:file-description",
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Prompts",
      icon: "tabler:file-ai",
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
  ],
  navFooter: [
    {
      title: "Help",
      url: "#",
      icon: "tabler:help",
    },
    {
      title: `${new Date().getFullYear()} Lepton Software`,
      url: "https://leptonsoftware.com",
      icon: "tabler:copyright",
    },
  ],
  documents: [
    {
      name: "Data Library",
      url: "#",
      icon: "tabler:database",
    },
    {
      name: "Reports",
      url: "#",
      icon: "tabler:report",
    },
    {
      name: "Word Assistant",
      url: "#",
      icon: "tabler:file-word",
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader className="gap-1 p-0">
        <AppHeader
          icon={({ ...props }) => <img src="/logo.png" {...props} />}
          name={env.PUBLIC_APP_NAME}
        />
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavSection title="Main" items={data.navMain} />
        <NavFooter items={data.navFooter} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter className="border-t">
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
