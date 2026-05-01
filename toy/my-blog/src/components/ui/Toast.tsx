"use client";

import { useEffect } from "react";
import { CheckCircle, XCircle, X } from "lucide-react";

interface ToastProps {
  type: "success" | "error";
  message: string;
  onClose: () => void;
  duration?: number;
}

export function Toast({ type, message, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div className="fixed top-6 right-6 z-50 animate-in fade-in slide-in-from-top-2">
      <div
        className={`flex items-center gap-3 px-5 py-3 rounded-xl border shadow-lg backdrop-blur-sm ${
          type === "success"
            ? "bg-neon-green/10 border-neon-green/30 text-neon-green"
            : "bg-red-500/10 border-red-500/30 text-red-400"
        }`}
      >
        {type === "success" ? <CheckCircle size={18} /> : <XCircle size={18} />}
        <span className="text-sm font-medium">{message}</span>
        <button
          onClick={onClose}
          className="ml-2 p-0.5 rounded hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
