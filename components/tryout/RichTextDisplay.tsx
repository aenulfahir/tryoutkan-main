import { useEffect, useRef } from "react";
import "./RichTextDisplay.css";

interface RichTextDisplayProps {
  content: string;
  className?: string;
}

/**
 * Component to display rich text HTML content
 * Supports: images, YouTube embeds, tables, links, formatting
 */
export function RichTextDisplay({ content, className = "" }: RichTextDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Make all links open in new tab
    const links = containerRef.current.querySelectorAll("a");
    links.forEach((link) => {
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener noreferrer");
    });

    // Make YouTube iframes responsive
    const iframes = containerRef.current.querySelectorAll("iframe");
    iframes.forEach((iframe) => {
      if (iframe.src.includes("youtube.com") || iframe.src.includes("youtu.be")) {
        iframe.classList.add("youtube-embed");
      }
    });

    // Make images responsive
    const images = containerRef.current.querySelectorAll("img");
    images.forEach((img) => {
      img.classList.add("rich-text-image");
    });

    // Make tables responsive
    const tables = containerRef.current.querySelectorAll("table");
    tables.forEach((table) => {
      table.classList.add("rich-text-table");
    });
  }, [content]);

  return (
    <div
      ref={containerRef}
      className={`rich-text-display ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}

