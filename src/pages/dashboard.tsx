import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DtpDashboard } from "@/components/dashboard/dtp-dashboard";
import { FeasibilityDashboard } from "@/components/dashboard/feasibility-dashboard";
import { HotoDashboard } from "@/components/dashboard/hoto-dashboard";
import { DashboardSkeleton } from "@/components/dashboard/loading-skeleton";
import { FileText, Search, Cable } from "lucide-react";
import { getCircleName } from "@/lib/utils";

export function Dashboard() {
  const { circle = 'upe' } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Update document title with circle name
    const circleName = getCircleName(circle);
    document.title = `${circleName} | BharatNet Dashboard | Lepton`;
    
    // Initial data load can be handled by individual dashboard components
    setIsLoading(false);
  }, [circle]);

  if (isLoading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-[1400px] mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6">Project Dashboard</h1>
        <DashboardSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-10 max-w-[1400px] mx-auto">
        <div className="flex flex-col items-center justify-center text-center">
          <h2 className="text-2xl font-bold">Error Loading Dashboard</h2>
          <p className="text-muted-foreground mt-2">{error}</p>
          <button 
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 w-screen mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">Project Dashboard</h1>
      
      <Tabs defaultValue="dtp" className="space-y-8">
        <TabsList className="w-full h-auto p-0 bg-transparent grid grid-cols-1 sm:grid-cols-3 gap-2">
          <TabsTrigger 
            value="dtp"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-2 h-16 text-lg"
          >
            <FileText className="h-5 w-5" />
            <div className="flex flex-col items-start">
              <span className="font-semibold">Desktop Planning</span>
              <span className="text-sm font-normal opacity-80">Network Design</span>
            </div>
          </TabsTrigger>
          <TabsTrigger 
            value="feasibility"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-2 h-16 text-lg"
          >
            <Search className="h-5 w-5" />
            <div className="flex flex-col items-start">
              <span className="font-semibold">Feasibility Survey</span>
              <span className="text-sm font-normal opacity-80">Field Assessment</span>
            </div>
          </TabsTrigger>
          <TabsTrigger 
            value="hoto"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-2 h-16 text-lg"
          >
            <Cable className="h-5 w-5" />
            <div className="flex flex-col items-start">
              <span className="font-semibold">HOTO Survey</span>
              <span className="text-sm font-normal opacity-80">Network Handover</span>
            </div>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dtp">
          <DtpDashboard circle={circle} />
        </TabsContent>

        <TabsContent value="feasibility">
          <FeasibilityDashboard circle={circle} />
        </TabsContent>

        <TabsContent value="hoto">
          <HotoDashboard circle={circle} />
        </TabsContent>
      </Tabs>
    </div>
  );
}