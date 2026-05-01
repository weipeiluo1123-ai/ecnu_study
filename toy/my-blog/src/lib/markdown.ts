export function renderMarkdown(md: string): string {
  // Step 1: Extract code blocks and replace with placeholders
  const codeBlocks: { lang: string; code: string }[] = [];
  let html = md.replace(/```(\w*)\n([\s\S]*?)```/g, (_m, lang, code) => {
    const idx = codeBlocks.length;
    codeBlocks.push({ lang, code });
    return `%%CODEBLOCK_${idx}%%`;
  });

  // Step 2: Apply all inline/block transformations (no more code blocks to break)
  html = html
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold text-foreground mt-4 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-foreground mt-5 mb-2">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold text-foreground mt-6 mb-3">$1</h1>')
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code class="bg-surface-alt px-1.5 py-0.5 rounded text-neon-cyan text-sm font-mono">$1</code>')
    .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" class="my-4 rounded-xl max-w-full" />')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-neon-cyan hover:underline">$1</a>')
    .replace(/^- (.+)$/gm, '<li class="text-muted ml-4 list-disc">$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li class="text-muted ml-4 list-decimal">$1</li>')
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-2 border-neon-cyan/30 pl-4 my-2 text-muted italic">$1</blockquote>')
    .replace(/^---$/gm, '<hr class="my-6 border-border" />')
    .replace(/\n\n/g, '</p><p class="text-muted leading-relaxed mb-3">')
    .replace(/\n/g, '<br />');

  // Step 3: Wrap in paragraph if needed (skip code blocks)
  if (!html.startsWith("<h") && !html.startsWith("%%CODEBLOCK") && !html.startsWith("<blockquote") && !html.startsWith("<li") && !html.startsWith("<hr")) {
    html = '<p class="text-muted leading-relaxed mb-3">' + html + '</p>';
  }

  // Step 4: Restore code blocks with proper HTML escaping and language label
  html = html.replace(/%%CODEBLOCK_(\d+)%%/g, (_m, idx) => {
    const { lang, code } = codeBlocks[parseInt(idx)];
    const escaped = code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    const langLabel = lang
      ? `<div class="text-[10px] text-muted/50 font-mono px-4 pt-2 pb-0 select-none">${lang}</div>`
      : "";
    return `<pre class="bg-surface-alt border border-border rounded-xl my-3 overflow-x-auto">${langLabel}<code class="block text-sm font-mono text-foreground px-4 py-3 leading-relaxed">${escaped}</code></pre>`;
  });

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
