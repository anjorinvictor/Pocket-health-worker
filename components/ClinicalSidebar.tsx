/**
 * Pocket Health Worker — Health tools panel
 *
 * Composes the local helpers: Data Saver and the hospital finder. (The NAFDAC medicine
 * check has its own screen, reached from the landing page.) Shown as a sidebar on wide screens and as a section on phones.
 */

"use client";

import DataSaverToggle from "./DataSaverToggle";
import FacilityFinder from "./FacilityFinder";
import { useI18n } from "@/lib/i18n";

interface Props {
  dataSaver: boolean;
  onToggleDataSaver: (val: boolean) => void;
  selectedState: string | null;
  onStateChange: (state: string) => void;
}

export default function ClinicalSidebar({ dataSaver, onToggleDataSaver, selectedState, onStateChange }: Props) {
  const { t } = useI18n();
  return (
    <aside aria-label={t("healthTools")} className="space-y-4">
      <div className="card p-5">
        <DataSaverToggle on={dataSaver} onChange={onToggleDataSaver} />
      </div>
      <div className="card p-5">
        <FacilityFinder selectedState={selectedState} onStateChange={onStateChange} />
      </div>
    </aside>
  );
}
