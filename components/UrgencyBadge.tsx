/**
 * Pocket Health Worker — Urgency badge
 *
 * One of three levels, always shown as icon shape + words + colour, so it never
 * depends on colour alone (house = home care, cross = clinic, triangle = emergency).
 */

"use client";

import type { UrgencyLevel } from "@/types";
import { useI18n } from "@/lib/i18n";
import { AlertIcon, ClinicIcon, HomeIcon } from "./Icons";

const CONFIG: Record<UrgencyLevel, { label: string; classes: string; Icon: typeof HomeIcon }> = {
  GREEN: { label: "Care at home", classes: "bg-home-soft text-home", Icon: HomeIcon },
  YELLOW: { label: "Visit a clinic", classes: "bg-clinic-soft text-clinic", Icon: ClinicIcon },
  RED: { label: "Emergency now", classes: "bg-danger text-white", Icon: AlertIcon },
};

export const URGENCY_LABEL: Record<UrgencyLevel, string> = {
  GREEN: CONFIG.GREEN.label,
  YELLOW: CONFIG.YELLOW.label,
  RED: CONFIG.RED.label,
};

export default function UrgencyBadge({ level }: { level: UrgencyLevel }) {
  const { t } = useI18n();
  const { classes, Icon } = CONFIG[level];
  const label = t(`urgency${level}`);
  return (
    <span className={`badge-pop inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-bold ${classes}`}>
      <Icon className="w-4 h-4" />
      {label}
    </span>
  );
}
