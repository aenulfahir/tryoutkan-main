import { useEffect, useRef, useState } from "react";
import { YoutubeEmbed } from "@/components/ui/YoutubeEmbed";
import { Button } from "@/components/ui/button";
import { AlertCircle, ExternalLink } from "lucide-react";
import "./RichTextDisplay.css";

interface RichTextDisplayProps {
  content: string;
  className?: string;
}

/**
 * Component to display rich text HTML content
 * Supports: images, YouTube embeds, tables, links, formatting
 */
export function RichTextDisplay({
  content,
  className = "",
}: RichTextDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [youtubeVideos, setYoutubeVideos] = useState<
    Array<{ id: string; src: string; title: string }>
  >([]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Make all links open in new tab
    const links = containerRef.current.querySelectorAll("a");
    links.forEach((link) => {
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener noreferrer");
    });

    // Process YouTube iframes for better privacy and error handling
    const iframes = containerRef.current.querySelectorAll("iframe");
    const foundVideos: Array<{ id: string; src: string; title: string }> = [];

    iframes.forEach((iframe) => {
      if (
        iframe.src.includes("youtube.com") ||
        iframe.src.includes("youtu.be")
      ) {
        // Extract video ID from iframe src
        const videoIdMatch = iframe.src.match(
          /(?:embed\/|watch\?v=)([^&\n?#]+)/
        );
        const videoId = videoIdMatch ? videoIdMatch[1] : null;

        if (videoId) {
          foundVideos.push({
            id: videoId,
            src: iframe.src,
            title: iframe.title || "YouTube video",
          });

          // Replace iframe with a placeholder div
          const placeholder = document.createElement("div");
          placeholder.setAttribute("data-youtube-id", videoId);
          placeholder.setAttribute("data-youtube-src", iframe.src);
          placeholder.setAttribute(
            "data-youtube-title",
            iframe.title || "YouTube video"
          );
          placeholder.className = "youtube-placeholder";

          iframe.parentNode?.replaceChild(placeholder, iframe);
        } else {
          // Fallback for non-standard YouTube URLs
          iframe.classList.add("youtube-embed");
        }
      }
    });

    setYoutubeVideos(foundVideos);

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
    <div className={`rich-text-display ${className}`}>
      <div ref={containerRef} dangerouslySetInnerHTML={{ __html: content }} />

      {/* Render YouTube videos with our enhanced component */}
      {youtubeVideos.map((video) => (
        <div key={video.id} className="my-4">
          <YoutubeEmbed
            videoId={video.id}
            title={video.title}
            className="w-full"
          />
        </div>
      ))}
    </div>
  );
}
