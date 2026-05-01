"use client";

import { useState, useRef, useEffect } from "react";
import { Smile } from "lucide-react";

const EMOJI_CATEGORIES = [
  {
    name: "表情",
    emojis: ["😀","😃","😄","😁","😅","😂","🤣","😊","😇","🙂","😉","😌","😍","🥰","😘","😗","😋","😛","😜","🤪","😝","🤑","🤗","🤭","🤔","🤐","😐","😑","😶","😏","😒","🙄","😬","😮","😯","😲","😳","🥺","😢","😭","😤","😡","🤬","😈","👿","💀","💩","🤡","👹","👺","👻","👽","🤖"],
  },
  {
    name: "手势",
    emojis: ["👍","👎","👊","✊","🤛","🤜","👏","🙌","👐","🤲","🤝","🙏","✌️","🤟","🤘","👌","🤌","💪","🖕","✍️","💅","🤳"],
  },
  {
    name: "爱心",
    emojis: ["❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💕","💞","💗","💖","💘","💝","💟","❣️","💔"],
  },
  {
    name: "符号",
    emojis: ["🔥","⭐","✨","💫","🌟","⚡","💥","💯","✅","❌","❓","❗","‼️","〰️","♻️","💤","🌀","🌈"],
  },
];

export function EmojiPicker({ onSelect }: { onSelect: (emoji: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="p-1.5 rounded-lg text-muted hover:text-neon-cyan hover:bg-surface-alt transition-colors cursor-pointer"
        title="插入 Emoji"
      >
        <Smile size={18} />
      </button>
      {open && (
        <div className="absolute bottom-10 left-0 z-50 w-72 bg-surface border border-border rounded-xl shadow-xl p-3">
          <div className="max-h-52 overflow-y-auto space-y-3">
            {EMOJI_CATEGORIES.map((cat) => (
              <div key={cat.name}>
                <div className="text-[10px] text-muted mb-1 font-medium">{cat.name}</div>
                <div className="flex flex-wrap gap-0.5">
                  {cat.emojis.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => { onSelect(emoji); setOpen(false); }}
                      className="w-7 h-7 flex items-center justify-center text-base hover:bg-surface-alt rounded-md transition-colors cursor-pointer"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
