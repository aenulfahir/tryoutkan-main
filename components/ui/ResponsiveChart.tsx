import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ResponsiveChartProps {
  children: ReactNode;
  title?: string;
  description?: string;
  className?: string;
  height?: {
    xs?: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
  };
  width?: {
    xs?: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
  };
}

export function ResponsiveChart({
  children,
  title,
  description,
  className,
  height = {},
  width = {},
}: ResponsiveChartProps) {
  const chartHeight = {
    xs: height.xs || "h-64",
    sm: height.sm || "h-80",
    md: height.md || "h-96",
    lg: height.lg || "h-80",
    xl: height.xl || "h-96",
  };

  const chartWidth = {
    xs: width.xs || "w-full",
    sm: width.sm || "w-full",
    md: width.md || "w-full",
    lg: width.lg || "w-full",
    xl: width.xl || "w-full",
  };

  return (
    <div className={cn("bg-card rounded-lg shadow-sm border p-4", className)}>
      {title && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      )}

      <div
        className={cn(
          // Base chart
          "w-full overflow-hidden",
          // Mobile height
          chartHeight.xs,
          // Small mobile height
          `sm:${chartHeight.sm}`,
          // Medium height
          `md:${chartHeight.md}`,
          // Large height
          `lg:${chartHeight.lg}`,
          // Extra large height
          `xl:${chartHeight.xl}`,
          // Mobile width
          chartWidth.xs,
          // Small mobile width
          `sm:${chartWidth.sm}`,
          // Medium width
          `md:${chartWidth.md}`,
          // Large width
          `lg:${chartWidth.lg}`,
          // Extra large width
          `xl:${chartWidth.xl}`,
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}

interface ResponsiveChartContainerProps {
  children: ReactNode;
  className?: string;
  columns?: {
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

export function ResponsiveChartContainer({
  children,
  className,
  columns = {},
  gap = {},
}: ResponsiveChartContainerProps) {
  const chartColumns = {
    xs: columns.xs || 1,
    sm: columns.sm || 1,
    md: columns.md || 2,
    lg: columns.lg || 3,
    xl: columns.xl || 4,
  };

  const chartGap = {
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
        `grid-cols-${chartColumns.xs}`,
        chartGap.xs,
        // Small mobile columns
        `sm:grid-cols-${chartColumns.sm}`,
        `sm:${chartGap.sm}`,
        // Medium columns
        `md:grid-cols-${chartColumns.md}`,
        `md:${chartGap.md}`,
        // Large columns
        `lg:grid-cols-${chartColumns.lg}`,
        `lg:${chartGap.lg}`,
        // Extra large columns
        `xl:grid-cols-${chartColumns.xl}`,
        `xl:${chartGap.xl}`,
        className
      )}
    >
      {children}
    </div>
  );
}

interface ResponsiveChartLegendProps {
  children: ReactNode;
  className?: string;
  direction?: {
    xs?: "row" | "column";
    sm?: "row" | "column";
    md?: "row" | "column";
    lg?: "row" | "column";
    xl?: "row" | "column";
  };
  wrap?: {
    xs?: boolean;
    sm?: boolean;
    md?: boolean;
    lg?: boolean;
    xl?: boolean;
  };
}

export function ResponsiveChartLegend({
  children,
  className,
  direction = {},
  wrap = {},
}: ResponsiveChartLegendProps) {
  const legendDirection = {
    xs: direction.xs || "column",
    sm: direction.sm || "row",
    md: direction.md || "row",
    lg: direction.lg || "row",
    xl: direction.xl || "row",
  };

  const legendWrap = {
    xs: wrap.xs !== false,
    sm: wrap.sm !== false,
    md: wrap.md !== false,
    lg: wrap.lg !== false,
    xl: wrap.xl !== false,
  };

  return (
    <div
      className={cn(
        // Base flex
        "flex",
        // Mobile direction
        `flex-${legendDirection.xs}`,
        // Mobile wrap
        legendWrap.xs ? "flex-wrap" : "flex-nowrap",
        // Small mobile direction
        `sm:flex-${legendDirection.sm}`,
        // Small mobile wrap
        legendWrap.sm ? "sm:flex-wrap" : "sm:flex-nowrap",
        // Medium direction
        `md:flex-${legendDirection.md}`,
        // Medium wrap
        legendWrap.md ? "md:flex-wrap" : "md:flex-nowrap",
        // Large direction
        `lg:flex-${legendDirection.lg}`,
        // Large wrap
        legendWrap.lg ? "lg:flex-wrap" : "lg:flex-nowrap",
        // Extra large direction
        `xl:flex-${legendDirection.xl}`,
        // Extra large wrap
        legendWrap.xl ? "xl:flex-wrap" : "xl:flex-nowrap",
        className
      )}
    >
      {children}
    </div>
  );
}

interface ResponsiveChartTooltipProps {
  children: ReactNode;
  className?: string;
  position?: "top" | "bottom" | "left" | "right";
}

export function ResponsiveChartTooltip({
  children,
  className,
  position = "top",
}: ResponsiveChartTooltipProps) {
  return (
    <div
      className={cn(
        "absolute z-10 bg-popover text-popover-foreground px-3 py-2 text-sm rounded-md shadow-md border",
        position === "top" &&
          "bottom-full left-1/2 transform -translate-x-1/2 mb-2",
        position === "bottom" &&
          "top-full left-1/2 transform -translate-x-1/2 mt-2",
        position === "left" &&
          "right-full top-1/2 transform -translate-y-1/2 mr-2",
        position === "right" &&
          "left-full top-1/2 transform -translate-y-1/2 ml-2",
        className
      )}
    >
      {children}
    </div>
  );
}

interface ResponsiveChartControlsProps {
  children: ReactNode;
  className?: string;
  direction?: "row" | "column";
}

export function ResponsiveChartControls({
  children,
  className,
  direction = "row",
}: ResponsiveChartControlsProps) {
  return (
    <div
      className={cn(
        "flex",
        direction === "row" ? "flex-row" : "flex-col",
        "gap-2",
        "p-2",
        "bg-muted rounded-md",
        className
      )}
    >
      {children}
    </div>
  );
}
