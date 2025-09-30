import { ThemeProvider } from "@/hooks/use-theme";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Dashboard } from "@/pages/dashboard";
import { Header } from "@/components/layout/header";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createClient, Session } from "@supabase/supabase-js";
const supabase = createClient(
  "https://hzgytqitccsaffrvvdff.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6Z3l0cWl0Y2NzYWZmcnZ2ZGZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5ODc4MDYsImV4cCI6MjA1NTU2MzgwNn0.L26B3duhlES6yEPLJ2ZmeSdpmkfjsBbTxAdbtz9UhEg"
);

import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useEffect, useState } from "react";

// Create a query client
const queryClient = new QueryClient();

function App() {
  const [session, setSession] = useState<Session | null>(null);
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (!session) {
    return (
      <div className="flex justify-center items-center h-screen  flex flex-col">
        <div className="flex items-center gap-4">
          <img
            src="https://leptonsoftware.com/wp-content/uploads/2021/04/Lepton-logo-for-website.png"
            alt="Lepton Software"
            className="h-6 sm:h-8"
          />
          <div className="h-6 sm:h-8 w-px bg-border" />
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <span className="text-lg sm:text-xl font-semibold">
              BharatNet Project Monitoring
            </span>
          </div>
        </div>
        <div className="w-full max-w-md">
          <Auth
            providers={[]}
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            theme="light"
          />
        </div>
      </div>
    );
  }
  return (
    <ThemeProvider defaultTheme="light">
      <QueryClientProvider client={queryClient}>
        <Router>
          <Routes>
            <Route
              path="/:circle"
              element={
                <div className="min-h-screen flex flex-col">
                  <Header />
                  <main className="flex-1 bg-muted/40">
                    <Dashboard />
                  </main>
                </div>
              }
            />
            <Route path="/" element={<Navigate to="/punjab" />} />
          </Routes>
          <Toaster />
        </Router>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
