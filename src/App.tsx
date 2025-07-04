import { ThemeProvider } from '@/hooks/use-theme';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Dashboard } from '@/pages/dashboard';
import { Header } from '@/components/layout/header';
import { Toaster } from '@/components/ui/toaster';
import { 
  QueryClient, 
  QueryClientProvider,
} from '@tanstack/react-query';

// Create a query client
const queryClient = new QueryClient();

function App() {
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
          </Routes>
          <Toaster />
        </Router>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App