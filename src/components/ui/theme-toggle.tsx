"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useThemeChoice, type ThemeChoice } from "@/lib/theme";
import { cn } from "@/lib/cn";

const OPTIONS: { id: ThemeChoice; label: string; Icon: typeof Sun }[] = [
  { id: "light", label: "Light", Icon: Sun },
  { id: "dark", label: "Dark", Icon: Moon },
  { id: "system", label: "System", Icon: Monitor },
];

/** Three-way theme switch: light, dark or follow the device setting. */
export function ThemeToggle({ showLabels = false }: { showLabels?: boolean }) {
  const { choice, set } = useThemeChoice();
  return (
    <div role="radiogroup" aria-label="Colour theme" className="inline-flex rounded-full border border-line bg-surface p-0.5">
      {OPTIONS.map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          role="radio"
          aria-checked={choice === id}
          aria-label={`${label} theme`}
          title={`${label} theme`}
          onClick={() => set(id)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2 py-1.5 text-sm font-medium transition-colors",
            choice === id ? "bg-brand text-on-brand" : "text-ink-3 hover:text-ink",
          )}
        >
          <Icon className="size-4" aria-hidden />
          {showLabels && label}
        </button>
      ))}
    </div>
  );
}
