"use client";

import { StickyNote, X } from "lucide-react";

interface Annotation {
  id: number;
  date: string;
  title: string;
  note: string | null;
}

interface AnnotationMarkersProps {
  annotations: Annotation[];
  onRemove?: (id: number) => void;
}

export function AnnotationMarkers({ annotations, onRemove }: AnnotationMarkersProps) {
  if (annotations.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {annotations.map((a) => (
        <div
          key={a.id}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gold/10 text-xs text-gold border border-gold/20"
          title={a.note || a.title}
        >
          <StickyNote className="h-3 w-3" />
          <span className="font-medium">{new Date(a.date).toLocaleDateString("en-GB", { month: "short", day: "numeric" })}</span>
          <span className="text-charcoal/70 max-w-[150px] truncate">{a.title}</span>
          {onRemove && (
            <button onClick={() => onRemove(a.id)} className="ml-0.5 hover:text-red-500">
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
