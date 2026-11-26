/**
 * Pocket Health Worker — Health tools panel
 *
 * Composes the three local helpers: Data Saver, the NAFDAC medicine check and the
 * hospital finder. Shown as a sidebar on wide screens and as a section on phones.
 */

"use client";

import DataSaverToggle from "./DataSaverToggle";
import NafdacCheck from "./NafdacCheck";
import FacilityFinder from "./FacilityFinder";

interface Props {
  dataSaver: boolean;
  onToggleDataSaver: (val: boolean) => void;
  selectedState: string | null;
  onStateChange: (state: string) => void;
}

export default function ClinicalSidebar({ dataSaver, onToggleDataSaver, selectedState, onStateChange }: Props) {
  return (
    <aside aria-label="Health tools" className="space-y-4">
      <div className="card p-5">
        <DataSaverToggle on={dataSaver} onChange={onToggleDataSaver} />
      </div>
      <div className="card p-5">
        <FacilityFinder selectedState={selectedState} onStateChange={onStateChange} />
      </div>
      <div className="card p-5">
        <NafdacCheck />
      </div>
    </aside>
  );
}
