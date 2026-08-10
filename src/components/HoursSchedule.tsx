import {
  collapseHourRows,
  parseHoursLines,
  parseHoursText,
} from "@/lib/format-hours";

interface HoursScheduleProps {
  hours: string | string[];
  className?: string;
}

export function HoursSchedule({ hours, className = "" }: HoursScheduleProps) {
  const parsed = Array.isArray(hours)
    ? parseHoursLines(hours)
    : parseHoursText(hours);
  const rows = collapseHourRows(parsed);

  if (rows.length === 0) return null;

  if (rows.length === 1 && !rows[0].label) {
    return (
      <p className={`text-sm text-muted leading-relaxed ${className}`.trim()}>
        {rows[0].value}
      </p>
    );
  }

  return (
    <div
      className={`rounded-lg border border-border overflow-hidden text-sm ${className}`.trim()}
    >
      <ul className="divide-y divide-border">
        {rows.map((row) => (
          <li
            key={`${row.label}-${row.value}`}
            className="flex items-start justify-between gap-4 px-3 py-2 even:bg-slate-50/70"
          >
            <span className="font-medium text-foreground shrink-0 min-w-[6.5rem]">
              {row.label}
            </span>
            <span className="text-muted text-right leading-snug">{row.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
