export function renderMarkdown(md: string): string {
  let html = md
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold text-foreground mt-4 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-foreground mt-5 mb-2">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold text-foreground mt-6 mb-3">$1</h1>')
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code class="bg-surface-alt px-1.5 py-0.5 rounded text-neon-cyan text-sm font-mono">$1</code>')
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="bg-surface-alt border border-border rounded-xl p-4 my-3 overflow-x-auto"><code class="text-sm font-mono text-foreground">$2</code></pre>')
    .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" class="my-4 rounded-xl max-w-full" />')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-neon-cyan hover:underline">$1</a>')
    .replace(/^- (.+)$/gm, '<li class="text-muted ml-4 list-disc">$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li class="text-muted ml-4 list-decimal">$1</li>')
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-2 border-neon-cyan/30 pl-4 my-2 text-muted italic">$1</blockquote>')
    .replace(/^---$/gm, '<hr class="my-6 border-border" />')
    .replace(/\n\n/g, '</p><p class="text-muted leading-relaxed mb-3">')
    .replace(/\n/g, '<br />');

  if (!html.startsWith("<h") && !html.startsWith("<pre") && !html.startsWith("<blockquote") && !html.startsWith("<li") && !html.startsWith("<hr")) {
    html = '<p class="text-muted leading-relaxed mb-3">' + html + '</p>';
  }

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
