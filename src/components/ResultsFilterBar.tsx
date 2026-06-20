"use client";

import { useLanguage } from "@/lib/i18n/context";

interface ResultsFilterBarProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  filteredCount: number;
  totalCount: number;
}

export function ResultsFilterBar({
  id,
  value,
  onChange,
  filteredCount,
  totalCount,
}: ResultsFilterBarProps) {
  const { t } = useLanguage();

  if (totalCount === 0) return null;

  return (
    <div className="bg-muted/20 border border-border rounded-xl p-4">
      <label htmlFor={id} className="block text-sm font-medium mb-2">
        {t("search.filterLabel")}
      </label>
      <input
        id={id}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t("search.filterPlaceholder")}
        className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
      />
      {value.trim() && filteredCount !== totalCount && (
        <p className="mt-2 text-sm text-muted">
          {t("search.filterCount", { filtered: filteredCount, total: totalCount })}
        </p>
      )}
    </div>
  );
}
