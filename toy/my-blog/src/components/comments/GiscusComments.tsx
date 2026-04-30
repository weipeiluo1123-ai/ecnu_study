"use client";

import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";

const GISCUS_CONFIG = {
  src: "https://giscus.app/client.js",
  "data-repo": "weipeiluo1123-ai/ecnu_study",
  "data-repo-id": "R_kgDON0TzYg",
  "data-category": "Announcements",
  "data-category-id": "DIC_kwDON0TzYs4Cm8aH",
  "data-mapping": "pathname",
  "data-strict": "0",
  "data-reactions-enabled": "1",
  "data-emit-metadata": "0",
  "data-input-position": "bottom",
  "data-lang": "zh-CN",
  "data-loading": "lazy",
  crossorigin: "anonymous",
};

export function GiscusComments() {
  const { resolvedTheme } = useTheme();
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !ref.current) return;

    const theme = resolvedTheme === "dark" ? "dark" : "light";

    const iframe = ref.current.querySelector("iframe");
    if (iframe) {
      iframe.contentWindow?.postMessage(
        { giscus: { setConfig: { theme } } },
        "https://giscus.app"
      );
      return;
    }

    const script = document.createElement("script");
    script.src = GISCUS_CONFIG.src;
    script.async = true;
    script.setAttribute("data-theme", theme);
    Object.entries(GISCUS_CONFIG).forEach(([key, val]) => {
      if (key !== "src") {
        script.setAttribute(key, val as string);
      }
    });

    ref.current.appendChild(script);
  }, [mounted, resolvedTheme]);

  if (!mounted) {
    return (
      <div className="mt-12 pt-8 border-t border-border">
        <div className="skeleton h-32 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="mt-12 pt-8 border-t border-border">
      <h3 className="text-lg font-semibold text-foreground mb-6">评论</h3>
      <div ref={ref} />
    </div>
  );
}
