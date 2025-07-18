import { rio } from "@/lib/rio"
import {
  CopilotKit,
  useCopilotAction,
  useCopilotReadable,
} from "@copilotkit/react-core"

import "@copilotkit/react-ui/styles.css"

import { fetchNationalData } from "@/lib/api"
import { Icon } from "@iconify/react"
import { useQuery } from "@tanstack/react-query"
import { useCallback } from "react"
import {
  LoaderFunctionArgs,
  Outlet,
  redirect,
  useLocation,
  useNavigate,
} from "react-router"

import { Authenticated } from "@rio.js/auth"
import { SidebarInset } from "@rio.js/ui/components/sidebar"

import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { AppSidebarProvider } from "@/components/sidebar/app-sidebar"
import { SidebarSection } from "@/components/sidebar/sidebar-section"

export function loader({ request }: LoaderFunctionArgs) {
  if (!rio.auth.isLoggedIn()) {
    throw redirect(`/login?to=${new URL(request.url).pathname}`)
  }

  return null
}

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
  navMain: [
    {
      title: "Home",
      url: "/home",
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

export default function ProtectedLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const onUnauthenticated = useCallback(() => {
    navigate(`/login?to=${location.pathname}`, {
      viewTransition: true,
    })
  }, [navigate, location.pathname])
  return (
    <Authenticated onUnauthenticated={onUnauthenticated}>
      <CopilotKit
        runtimeUrl="/api/copilotkit"
        transcribeAudioUrl="/api/transcribe"
        textToSpeechUrl="/api/tts"
      >
        <AppSidebarProvider defaultOpen={false}>
          <AppSidebar collapsible="icon" variant="inset">
            <SidebarSection items={data.navMain} />
            <SidebarSection items={data.navSecondary} className="mt-auto" />
          </AppSidebar>
          <SidebarInset>
            <Outlet />
            <CopilotActions />
            {/* <CopilotPopup
              labels={{
                initial: "Hello! How can I help you today?",
                title: "Rio Copilot",
                placeholder: "Ask me anything!",
                stopGenerating: "Stop",
                regenerateResponse: "Regenerate",
              }}
            /> */}
          </SidebarInset>
        </AppSidebarProvider>
      </CopilotKit>
    </Authenticated>
  )
}

function CopilotActions() {
  const { data: nationalData, isLoading: isLoadingNational } = useQuery({
    queryKey: ["nationalData", "punjab"],
    queryFn: () => fetchNationalData(),
  })

  const navigate = useNavigate()

  useCopilotReadable({
    description: "The list of states and abbreviations",
    value: nationalData?.map((row) => ({
      state: row.state,
      abbreviation: row.abbreviation,
    })),
  })

  useCopilotAction({
    description: "Navigate to or show the home page",
    name: "home",
    handler() {
      navigate("/home")
    },
  })

  useCopilotAction({
    description: "Navigate to or show the dashboard page",
    name: "dashboard",
    handler() {
      navigate("/dashboard")
    },
  })

  useCopilotAction({
    description:
      "Show or navigate to the dashboard/page for a state. Use the abbreviation of the state to navigate to it",
    name: "state-dashboard",
    parameters: [
      {
        name: "abbreviation",
        type: "string",
        description: "abbreviation of the state",
      },
    ],
    handler({ abbreviation }) {
      navigate(`/${abbreviation}`)
    },
  })
  return null
}
