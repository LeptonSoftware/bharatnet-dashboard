import { rio } from "@/lib/rio";
import { CopilotKit } from "@copilotkit/react-core";
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
    <NuqsAdapter>
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
              <CopilotPopup
                labels={{
                  initial: "Hello! How can I help you today?",
                  title: "Rio Copilot",
                  placeholder: "Ask me anything!",
                  stopGenerating: "Stop",
                  regenerateResponse: "Regenerate",
                }}
              />
            </SidebarInset>
          </SidebarProvider>
        </CopilotKit>
      </Authenticated>
    </NuqsAdapter>
  );
}
