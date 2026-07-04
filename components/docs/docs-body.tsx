"use client";

import { useEffect, useRef } from "react";

export function DocsBody({ html }: { html: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    // Add copy buttons to all <pre> blocks
    ref.current.querySelectorAll("pre").forEach(pre => {
      if (pre.querySelector(".copy-btn")) return; // already done
      const btn = document.createElement("button");
      btn.className = "copy-btn";
      btn.textContent = "Copy";
      btn.addEventListener("click", () => {
        const text = pre.querySelector("code")?.textContent ?? pre.textContent ?? "";
        navigator.clipboard.writeText(text).then(() => {
          btn.textContent = "Copied!";
          setTimeout(() => { btn.textContent = "Copy"; }, 1800);
        });
      });
      pre.style.position = "relative";
      pre.appendChild(btn);
    });
  }, [html]);

  return (
    <div
      ref={ref}
      className="docs-body"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
