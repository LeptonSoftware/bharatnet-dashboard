import { Separator } from "@rio.js/ui/components/separator";
import { SidebarTrigger } from "@rio.js/ui/components/sidebar";
import { format } from "date-fns";

export function PageHeader({
  breadcrumbs,
  children,
}: {
  breadcrumbs?: {
    icon?: React.ReactNode;
    title: string;
    url?: string;
  }[];
  children?: React.ReactNode;
}) {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) group-has-data-[variant=floating]/sidebar-wrapper:h-[calc(var(--header-height)+var(--spacing)*2)]">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium flex flex-row gap-2 items-center">
          {breadcrumbs?.map((breadcrumb, index) => (
            <>
              <div
                key={breadcrumb.title}
                className="flex flex-row gap-2 items-center"
              >
                {breadcrumb.icon}
                {breadcrumb.title}
              </div>
              {index < breadcrumbs.length - 1 && (
                <Separator
                  orientation="vertical"
                  className="mx-2 data-[orientation=vertical]:h-4"
                />
              )}
            </>
          ))}
        </h1>
        <div className="ml-auto text-sm text-muted-foreground">
          {format(new Date(), "MMMM d, yyyy")}
        </div>
        {children}
      </div>
    </header>
  );
}
