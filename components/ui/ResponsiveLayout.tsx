import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ResponsiveLayoutProps {
  children: ReactNode;
  className?: string;
}

interface ResponsiveMainProps {
  children: ReactNode;
  className?: string;
  sidebar?: boolean;
}

interface ResponsiveSidebarProps {
  children: ReactNode;
  className?: string;
  collapsible?: boolean;
}

interface ResponsiveContentProps {
  children: ReactNode;
  className?: string;
  fullWidth?: boolean;
}

export function ResponsiveLayout({
  children,
  className,
}: ResponsiveLayoutProps) {
  return (
    <div className={cn("min-h-screen bg-background", className)}>
      {children}
    </div>
  );
}

export function ResponsiveMain({
  children,
  className,
  sidebar = false,
}: ResponsiveMainProps) {
  return (
    <main
      className={cn("flex-1 overflow-y-auto", sidebar && "lg:ml-64", className)}
    >
      <div className="container mx-auto px-4 sm:px-6 py-6">{children}</div>
    </main>
  );
}

export function ResponsiveSidebar({
  children,
  className,
  collapsible = false,
}: ResponsiveSidebarProps) {
  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform duration-300 ease-in-out",
        collapsible && "-translate-x-full lg:translate-x-0",
        className
      )}
    >
      <div className="flex flex-col h-full overflow-y-auto">{children}</div>
    </aside>
  );
}

export function ResponsiveContent({
  children,
  className,
  fullWidth = false,
}: ResponsiveContentProps) {
  return (
    <div className={cn("w-full", !fullWidth && "max-w-4xl mx-auto", className)}>
      {children}
    </div>
  );
}

interface ResponsiveGridProps {
  children: ReactNode;
  className?: string;
  cols?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: {
    xs?: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
  };
}

export function ResponsiveGrid({
  children,
  className,
  cols = {},
  gap = {},
}: ResponsiveGridProps) {
  const gridCols = {
    xs: cols.xs || 1,
    sm: cols.sm || 1,
    md: cols.md || 2,
    lg: cols.lg || 3,
    xl: cols.xl || 4,
  };

  const gridGap = {
    xs: gap.xs || "gap-4",
    sm: gap.sm || "gap-4",
    md: gap.md || "gap-6",
    lg: gap.lg || "gap-6",
    xl: gap.xl || "gap-8",
  };

  return (
    <div
      className={cn(
        // Base grid
        "grid",
        // Mobile columns
        `grid-cols-${gridCols.xs}`,
        gridGap.xs,
        // Small mobile columns
        `sm:grid-cols-${gridCols.sm}`,
        `sm:${gridGap.sm}`,
        // Medium columns
        `md:grid-cols-${gridCols.md}`,
        `md:${gridGap.md}`,
        // Large columns
        `lg:grid-cols-${gridCols.lg}`,
        `lg:${gridGap.lg}`,
        // Extra large columns
        `xl:grid-cols-${gridCols.xl}`,
        `xl:${gridGap.xl}`,
        className
      )}
    >
      {children}
    </div>
  );
}

interface ResponsiveStackProps {
  children: ReactNode;
  className?: string;
  direction?: "row" | "col";
  spacing?: {
    xs?: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
  };
}

export function ResponsiveStack({
  children,
  className,
  direction = "col",
  spacing = {},
}: ResponsiveStackProps) {
  const stackSpacing = {
    xs: spacing.xs || "space-y-4",
    sm: spacing.sm || "space-y-4",
    md: spacing.md || "space-y-6",
    lg: spacing.lg || "space-y-6",
    xl: spacing.xl || "space-y-8",
  };

  const flexDirection = direction === "row" ? "flex-row" : "flex-col";

  return (
    <div
      className={cn(
        "flex",
        flexDirection,
        // Mobile spacing
        stackSpacing.xs,
        // Small mobile spacing
        `sm:${stackSpacing.sm}`,
        // Medium spacing
        `md:${stackSpacing.md}`,
        // Large spacing
        `lg:${stackSpacing.lg}`,
        // Extra large spacing
        `xl:${stackSpacing.xl}`,
        className
      )}
    >
      {children}
    </div>
  );
}

interface ResponsiveCardProps {
  children: ReactNode;
  className?: string;
  padding?: {
    xs?: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
  };
}

export function ResponsiveCard({
  children,
  className,
  padding = {},
}: ResponsiveCardProps) {
  const cardPadding = {
    xs: padding.xs || "p-4",
    sm: padding.sm || "p-4",
    md: padding.md || "p-6",
    lg: padding.lg || "p-6",
    xl: padding.xl || "p-8",
  };

  return (
    <div
      className={cn(
        "bg-card rounded-lg shadow-sm border",
        // Mobile padding
        cardPadding.xs,
        // Small mobile padding
        `sm:${cardPadding.sm}`,
        // Medium padding
        `md:${cardPadding.md}`,
        // Large padding
        `lg:${cardPadding.lg}`,
        // Extra large padding
        `xl:${cardPadding.xl}`,
        className
      )}
    >
      {children}
    </div>
  );
}
