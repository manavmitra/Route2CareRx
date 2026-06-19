"use client";

import type { Clinic } from "@/lib/types";
import {
  getHrsaHoursDisplay,
  hasHrsaHours,
  formatHoursPerWeek,
} from "@/lib/clinic-data";
import { formatPhone } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/context";

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

function costDescKey(level: string): string {
  switch (level) {
    case "free":
      return "cost.freeDesc";
    case "sliding_scale":
      return "cost.slidingDesc";
    case "low_cost":
      return "cost.lowDesc";
    default:
      return "";
  }
}

function sourceKey(source: string): string {
  switch (source) {
    case "hrsa_fqhc":
      return "source.hrsaFqhc";
    case "hrsa_lookalike":
      return "source.hrsaLookalike";
    case "cms_rural":
      return "source.cmsRural";
    case "uc_davis_student_run":
      return "source.ucDavis";
    default:
      return source;
  }
}

function formatDistanceLocalized(
  miles: number,
  t: (key: string, vars?: Record<string, string | number>) => string
): string {
  if (miles < 0.1) return t("dist.lessThan");
  if (miles < 10) return t("dist.mi", { n: miles.toFixed(1) });
  return t("dist.roundMi", { n: Math.round(miles) });
}

export function ClinicCard({ clinic }: ClinicCardProps) {
  const { t } = useLanguage();
  const phone = formatPhone(clinic.phone);
  const website = clinic.website?.startsWith("http")
    ? clinic.website
    : clinic.website
      ? `https://${clinic.website}`
      : null;

  const hrsaHoursRaw = getHrsaHoursDisplay({
    hoursPerWeek: clinic.hours_per_week,
    operationalSchedule: clinic.operational_schedule,
    operatingCalendar: clinic.operating_calendar,
  });
  const hrsaHours = hrsaHoursRaw.map((row) => {
    if (row.label === "Operating hours per week") {
      const hours =
        typeof clinic.hours_per_week === "number"
          ? clinic.hours_per_week
          : parseFloat(String(clinic.hours_per_week ?? ""));
      return {
        label: t("hours.perWeek"),
        value: Number.isFinite(hours)
          ? t("hours.perWeekValue", { hours: formatHoursPerWeek(hours) })
          : row.value,
      };
    }
    if (row.label === "Operating schedule") {
      return { label: t("hours.schedule"), value: row.value };
    }
    if (row.label === "Operating calendar") {
      return { label: t("hours.calendar"), value: row.value };
    }
    return row;
  });

  const hasHrsa = hasHrsaHours({
    hoursPerWeek: clinic.hours_per_week,
    operationalSchedule: clinic.operational_schedule,
    operatingCalendar: clinic.operating_calendar,
  });
  const dailyHours = clinic.hours_of_operation ?? [];
  const isUcDavis = clinic.source === "uc_davis_student_run";
  const hoursFootnote = isUcDavis
    ? t("hours.ucDavisFootnote")
    : hasHrsa
      ? t("hours.hrsaFootnote")
      : "";

  const costKeyName = costKey(clinic.cost_level);
  const costDescKeyName = costDescKey(clinic.cost_level);
  const sourceKeyName = sourceKey(clinic.source);

  return (
    <article className="bg-card rounded-2xl border border-border shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-semibold leading-tight">{clinic.name}</h3>
          {clinic.organization_name &&
            clinic.organization_name !== clinic.name && (
              <p className="text-sm text-muted mt-0.5">
                {clinic.organization_name}
              </p>
            )}
        </div>
        {clinic.distance_miles != null && (
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-teal-50 text-primary-dark text-sm font-medium whitespace-nowrap">
            {formatDistanceLocalized(clinic.distance_miles, t)}
          </span>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-50 text-accent text-xs font-medium">
          {t(costKeyName)}
        </span>
        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium">
          {t(sourceKeyName)}
        </span>
      </div>

      {costDescKeyName && (
        <p className="mt-2 text-xs text-muted">{t(costDescKeyName)}</p>
      )}

      <address className="mt-4 not-italic text-sm leading-relaxed">
        <p>
          {clinic.address}
          <br />
          {clinic.city}, {clinic.state} {clinic.zip}
        </p>
      </address>

      <div className="mt-3 flex flex-wrap gap-4 text-sm">
        {phone && (
          <a
            href={`tel:${clinic.phone?.replace(/\D/g, "")}`}
            className="text-accent hover:underline font-medium"
          >
            {phone}
          </a>
        )}
        {website && (
          <a
            href={website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline font-medium"
          >
            {t("card.website")}
          </a>
        )}
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
            `${clinic.address}, ${clinic.city}, ${clinic.state} ${clinic.zip}`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent hover:underline font-medium"
        >
          {t("card.directions")}
        </a>
      </div>

      <div className="mt-5">
        <h4 className="text-sm font-semibold mb-2">{t("card.hours")}</h4>

        {hasHrsa ? (
          <dl className="space-y-2 text-sm">
            {hrsaHours.map(({ label, value }) => (
              <div key={label} className="flex flex-col sm:flex-row sm:gap-3">
                <dt className="text-muted sm:w-44 shrink-0">{label}</dt>
                <dd className="font-medium">{value}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="text-sm text-muted">{t("card.noHrsaHours")}</p>
        )}

        {dailyHours.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs font-medium text-foreground mb-2">
              {t("card.dailySchedule")}
            </p>
            <ul className="space-y-1 text-sm">
              {dailyHours.map((line) => (
                <li key={line} className="flex gap-2">
                  <span className="text-muted shrink-0 w-24">
                    {line.split(":")[0]}:
                  </span>
                  <span>{line.split(":").slice(1).join(":").trim()}</span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-muted">{t("hours.dailyFootnote")}</p>
          </div>
        )}

        <p className="mt-3 text-xs text-muted">
          {hoursFootnote}
          {!hasHrsa && !isUcDavis && phone ? t("card.callConfirm") : ""}
          {!hasHrsa && !isUcDavis && !phone ? t("card.tryExternal") : ""}
        </p>
      </div>

      {clinic.services.length > 0 && (
        <div className="mt-5">
          <h4 className="text-sm font-semibold mb-1">{t("card.services")}</h4>
          <p className="text-xs text-muted mb-2">
            {isUcDavis ? t("card.servicesNoteUcDavis") : t("card.servicesNote")}
          </p>
          <ul className="flex flex-wrap gap-2">
            {clinic.services.map((service) => (
              <li
                key={service}
                className="px-2.5 py-1 rounded-md bg-slate-50 border border-border text-xs text-slate-700"
              >
                {service}
              </li>
            ))}
          </ul>
        </div>
      )}

      {clinic.location_setting &&
        !clinic.location_setting.toLowerCase().includes("all other") && (
          <p className="mt-4 text-sm text-muted">
            <span className="font-medium text-foreground">{t("card.setting")}</span>{" "}
            {clinic.location_setting}
          </p>
        )}
    </article>
  );
}
