import { useParams } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCircleName } from "@/lib/utils";

export function Header() {
  const { circle = 'upe' } = useParams();
  const circleName = getCircleName(circle);
  
  // Get yesterday's date
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const formattedDate = yesterday.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="px-4 sm:px-6 lg:px-8 w-screen mx-auto flex h-16 items-center">
        <div className="flex items-center gap-4">
          <img 
            src="https://leptonsoftware.com/wp-content/uploads/2021/04/Lepton-logo-for-website.png" 
            alt="Lepton Software"
            className="h-6 sm:h-8"
          />
          <div className="h-6 sm:h-8 w-px bg-border" />
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <span className="text-lg sm:text-xl font-semibold">BharatNet Dashboard</span>
            <span className="text-sm sm:text-base text-muted-foreground">
              ({circleName})
            </span>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <div className="text-sm text-muted-foreground hidden sm:block">
            Updated on {formattedDate}
          </div>
          <RefreshCw className="h-4 w-4 hover:scale-110 cursor-pointer" onClick={handleRefresh} />
        </div>
      </div>
    </header>
  );
}