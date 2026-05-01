/**
 * Lightweight Markdown → HTML renderer.
 * Pipeline: code blocks → block-level → inline → sanitize → restore blocks.
 *
 * Supports: headings, tables, task lists, strikethrough, nested lists,
 * blockquotes, images, links, inline code, fenced code blocks with lang label,
 * horizontal rules.
 */

// ── Step 1: extract fenced code blocks ──────────────────────────
function extractCodeBlocks(md: string) {
  const blocks: { lang: string; code: string }[] = [];
  const safe = md.replace(/```(\S*)\n([\s\S]*?)```/g, (_m, lang, code) => {
    const idx = blocks.length;
    blocks.push({ lang, code });
    return `\n%%CB${idx}%%\n`;
  });
  // Escape any remaining unclosed ``` markers (prevent HTML corruption)
  return { safe: safe.replace(/```/g, "&#96;&#96;&#96;"), blocks };
}

// ── Inline helpers ──────────────────────────────────────────────
function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// ── Step 2: process block-level elements ────────────────────────
function processBlocks(text: string): string {
  const lines = text.split("\n");
  const out: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Blank line
    if (!trimmed) {
      // Close any open list
      out.push("");
      i++;
      continue;
    }

    // Code block placeholder (keep as-is)
    if (/^%%CB\d+%%$/.test(trimmed)) {
      out.push(trimmed);
      i++;
      continue;
    }

    // Headings (h1-h6)
    const hMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (hMatch) {
      const level = hMatch[1].length;
      const text = hMatch[2];
      const sizes: Record<number, string> = {
        1: "text-2xl font-bold text-foreground mt-6 mb-3",
        2: "text-xl font-bold text-foreground mt-5 mb-2",
        3: "text-lg font-bold text-foreground mt-4 mb-2",
        4: "text-base font-bold text-foreground mt-3 mb-1",
        5: "text-sm font-bold text-foreground mt-3 mb-1",
        6: "text-xs font-bold text-foreground mt-2 mb-1",
      };
      out.push(
        `<h${level} class="${sizes[level]}">${processInlines(text)}</h${level}>`
      );
      i++;
      continue;
    }

    // Horizontal rule
    if (/^(-{3,}|\*{3,})\s*$/.test(trimmed)) {
      out.push('<hr class="my-6 border-border" />');
      i++;
      continue;
    }

    // Blockquote (multi-line)
    if (trimmed.startsWith("> ")) {
      const qLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("> ")) {
        qLines.push(lines[i].trim().slice(2));
        i++;
      }
      const qHtml = processInlines(qLines.join("<br>"));
      out.push(
        `<blockquote class="border-l-2 border-neon-cyan/30 pl-4 my-2 text-muted italic">${qHtml}</blockquote>`
      );
      continue;
    }

    // Table detection: a header row followed by a separator row (| --- | --- |)
    if (
      trimmed.startsWith("|") &&
      trimmed.endsWith("|") &&
      i + 1 < lines.length &&
      /^\|[\s\-:|]+\|$/.test(lines[i + 1]?.trim() ?? "")
    ) {
      const headCells = parseTableRow(trimmed);
      const sepRow = lines[i + 1].trim();
      const aligns = parseTableAligns(sepRow);
      i += 2; // consume header + separator

      const bodyRows: string[][] = [];
      while (
        i < lines.length &&
        lines[i].trim().startsWith("|") &&
        lines[i].trim().endsWith("|")
      ) {
        bodyRows.push(parseTableRow(lines[i].trim()));
        i++;
      }

      out.push(buildTable(headCells, aligns, bodyRows));
      continue;
    }

    // Task list (must check before unordered list)
    const taskMatch = trimmed.match(/^-\s*\[([ xX])\]\s+(.+)$/);
    if (taskMatch) {
      const checked = taskMatch[1] !== " ";
      const items: { checked: boolean; html: string }[] = [];
      items.push({ checked, html: processInlines(taskMatch[2]) });
      i++;
      // Consume subsequent task items
      while (i < lines.length) {
        const sub = lines[i].trim().match(/^-\s*\[([ xX])\]\s+(.+)$/);
        if (sub) {
          items.push({
            checked: sub[1] !== " ",
            html: processInlines(sub[2]),
          });
          i++;
        } else break;
      }
      out.push(buildTaskList(items));
      continue;
    }

    // Unordered list
    if (/^-\s+(?!\[[ xX]\])/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^-\s+(?!\[[ xX]\])/.test(lines[i].trim())) {
        items.push(processInlines(lines[i].trim().replace(/^-\s+/, "")));
        i++;
      }
      out.push(buildList("ul", items));
      continue;
    }

    // Ordered list
    if (/^\d+\.\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(
          processInlines(lines[i].trim().replace(/^\d+\.\s+/, ""))
        );
        i++;
      }
      out.push(buildList("ol", items));
      continue;
    }

    // Paragraph — collect non-empty lines until a blank line or block token
    const pLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^%%CB\d+%%$/.test(lines[i].trim()) &&
      !/^(#{1,3}\s|-{3,}|\*{3,}|>\s)/.test(lines[i].trim()) &&
      !lines[i].trim().startsWith("|") &&
      !/^-\s+/.test(lines[i].trim()) &&
      !/^\d+\.\s+/.test(lines[i].trim())
    ) {
      pLines.push(lines[i]);
      i++;
    }
    if (pLines.length > 0) {
      const pHtml = processInlines(pLines.join("\n"));
      out.push(
        `<p class="text-muted leading-relaxed mb-3">${pHtml}</p>`
      );
    } else {
      i++; // skip unrecognized line
    }
  }

  return out.join("\n");
}

// ── Table helpers ───────────────────────────────────────────────
function parseTableRow(line: string): string[] {
  return line
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((c) => c.trim());
}

function parseTableAligns(sep: string): ("left" | "center" | "right")[] {
  return sep
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((c) => {
      const t = c.trim();
      if (t.startsWith(":") && t.endsWith(":")) return "center";
      if (t.endsWith(":")) return "right";
      return "left";
    });
}

function buildTable(
  head: string[],
  aligns: ("left" | "center" | "right")[],
  rows: string[][]
): string {
  const ths = head
    .map(
      (h, i) =>
        `<th class="px-3 py-2 text-left text-xs font-semibold text-foreground border-b border-border bg-surface-alt" style="text-align:${aligns[i] || "left"}">${processInlines(h)}</th>`
    )
    .join("");
  const thead = `<thead><tr>${ths}</tr></thead>`;

  const tbodyRows = rows
    .map((row) => {
      const tds = row
        .map(
          (c, i) =>
            `<td class="px-3 py-2 text-sm text-muted border-b border-border/50" style="text-align:${aligns[i] || "left"}">${processInlines(c)}</td>`
        )
        .join("");
      return `<tr class="hover:bg-surface-alt/50 transition-colors">${tds}</tr>`;
    })
    .join("");

  return `<div class="overflow-x-auto my-4 rounded-lg border border-border"><table class="w-full"><colgroup></colgroup>${thead}<tbody>${tbodyRows}</tbody></table></div>`;
}

// ── List builders ───────────────────────────────────────────────
function buildList(tag: "ul" | "ol", items: string[]): string {
  const cls =
    tag === "ul"
      ? "text-muted ml-4 list-disc"
      : "text-muted ml-4 list-decimal";
  const liItems = items
    .map((item) => `<li class="${cls}">${item}</li>`)
    .join("");
  return `<${tag} class="my-2 space-y-1">${liItems}</${tag}>`;
}

function buildTaskList(
  items: { checked: boolean; html: string }[]
): string {
  const lis = items
    .map((item) => {
      const check = item.checked
        ? '<span class="inline-flex items-center justify-center w-4 h-4 rounded border border-neon-green/50 bg-neon-green/10 text-neon-green text-[10px] mr-2">✓</span>'
        : '<span class="inline-flex items-center justify-center w-4 h-4 rounded border border-border bg-surface-alt mr-2"></span>';
      return `<li class="flex items-start gap-1 text-muted my-1">${check}<span class="${item.checked ? "line-through text-muted/60" : ""}">${item.html}</span></li>`;
    })
    .join("");
  return `<ul class="my-2 space-y-0.5 list-none">${lis}</ul>`;
}

// ── Step 3: process inline elements ─────────────────────────────
function processInlines(text: string): string {
  // Must process bold+italic first (***), then bold (**), then italic (*)
  return (
    text
      // Images (before links)
      .replace(
        /!\[(.*?)\]\((.*?)\)/g,
        '<img src="$2" alt="$1" class="my-4 rounded-xl max-w-full" loading="lazy" />'
      )
      // Links — allow parentheses in URLs by matching balanced parens
      .replace(
        /\[([^\]]+)\]\(((?:[^()]|\([^()]*\))+)\)/g,
        '<a href="$2" class="text-neon-cyan hover:underline" rel="noopener noreferrer">$1</a>'
      )
      // Bold + Italic
      .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
      // Bold
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      // Italic
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      // Strikethrough
      .replace(/~~(.+?)~~/g, "<del class=\"text-muted/60\">$1</del>")
      // Inline code
      .replace(
        /`([^`]+)`/g,
        '<code class="bg-surface-alt px-1.5 py-0.5 rounded text-neon-cyan text-sm font-mono">$1</code>'
      )
      // Line breaks (before paragraph wrapping)
      .replace(/\n/g, "<br>")
  );
}

// ── Step 4: XSS sanitization ────────────────────────────────────
function sanitize(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "")
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/ on\w+\s*=\s*"[^"]*"/gi, "")
    .replace(/ on\w+\s*=\s*'[^']*'/gi, "")
    .replace(/ on\w+\s*=\s*[^\s>]+/gi, "")
    .replace(/javascript\s*:/gi, "blocked:");
}

