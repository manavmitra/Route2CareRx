"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Clinic } from "@/lib/types";
import { formatPhone } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/context";
import { loadClinicForDetail } from "@/lib/clinic-session";
import { HoursSchedule } from "./HoursSchedule";
import { PrivacyFooter } from "./PrivacyFooter";
import {
  LocationPinIcon,
  SendIcon,
  ShieldCheckIcon,
} from "./icons/NavIcons";

interface ClinicDetailContentProps {
  id: string;
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

export function ClinicDetailContent({ id }: ClinicDetailContentProps) {
  const { t } = useLanguage();
  const [clinic, setClinic] = useState<Clinic | null>(null);

  useEffect(() => {
    setClinic(loadClinicForDetail(id));
  }, [id]);

  if (!clinic) {
    return (
      <main className="flex-1 max-w-5xl mx-auto px-4 py-12 w-full text-center">
        <p className="text-muted">{t("detail.notFound")}</p>
        <Link href="/clinics" className="mt-4 inline-block text-primary font-medium hover:underline">
          {t("detail.backToSearch")}
        </Link>
      </main>
    );
  }

  const phone = formatPhone(clinic.phone);
  const website = clinic.website?.startsWith("http")
    ? clinic.website
    : clinic.website
      ? `https://${clinic.website}`
      : null;
  const hasDailyHours = (clinic.hours_of_operation ?? []).length > 0;
  const isUcDavis = clinic.source === "uc_davis_student_run";
  const mapsDestination = encodeURIComponent(
    `${clinic.address}, ${clinic.city}, ${clinic.state} ${clinic.zip}`
  );
  const mapEmbed = `https://www.google.com/maps?q=${mapsDestination}&output=embed`;

  return (
    <>
      <header className="bg-gradient-to-br from-[#005f6b] via-[#00707d] to-[#006d77] text-white">
        <div className="max-w-5xl mx-auto px-4 py-6 md:py-8">
          <Link
            href="/clinics"
            className="inline-flex items-center gap-1 text-sm text-white/90 hover:text-white mb-4"
          >
            ← {t("detail.back")}
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-bold">{clinic.name}</h1>
            {isUcDavis && (
              <span className="rounded-full bg-white/20 px-3 py-0.5 text-xs font-medium">
                {t("detail.studentRun")}
              </span>
            )}
          </div>
          {clinic.organization_name && clinic.organization_name !== clinic.name && (
            <p className="mt-1 text-teal-50/90">{clinic.organization_name}</p>
          )}
          {clinic.services.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-2">
              {clinic.services.slice(0, 5).map((service) => (
                <li
                  key={service}
                  className="rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs"
                >
                  ✓ {service}
                </li>
              ))}
            </ul>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto px-4 py-6 pb-8 w-full space-y-4">
        <div className="bg-card rounded-2xl border border-border p-5">
          <h2 className="font-bold text-lg mb-4">{t("detail.locationContact")}</h2>
          <div className="grid md:grid-cols-2 gap-5">
            <div className="space-y-3 text-sm">
              <p className="flex items-start gap-2">
                <LocationPinIcon className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>
                  {clinic.address}
                  <br />
                  {clinic.city}, {clinic.state} {clinic.zip}
                </span>
              </p>
              {phone && (
                <p>
                  <span className="font-medium">{t("detail.phone")}:</span>{" "}
                  <a href={`tel:${clinic.phone?.replace(/\D/g, "")}`} className="text-accent hover:underline">
                    {phone}
                  </a>
                </p>
              )}
              {website && (
                <p>
                  <a href={website} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline font-medium">
                    {t("card.website")}
                  </a>
                </p>
              )}
              <p className="text-xs text-muted">{t(sourceKey(clinic.source))}</p>
            </div>
            <div>
              <iframe
                title={t("detail.mapTitle")}
                src={mapEmbed}
                className="w-full h-40 rounded-xl border border-border"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${mapsDestination}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-sm text-accent hover:underline"
              >
                {t("detail.viewLargerMap")} ↗
              </a>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-2">
            {phone && (
              <a
                href={`tel:${clinic.phone?.replace(/\D/g, "")}`}
                className="inline-flex items-center justify-center px-4 py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark"
              >
                {t("detail.callClinic")}
              </a>
            )}
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${mapsDestination}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-primary text-primary text-sm font-semibold hover:bg-teal-50"
            >
              <SendIcon className="w-4 h-4" />
              {t("card.directionsShort")}
            </a>
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border p-5">
          <h2 className="font-bold text-lg mb-3">{t("card.hours")}</h2>
          {hasDailyHours ? (
            <>
              <HoursSchedule hours={clinic.hours_of_operation} />
              <p className="mt-2 text-xs text-muted">
                {isUcDavis ? t("hours.ucDavisFootnote") : t("hours.dailyFootnote")}
              </p>
            </>
          ) : (
            <p className="text-sm text-muted">
              {phone ? t("card.callConfirm") : t("card.noDailyHours")}
              {!phone ? t("card.tryExternal") : ""}
            </p>
          )}
          {clinic.hours_per_week != null && !hasDailyHours && (
            <p className="mt-2 text-sm text-muted">
              {t("hours.perWeekValue", { hours: clinic.hours_per_week })}
            </p>
          )}
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-card rounded-2xl border border-border p-5">
            <h2 className="font-bold mb-2">{t("detail.eligibility")}</h2>
            <p className="text-sm font-medium">{t(costKey(clinic.cost_level))}</p>
            <p className="text-sm text-muted mt-2">{t(costDescKey(clinic.cost_level))}</p>
            <p className="text-sm text-muted mt-2">{t("detail.eligibilityNote")}</p>
          </div>
          <div className="bg-card rounded-2xl border border-border p-5">
            <h2 className="font-bold mb-2">{t("detail.whatToBring")}</h2>
            <ul className="text-sm text-muted space-y-1.5 list-disc list-inside">
              <li>{t("detail.bringId")}</li>
              <li>{t("detail.bringIncome")}</li>
              <li>{t("detail.bringInsurance")}</li>
              <li>{t("detail.bringMeds")}</li>
            </ul>
          </div>
        </div>

        {clinic.services.length > 0 && (
          <div className="bg-card rounded-2xl border border-border p-5">
            <h2 className="font-bold mb-2">{t("card.services")}</h2>
            <p className="text-xs text-muted mb-2">
              {isUcDavis ? t("card.servicesNoteUcDavis") : t("card.servicesNote")}
            </p>
            <ul className="flex flex-wrap gap-2">
              {clinic.services.map((service) => (
                <li
                  key={service}
                  className="px-2.5 py-1 rounded-full border border-teal-200 bg-teal-50/60 text-teal-900 text-xs font-medium"
                >
                  {service}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-900">
          <strong>{t("clinics.disclaimerLead")}</strong> {t("clinics.disclaimerBody")}
        </div>

        <div className="flex items-start gap-3 p-4 rounded-xl border border-primary/20 bg-teal-50/50 text-sm">
          <ShieldCheckIcon className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <p className="text-muted">{t("privacy.full")}</p>
        </div>

        <PrivacyFooter />
      </main>
    </>
  );
}
