/**
 * Pocket Health Worker — General Medical Disclaimer
 *
 * Persistent footer banner informing the user that the triage outcome is informational 
 * and does not constitute a formal diagnosis or replace the opinion of a qualified clinician (SDG 3 safety guideline).
 */

export default function Disclaimer() {
  return (
    <p className="text-center text-[10px] md:text-xs text-slate-400 px-4 py-2 leading-relaxed">
      This tool provides{" "}
      <span className="font-medium text-slate-500">informational guidance only</span>. It is{" "}
      <span className="font-medium text-slate-500">not a diagnosis</span> and is{" "}
      <span className="font-medium text-slate-500">not a substitute for professional medical care</span>.
    </p>
  );
}
