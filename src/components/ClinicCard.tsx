"use client";

import type { Clinic } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n/context";
import { saveClinicForDetail } from "@/lib/clinic-session";
import { LocationPinIcon, SendIcon } from "./icons/NavIcons";

interface ClinicCardProps {
  clinic: Clinic;
}

function costKey(level: string): string {
  switch (level) {
    case "free":
      return "cost.free";
    case "sliding_scale":
      return "cost.sliding";
    case "low_cost":
      return "cost.low";
    default:
      return level;
  }
}

function formatDistanceAway(
  miles: number,
  t: (key: string, vars?: Record<string, string | number>) => string
): string {
  if (miles < 0.1) return t("card.distanceAwayLess");
  if (miles < 10) return t("card.distanceAway", { n: miles.toFixed(1) });
  return t("card.distanceAway", { n: String(Math.round(miles)) });
}

function clinicIcon(clinic: Clinic): string {
  if (clinic.source === "uc_davis_student_run") return "🎓";
  if (clinic.services.some((s) => /women|reproductive|obgyn/i.test(s))) return "🌿";
  return "👥";
}

function mapsUrl(clinic: Clinic): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    `${clinic.address}, ${clinic.city}, ${clinic.state} ${clinic.zip}`
  )}`;
}

export function ClinicCard({ clinic }: ClinicCardProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const hasHours = (clinic.hours_of_operation ?? []).length > 0;
  const costLabel = t(costKey(clinic.cost_level));
  const showSlidingBadge =
    clinic.cost_level === "sliding_scale" || clinic.cost_level === "free";

  const handleDetails = () => {
    saveClinicForDetail(clinic);
    router.push(`/clinics/${clinic.id}`);
  };

  return (
    <article className="bg-card rounded-2xl border border-border shadow-sm p-4 md:p-5">
      <div className="flex gap-3">
        <div
          className="shrink-0 w-14 h-14 rounded-xl bg-teal-50 flex items-center justify-center text-2xl"
          aria-hidden
        >
          {clinicIcon(clinic)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-lg font-bold leading-tight">{clinic.name}</h3>
            {showSlidingBadge && (
              <span className="inline-flex items-center gap-1 shrink-0 rounded-full bg-emerald-50 text-emerald-800 text-xs font-medium px-2 py-1">
                <span aria-hidden>$</span>
                {costLabel}
              </span>
            )}
          </div>

          <p className="mt-1 text-sm">
            {hasHours ? (
              <span className="text-emerald-700 font-medium">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-1.5 align-middle" />
                {t("card.hoursAvailable")}
              </span>
            ) : (
              <span className="text-muted">{t("card.callConfirm")}</span>
            )}
          </p>

          {clinic.distance_miles != null && (
            <p className="mt-1 text-sm text-foreground flex items-center gap-1">
              <LocationPinIcon className="w-3.5 h-3.5 text-muted" />
              {formatDistanceAway(clinic.distance_miles, t)}
            </p>
          )}

          <p className="mt-0.5 text-sm text-muted">
            {clinic.address}, {clinic.city}, {clinic.state} {clinic.zip}
          </p>
        </div>
      </div>

      {clinic.services.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {clinic.services.slice(0, 4).map((service) => (
            <li
              key={service}
              className="px-2.5 py-1 rounded-full border border-teal-200 bg-teal-50/60 text-teal-900 text-xs font-medium"
            >
              {service}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={handleDetails}
          className="px-4 py-2.5 rounded-xl border border-border bg-card text-sm font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
        >
          {t("card.details")}
        </button>
        <a
          href={mapsUrl(clinic)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors"
        >
          <SendIcon className="w-4 h-4" />
          {t("card.directionsShort")}
        </a>
      </div>
    </article>
  );
}
