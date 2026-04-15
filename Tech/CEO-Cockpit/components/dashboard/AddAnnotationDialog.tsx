"use client";

import { useState } from "react";
import { StickyNote, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AddAnnotationDialogProps {
  onAdd: (date: string, title: string, note?: string) => void;
}

export function AddAnnotationDialog({ onAdd }: AddAnnotationDialogProps) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");

  function handleSubmit() {
    if (!title.trim()) return;
    onAdd(date, title.trim(), note.trim() || undefined);
    setTitle("");
    setNote("");
    setOpen(false);
  }

  if (!open) {
    return (
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)} className="text-xs text-text-secondary hover:text-gold gap-1">
        <StickyNote className="h-3 w-3" />
        Add Note
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40" onClick={() => setOpen(false)}>
      <div className="bg-white dark:bg-[#162535] rounded-2xl shadow-2xl p-5 w-96 border border-warm-border" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-charcoal">Add Annotation</h3>
          <button onClick={() => setOpen(false)} className="text-text-secondary hover:text-charcoal">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-text-secondary font-medium">Date</label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1" />
          </div>
          <div>
            <label className="text-xs text-text-secondary font-medium">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Easter holiday week" className="mt-1" />
          </div>
          <div>
            <label className="text-xs text-text-secondary font-medium">Note (optional)</label>
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Expected revenue dip due to..." className="mt-1" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={handleSubmit} disabled={!title.trim()} className="bg-gold hover:bg-gold-dark text-white gap-1">
              <Plus className="h-3 w-3" />
              Add
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
