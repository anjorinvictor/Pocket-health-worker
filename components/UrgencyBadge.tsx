/**
 * Pocket Health Worker — Triage Urgency Badge
 *
 * Visually categorizes the triage results into one of three color-coded tiers:
 *  - GREEN (Self-care, emerald pastel theme)
 *  - YELLOW (Clinic/Doctor visit, warm amber pastel theme)
 *  - RED (Emergency escalation, soft crimson pastel theme with pulsing warning light)
 * Serves as a vital visual hierarchy indicator (UN SDG 3).
 */

"use client";

import type { UrgencyLevel } from "@/types";

interface BadgeConfig {
  label: string;
  emoji: string;
  classes: string;
  dotClass: string;
}

const CONFIG: Record<UrgencyLevel, BadgeConfig> = {
  GREEN: {
    label: "Self-Care at Home",
    emoji: "🟢",
    classes: "bg-emerald-50 text-emerald-800 border border-emerald-100/80 shadow-sm shadow-emerald-50",
    dotClass: "bg-emerald-500",
  },
  YELLOW: {
    label: "Visit Clinic Soon",
    emoji: "🟡",
    classes: "bg-amber-50 text-amber-800 border border-amber-100/80 shadow-sm shadow-amber-50",
    dotClass: "bg-amber-500 animate-pulse",
  },
  RED: {
    label: "Emergency — Seek Care Now",
    emoji: "🔴",
    classes: "bg-rose-50 text-rose-800 border border-rose-150 shadow-sm shadow-rose-50",
    dotClass: "bg-rose-500 animate-ping",
  },
};

interface Props {
  level: UrgencyLevel;
}

export default function UrgencyBadge({ level }: Props) {
  const { label, classes, dotClass } = CONFIG[level];
  
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold transition-all duration-300 ${classes}`}
    >
      <span className={`w-2 h-2 rounded-full ${dotClass}`} aria-hidden />
      {label}
    </span>
  );
}
