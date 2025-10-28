import { useState } from "react";
import { Menu, X, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ResponsiveSidebarProps {
  children: React.ReactNode;
  className?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

interface SidebarSectionProps {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  defaultExpanded?: boolean;
  className?: string;
}

interface SidebarItemProps {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
  isActive?: boolean;
  className?: string;
}

export function ResponsiveSidebar({
  children,
  className,
  collapsible = true,
  defaultCollapsed = false,
}: ResponsiveSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  return (
    <div
      className={cn(
        "fixed inset-y-0 left-0 z-50 bg-card border-r transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-64",
        className
      )}
    >
      {/* Mobile Toggle Button */}
      <div className="lg:hidden absolute top-4 right-4 z-10">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="min-h-[44px] min-w-[44px]"
        >
          {isCollapsed ? (
            <Menu className="w-4 h-4" />
          ) : (
            <X className="w-4 h-4" />
          )}
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
      </div>

      {/* Sidebar Content */}
      <div className="flex h-full flex-col">
        {/* Logo/Brand */}
        <div className="flex items-center justify-center h-16 px-4 border-b">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">
                T
              </span>
            </div>
            <span className="text-lg font-semibold">TryoutKan</span>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4">{children}</div>

        {/* Collapse Toggle - Desktop */}
        {collapsible && (
          <div className="hidden lg:flex absolute bottom-4 right-4 z-10">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="min-h-[44px] min-w-[44px]"
            >
              <ChevronRight
                className={cn(
                  "w-4 h-4 transition-transform",
                  isCollapsed && "rotate-180"
                )}
              />
              <span className="sr-only">Collapse Sidebar</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export function SidebarSection({
  title,
  children,
  icon,
  defaultExpanded = true,
  className,
}: SidebarSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className={cn("mb-2", className)}>
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 text-left hover:bg-accent transition-colors min-h-[44px]"
      >
        <div className="flex items-center gap-3">
          {icon && <div className="w-5 h-5 flex-shrink-0">{icon}</div>}
          <h3 className="font-medium text-sm">{title}</h3>
        </div>
        <ChevronDown
          className={cn(
            "w-4 h-4 transition-transform",
            isExpanded && "rotate-180"
          )}
        />
      </button>
      {isExpanded && <div className="px-4 pb-2 space-y-1">{children}</div>}
    </div>
  );
}

export function SidebarItem({
  href,
  onClick,
  children,
  icon,
  isActive = false,
  className,
}: SidebarItemProps) {
  const Component = href ? "a" : "button";
  const props = href ? { href } : { onClick };

  return (
    <Component
      {...props}
      className={cn(
        "w-full flex items-center gap-3 p-3 rounded-md text-left hover:bg-accent transition-colors min-h-[44px]",
        isActive && "bg-accent text-accent-foreground",
        className
      )}
    >
      {icon && <div className="w-5 h-5 flex-shrink-0">{icon}</div>}
      <span className="text-sm">{children}</span>
    </Component>
  );
}

export function SidebarFooter({ isCollapsed }: { isCollapsed: boolean }) {
  return (
    <div className="mt-auto p-4 border-t">
      <div
        className={cn(
          "flex items-center",
          isCollapsed ? "justify-center" : "justify-between"
        )}
      >
        {!isCollapsed && (
          <div className="text-xs text-muted-foreground">© 2024 TryoutKan</div>
        )}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="min-h-[36px] min-w-[36px] p-2"
          >
            <span className="text-xs">Settings</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="min-h-[36px] min-w-[36px] p-2"
          >
            <span className="text-xs">Logout</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
