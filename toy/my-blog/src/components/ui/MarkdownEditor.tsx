"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  Bold, Italic, Code, Link, Image, List, ListOrdered, Quote,
  Heading1, Heading2, Table2, Eye, Edit3, Undo2, CheckSquare,
} from "lucide-react";
import { renderMarkdown } from "@/lib/markdown";

interface Props {
  content: string;
  onChange: (value: string) => void;
  format: "markdown" | "txt";
  onFormatChange?: (f: "markdown" | "txt") => void;
  draftKey?: string;
  placeholder?: string;
}

const TOOLBAR_ITEMS = [
  { icon: Bold, label: "加粗", insert: "**文本**" },
  { icon: Italic, label: "斜体", insert: "*文本*" },
  { icon: Heading1, label: "一级标题", insert: "# 标题", block: true },
  { icon: Heading2, label: "二级标题", insert: "## 标题", block: true },
  { icon: Quote, label: "引用", insert: "> 引用文本", block: true },
  { icon: Code, label: "代码块", insert: '```\n代码\n```', block: true },
  { icon: Link, label: "链接", insert: "[链接文本](url)" },
  { icon: Image, label: "图片", insert: "![描述](图片链接)" },
  { icon: List, label: "无序列表", insert: "- 列表项", block: true },
  { icon: ListOrdered, label: "有序列表", insert: "1. 列表项", block: true },
  { icon: CheckSquare, label: "任务列表", insert: "- [ ] 待办项", block: true },
  { icon: Table2, label: "表格", insert: "| 列1 | 列2 | 列3 |\n| --- | --- | --- |\n| 内容 | 内容 | 内容 |", block: true },
];

export function MarkdownEditor({
  content,
  onChange,
  format,
  onFormatChange,
  draftKey,
  placeholder = "用 Markdown 写文章...",
}: Props) {
  const [preview, setPreview] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const draftTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const isTxt = format === "txt";

  // Word / character count
  const charCount = content.length;
  const wordCount = content
    ? content.replace(/[一-鿿]/g, " a ").split(/\s+/).filter(Boolean).length
    : 0;

  // Auto-save draft
  useEffect(() => {
    if (!draftKey || !content) return;
    setDraftSaved(false);
    clearTimeout(draftTimer.current);
    draftTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(`draft:${draftKey}`, JSON.stringify({ content, format, time: Date.now() }));
        setDraftSaved(true);
      } catch {}
    }, 1500);
    return () => clearTimeout(draftTimer.current);
  }, [content, format, draftKey]);

  const insertAtCursor = useCallback(
    (template: string, block?: boolean) => {
      const el = textareaRef.current;
      if (!el) return;

      const start = el.selectionStart;
      const end = el.selectionEnd;
      const before = content.slice(0, start);
      const after = content.slice(end);

      const prefix = block && before.length > 0 && !before.endsWith("\n\n") ? "\n\n" : "";
      const suffix = block && after.length > 0 && !after.startsWith("\n") ? "\n" : "";

      const newContent = before + prefix + template + suffix + after;
      onChange(newContent);

      requestAnimationFrame(() => {
        el.focus();
        const pos = (before + prefix + template).length;
        el.setSelectionRange(pos, pos);
      });
    },
    [content, onChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Tab") {
        e.preventDefault();
        insertAtCursor("  ");
      }
    },
    [insertAtCursor]
  );

  return (
    <div>
      {/* Header: label, counts, format toggle, preview button */}
      <div className="flex items-center justify-between mb-1">
        <label className="text-sm font-medium text-foreground">内容</label>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted/60 tabular-nums">
            {charCount} 字符 | {wordCount} 词
          </span>

          {onFormatChange && (
            <div className="flex bg-surface-alt border border-border rounded-lg p-0.5">
              {(["markdown", "txt"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => onFormatChange(f)}
                  className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-md transition-colors cursor-pointer ${
                    format === f
                      ? "bg-neon-cyan/20 text-neon-cyan"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  {f === "markdown" ? <Code size={11} /> : null}
                  {f === "markdown" ? "MD" : "TXT"}
                </button>
              ))}
            </div>
          )}

          {!isTxt && (
            <button
              type="button"
              onClick={() => setPreview(!preview)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg border border-border text-xs text-muted hover:text-foreground hover:border-neon-cyan/30 transition-colors cursor-pointer"
            >
              {preview ? <Edit3 size={13} /> : <Eye size={13} />}
              {preview ? "编辑" : "预览"}
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      {isTxt ? (
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => onChange(e.target.value)}
          rows={22}
          className="w-full bg-surface-alt border border-border rounded-xl px-4 py-3 text-foreground outline-none focus:border-neon-cyan/50 transition-colors resize-y font-mono text-sm"
          placeholder="直接输入纯文本..."
        />
      ) : preview ? (
        <div
          className="min-h-[500px] bg-surface-alt border border-border rounded-xl p-6 overflow-y-auto prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
        />
      ) : (
        <>
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 bg-surface-alt border border-border border-b-0 rounded-t-xl">
            {TOOLBAR_ITEMS.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => insertAtCursor(item.insert, item.block)}
                className="p-1.5 rounded-md text-muted hover:text-foreground hover:bg-surface transition-colors cursor-pointer"
                title={item.label}
              >
                <item.icon size={15} />
              </button>
            ))}
            <div className="w-px h-5 bg-border mx-1" />
            <button
              type="button"
              onClick={() => {
                const el = textareaRef.current;
                if (el) {
                  el.focus();
                  document.execCommand("undo");
                }
              }}
              className="p-1.5 rounded-md text-muted hover:text-foreground hover:bg-surface transition-colors cursor-pointer"
              title="撤销"
            >
              <Undo2 size={15} />
            </button>
          </div>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={20}
            className="w-full bg-surface-alt border border-border border-t-0 rounded-b-xl px-4 py-3 text-foreground outline-none placeholder:text-muted focus:border-neon-cyan/50 transition-colors resize-y font-mono text-sm"
            placeholder={placeholder}
          />
        </>
      )}

      {/* Draft indicator */}
      {draftKey && draftSaved && (
        <p className="mt-1 text-[11px] text-neon-green/70">草稿已自动保存</p>
      )}
    </div>
  );
}

/** Load draft from localStorage, returns null if expired (>7 days) */
export function loadDraft(key: string): { content: string; format: "markdown" | "txt" } | null {
  try {
    const raw = localStorage.getItem(`draft:${key}`);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (Date.now() - data.time > 7 * 24 * 3600 * 1000) {
      localStorage.removeItem(`draft:${key}`);
      return null;
    }
    return { content: data.content, format: data.format };
  } catch {
    return null;
  }
}

export function clearDraft(key: string) {
  localStorage.removeItem(`draft:${key}`);
}
