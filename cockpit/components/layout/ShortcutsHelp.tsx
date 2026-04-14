"use client";
import { useState, useEffect } from "react";
import { X } from "lucide-react";

const shortcuts = [
  { keys: ["1-7"], description: "Navigate to department" },
  { keys: ["/"], description: "Open CI Chat" },
  { keys: ["Esc"], description: "Close CI Chat / modal" },
  { keys: ["?"], description: "Show this help" },
];

export function ShortcutsHelp() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function handle() { setOpen((prev) => !prev); }
    window.addEventListener("toggle-shortcuts-help", handle);
    return () => window.removeEventListener("toggle-shortcuts-help", handle);
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40" onClick={() => setOpen(false)}>
      <div className="bg-white dark:bg-[#162535] rounded-2xl shadow-2xl p-6 w-80 border border-warm-border" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-charcoal">Keyboard Shortcuts</h2>
          <button onClick={() => setOpen(false)} className="text-text-secondary hover:text-charcoal">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-3">
          {shortcuts.map((s) => (
            <div key={s.description} className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">{s.description}</span>
              <div className="flex gap-1">
                {s.keys.map((k) => (
                  <kbd key={k} className="px-2 py-0.5 rounded bg-warm-gray dark:bg-[#1A2836] text-xs font-mono text-charcoal border border-warm-border">
                    {k}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
