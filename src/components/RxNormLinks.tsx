"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n/context";

interface RxNormLinkProps {
  drugName: string;
  dailyMedUrl?: string;
}

export function RxNormLinks({ drugName, dailyMedUrl }: RxNormLinkProps) {
  const { t } = useLanguage();
  const [rxcui, setRxcui] = useState<string | null>(null);
  const [rxnormUrl, setRxnormUrl] = useState<string | null>(null);
  const [dailymed, setDailymed] = useState<string | null>(dailyMedUrl ?? null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(
          `/api/otc/rxnorm?name=${encodeURIComponent(drugName)}`
        );
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (cancelled) return;
        setRxcui(data.rxcui ?? null);
        setRxnormUrl(data.rxnormUrl ?? null);
        if (data.dailymedUrl) setDailymed(data.dailymedUrl);
      } catch {
        // optional enrichment — ignore failures
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [drugName]);

  return (
    <p className="mt-4 text-xs text-muted flex flex-wrap gap-x-3 gap-y-1">
      <span className="font-medium text-foreground">{t("med.drugInfo")}</span>
      {rxnormUrl && (
        <a
          href={rxnormUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent hover:underline"
        >
          RxNorm{rxcui ? ` (RXCUI ${rxcui})` : ""} ↗
        </a>
      )}
      {(dailymed || dailyMedUrl) && (
        <a
          href={dailymed ?? dailyMedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent hover:underline"
        >
          DailyMed ↗
        </a>
      )}
    </p>
  );
}
