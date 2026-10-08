import type { LucideIcon } from "lucide-react";

export function TeacherStat({ label, value, icon: Icon, accent = "text-bone" }: { label: string; value: string; icon: LucideIcon; accent?: string }) {
  return (
    <div className="panel corner p-4">
      <div className="flex items-center justify-between">
        <p className="label !text-[10px]">{label}</p>
        <Icon className="h-4 w-4 text-flare" />
      </div>
      <p className={`mt-2 font-mono text-2xl font-semibold sm:text-3xl ${accent}`}>{value}</p>
    </div>
  );
}

export function TeacherStats({ items }: { items: { label: string; value: string; icon: LucideIcon; accent?: string }[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {items.map((i) => (
        <TeacherStat key={i.label} {...i} />
      ))}
    </div>
  );
}
