import React, { useState } from "react";
import { cn } from "@/lib/utils";

interface TooltipProps {
    children: React.ReactNode;
    content: string | React.ReactNode;
    className?: string;
}

export function Tooltip({ children, content, className }: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div
            className="relative inline-flex items-center"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}
            {isVisible && (
                <div className={cn(
                    "absolute z-50 px-3 py-2 text-xs font-medium text-white bg-black border-2 border-black rounded shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2 w-max max-w-xs break-words whitespace-normal",
                    className
                )}>
                    {content}
                    <div className="absolute w-2 h-2 bg-black transform rotate-45 left-1/2 -translate-x-1/2 -bottom-1.5 border-r-2 border-b-2 border-black"></div>
                </div>
            )}
        </div>
    );
}
