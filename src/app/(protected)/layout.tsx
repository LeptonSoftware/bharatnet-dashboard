import { rio } from "@/lib/rio";
import {
  CopilotKit,
  useCopilotAction,
  useCopilotReadable,
} from "@copilotkit/react-core";
import { CopilotPopup } from "@copilotkit/react-ui";
import { NuqsAdapter } from "nuqs/adapters/react-router/v7";
import "@copilotkit/react-ui/styles.css";

import { useCallback } from "react";
import {
  LoaderFunctionArgs,
  Outlet,
  redirect,
  useLocation,
  useNavigate,
} from "react-router";

import { Authenticated } from "@rio.js/auth";
import { SidebarInset, SidebarProvider } from "@rio.js/ui/components/sidebar";

import { AppSidebar } from "@/components/app-sidebar";
import { fetchNationalData } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export function loader({ request }: LoaderFunctionArgs) {
  if (!rio.auth.isLoggedIn()) {
    throw redirect(`/login?to=${new URL(request.url).pathname}`);
  }

  return null;
}

export default function ProtectedLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const onUnauthenticated = useCallback(() => {
    navigate(`/login?to=${location.pathname}`, {
      viewTransition: true,
    });
  }, [navigate, location.pathname]);
  return (
    // <NuqsAdapter>
    <Authenticated onUnauthenticated={onUnauthenticated}>
      <CopilotKit
        runtimeUrl="/api/copilotkit"
        transcribeAudioUrl="/api/transcribe"
        textToSpeechUrl="/api/tts"
      >
        <SidebarProvider
          defaultOpen={false}
          style={
            {
              "--header-height": "calc(var(--spacing) * 12)",
            } as React.CSSProperties
          }
        >
          <AppSidebar collapsible="icon" variant="inset" />
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
        </SidebarProvider>
      </CopilotKit>
    </Authenticated>
    // </NuqsAdapter>
  );
}

function CopilotActions() {
  const { data: nationalData, isLoading: isLoadingNational } = useQuery({
    queryKey: ["nationalData", "punjab"],
    queryFn: () => fetchNationalData(),
  });

  const navigate = useNavigate();

  useCopilotReadable({
    description: "The list of states and abbreviations",
    value: nationalData?.map((row) => ({
      state: row.state,
      abbreviation: row.abbreviation,
    })),
  });

  useCopilotAction({
    description: "Navigate to or show the home page",
    name: "home",
    handler() {
      navigate("/home");
    },
  });

  useCopilotAction({
    description: "Navigate to or show the dashboard page",
    name: "dashboard",
    handler() {
      navigate("/dashboard");
    },
  });

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
      navigate(`/${abbreviation}`);
    },
  });
  return null;
}
