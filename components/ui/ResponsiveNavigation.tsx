import { useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface ResponsiveNavigationProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
}

export function ResponsiveNavigation({
  children,
  title = "Menu",
  description,
  className,
}: ResponsiveNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn("lg:hidden min-h-[44px] min-w-[44px]", className)}
        >
          <Menu className="w-4 h-4" />
          <span className="sr-only">Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 sm:w-96">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Menu className="w-5 h-5" />
            {title}
          </SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>
        <div className="px-4 py-6 overflow-y-auto max-h-[80vh]">{children}</div>
      </SheetContent>
    </Sheet>
  );
}

interface ResponsiveNavSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function ResponsiveNavSection({
  title,
  children,
  className,
}: ResponsiveNavSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className={cn("border-b border-border", className)}>
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-accent transition-colors min-h-[44px]"
      >
        <h3 className="font-medium">{title}</h3>
        <ChevronDown
          className={cn(
            "w-4 h-4 transition-transform",
            isExpanded && "rotate-180"
          )}
        />
      </button>
      {isExpanded && <div className="px-4 pb-4 space-y-2">{children}</div>}
    </div>
  );
}

interface ResponsiveNavLinkProps {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  isActive?: boolean;
}

export function ResponsiveNavLink({
  href,
  onClick,
  children,
  icon,
  className,
  isActive = false,
}: ResponsiveNavLinkProps) {
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

interface ResponsiveNavGridProps {
  children: React.ReactNode;
  columns?: number;
  gap?: string;
  className?: string;
}

export function ResponsiveNavGrid({
  children,
  columns = 1,
  gap = "gap-4",
  className,
}: ResponsiveNavGridProps) {
  return (
    <div className={cn("grid", `grid-cols-${columns}`, gap, className)}>
      {children}
    </div>
  );
}
