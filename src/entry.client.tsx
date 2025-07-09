import "vinxi/client";
import "unfonts.css";
import "./globals.css";

import { startTransition } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";

import { SupabaseAuthService } from "@rio.js/auth";
import { RioClientProvider, useObserver } from "@rio.js/client";
import { ThemeProvider } from "@rio.js/ui/components/theme-provider";
import { TooltipProvider } from "@rio.js/ui/components/tooltip";
import { fsRoutes } from "@rio.js/vinxi/fs-routes";

import { rio } from "./lib/rio";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

await rio.services.register("auth", async (rio) => {
  let service = new SupabaseAuthService(rio, {
    url: rio.env.PUBLIC_SUPABASE_AUTH_URL,
    key: rio.env.PUBLIC_SUPABASE_AUTH_ANON_KEY,
    sessions: {
      db: {
        url: rio.env.PUBLIC_SUPABASE_URL,
        key: rio.env.PUBLIC_SUPABASE_ANON_KEY,
      },
    },
  });

  await service.init();
  return service;
});

const router = createBrowserRouter(fsRoutes());

function AppRouter() {
  using _ = useObserver();
  return <RouterProvider router={router} />;
}

const queryClient = new QueryClient();

function App() {
  return (
    <RioClientProvider value={rio}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="light" storageKey="ui-theme">
          <TooltipProvider>
            <AppRouter />
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </RioClientProvider>
  );
}

const root = createRoot(document.getElementById("root")!);

startTransition(() => {
  root.render(<App />);
});
