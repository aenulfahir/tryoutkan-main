import { useEffect, useRef } from "react";

interface MathContentProps {
  content: string;
  className?: string;
}

// Declare MathJax on window
declare global {
  interface Window {
    MathJax: any;
  }
}

export function MathContent({ content, className = "" }: MathContentProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load MathJax script if not already loaded
    if (!window.MathJax) {
      const script = document.createElement("script");
      script.src =
        "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js";
      script.async = true;

      // Configure MathJax before loading
      window.MathJax = {
        tex: {
          inlineMath: [
            ["$", "$"],
            ["\\(", "\\)"],
          ],
          displayMath: [
            ["$$", "$$"],
            ["\\[", "\\]"],
          ],
        },
        startup: {
          ready: () => {
            window.MathJax.startup.defaultReady();
            window.MathJax.startup.promise.then(() => {
              if (containerRef.current) {
                window.MathJax.typesetPromise([containerRef.current]);
              }
            });
          },
        },
      };

      document.head.appendChild(script);
    } else {
      // MathJax already loaded, just typeset
      if (containerRef.current && window.MathJax.typesetPromise) {
        window.MathJax.typesetPromise([containerRef.current]).catch(
          (err: any) => {
            console.error("MathJax typeset error:", err);
          }
        );
      }
    }
  }, [content]);

  return (
    <div ref={containerRef} className={className}>
      {content}
    </div>
  );
}
