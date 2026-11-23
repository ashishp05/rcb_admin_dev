import type { ReactNode } from "react";
import { FiAlertCircle, FiAlertTriangle, FiCheckCircle, FiInfo } from "react-icons/fi";

type Tone = "danger" | "warning" | "success" | "info";

const toneClasses: Record<Tone, string> = {
  danger: "border-danger-200 bg-danger-50 text-danger-700 dark:border-danger-800 dark:bg-danger-900/30 dark:text-danger-300",
  warning: "border-warning-200 bg-warning-50 text-warning-800 dark:border-warning-800 dark:bg-warning-900/30 dark:text-warning-300",
  success: "border-success-200 bg-success-50 text-success-800 dark:border-success-800 dark:bg-success-900/30 dark:text-success-300",
  info: "border-primary-100 bg-primary-50 text-primary-800 dark:border-primary-200 dark:bg-primary-100/40 dark:text-primary-800",
};

const toneIcon = { danger: FiAlertCircle, warning: FiAlertTriangle, success: FiCheckCircle, info: FiInfo };

// Inline message box for forms and panels.
const FormAlert = ({ tone = "info", children }: { tone?: Tone; children: ReactNode }) => {
  const Icon = toneIcon[tone];
  return (
    <div role={tone === "danger" ? "alert" : "status"} className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${toneClasses[tone]}`}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
};

export default FormAlert;