// ── Step 5: restore code blocks ─────────────────────────────────
function restoreCodeBlocks(
  html: string,
  blocks: { lang: string; code: string }[]
): string {
  return html.replace(/%%CB(\d+)%%/g, (_m, idx) => {
    const { lang, code } = blocks[parseInt(idx)];
    const escaped = escapeHtml(code);
    const langLabel = lang
      ? `<div class="text-[10px] text-muted/50 font-mono px-4 pt-2 pb-0 select-none uppercase tracking-wider">${lang}</div>`
      : "";
    return `<pre class="bg-surface-alt border border-border rounded-xl my-3 overflow-x-auto">${langLabel}<code class="block text-sm font-mono text-foreground px-4 py-3 leading-relaxed">${escaped}</code></pre>`;
  });
}

// ── Public API ──────────────────────────────────────────────────

export function renderMarkdown(md: string): string {
  if (!md) return "";

  // Step 1: Extract code blocks
  const { safe, blocks } = extractCodeBlocks(md);

  // Step 2: Process block-level elements
  let html = processBlocks(safe);

  // Step 3: Clean up excess whitespace
  html = html.replace(/\n{3,}/g, "\n\n").trim();

  // Step 4: XSS sanitization
  html = sanitize(html);

  // Step 5: Restore code blocks
  html = restoreCodeBlocks(html, blocks);

  return html;
}

export function renderContent(content: string, format: string): string {
  if (format === "txt") {
    return content
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\n/g, "<br>")
      .replace(/  /g, "&nbsp;&nbsp;");
  }
  return renderMarkdown(content);
}
