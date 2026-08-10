export interface HourRow {
  label: string;
  value: string;
}

const DAY_NAMES = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

const OSM_DAY_INDEX: Record<string, number> = {
  Mo: 0,
  Tu: 1,
  We: 2,
  Th: 3,
  Fr: 4,
  Sa: 5,
  Su: 6,
};

const FULL_DAY_PATTERN =
  /^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\s*:/i;

function splitDayLine(line: string): HourRow | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  const colon = trimmed.indexOf(":");
  if (colon > 0) {
    return {
      label: trimmed.slice(0, colon).trim(),
      value: trimmed.slice(colon + 1).trim(),
    };
  }

  return { label: "", value: trimmed };
}

function expandOsmDaySpec(spec: string): number[] {
  const token = spec.trim();
  if (!token) return [];

  if (token.includes("-")) {
    const [start, end] = token.split("-", 2);
    const startIdx = OSM_DAY_INDEX[start.trim()];
    const endIdx = OSM_DAY_INDEX[end.trim()];
    if (startIdx == null || endIdx == null) return [];

    const days: number[] = [];
    for (let i = startIdx; i <= endIdx; i++) days.push(i);
    return days;
  }

  if (token.includes(",")) {
    return token.split(",").flatMap((part) => expandOsmDaySpec(part));
  }

  const idx = OSM_DAY_INDEX[token];
  return idx == null ? [] : [idx];
}

function formatOsmTimeRange(value: string): string {
  return value
    .replace(/\b(\d{1,2}):(\d{2})\b/g, (_, hour: string, minute: string) => {
      const h = Number(hour);
      const suffix = h >= 12 ? "PM" : "AM";
      const hour12 = h % 12 === 0 ? 12 : h % 12;
      return `${hour12}:${minute} ${suffix}`;
    })
    .replace(/\s*-\s*/g, " – ");
}

function parseOsmRule(rule: string): HourRow[] {
  const trimmed = rule.trim();
  const match = trimmed.match(/^([A-Za-z,\-\s]+?)\s+(.+)$/);
  if (!match) return [];

  const daySpec = match[1].trim();
  const timeValue = formatOsmTimeRange(match[2].trim());
  const dayIndexes = expandOsmDaySpec(daySpec.replace(/\s+/g, ""));

  if (dayIndexes.length === 0) return [];

  return dayIndexes.map((index) => ({
    label: DAY_NAMES[index],
    value: timeValue,
  }));
}

function parseOsmHours(text: string): HourRow[] | null {
  if (!/\b(Mo|Tu|We|Th|Fr|Sa|Su)\b/.test(text)) return null;

  const rules = text.split(/;\s*/);
  const rows = rules.flatMap((rule) => parseOsmRule(rule));
  return rows.length > 0 ? rows : null;
}

function parseDelimitedHours(text: string): HourRow[] {
  const segments = text
    .split(/\s*;\s*|\n+/)
    .map((segment) => segment.trim())
    .filter(Boolean);

  if (segments.length <= 1 && !FULL_DAY_PATTERN.test(text)) {
    return [];
  }

  return segments
    .map((segment) => splitDayLine(segment))
    .filter((row): row is HourRow => row != null && row.value.length > 0);
}

export function parseHoursText(hours: string): HourRow[] {
  const trimmed = hours.trim();
  if (!trimmed) return [];

  const osmRows = parseOsmHours(trimmed);
  if (osmRows?.length) return osmRows;

  const delimitedRows = parseDelimitedHours(trimmed);
  if (delimitedRows.length > 0) return delimitedRows;

  const singleLine = splitDayLine(trimmed);
  return singleLine ? [singleLine] : [];
}

export function parseHoursLines(lines: string[]): HourRow[] {
  return lines
    .flatMap((line) => parseHoursText(line))
    .filter((row) => row.value.length > 0);
}

export function collapseHourRows(rows: HourRow[]): HourRow[] {
  if (rows.length === 0) return [];

  const collapsed: HourRow[] = [];
  let rangeStart = rows[0];
  let rangeEnd = rows[0];

  const pushRange = () => {
    collapsed.push({
      label:
        rangeStart.label === rangeEnd.label
          ? rangeStart.label
          : `${rangeStart.label} – ${rangeEnd.label}`,
      value: rangeStart.value,
    });
  };

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const prevIndex = DAY_NAMES.indexOf(
      rangeEnd.label as (typeof DAY_NAMES)[number]
    );
    const nextIndex = DAY_NAMES.indexOf(
      row.label as (typeof DAY_NAMES)[number]
    );

    if (
      row.value === rangeStart.value &&
      prevIndex >= 0 &&
      nextIndex === prevIndex + 1
    ) {
      rangeEnd = row;
      continue;
    }

    pushRange();
    rangeStart = row;
    rangeEnd = row;
  }

  pushRange();
  return collapsed;
}
