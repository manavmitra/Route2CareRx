"use client";

import type { ComponentType } from "react";
import {
  HeartIcon,
  ClinicHeroIllustration,
  MedHeroIllustration,
  ResourcesHeroIllustration,
} from "./icons/NavIcons";

export type PageHeroVariant = "clinics" | "medications" | "resources";

const VARIANT_STYLES: Record<
  PageHeroVariant,
  { gradient: string; badge: string; illustration: ComponentType<{ className?: string }> }
> = {
  clinics: {
    gradient: "from-[#005f6b] via-[#00707d] to-[#006d77]",
    badge: "border-white/40 bg-white/10",
    illustration: ClinicHeroIllustration,
  },
  medications: {
    gradient: "from-[#5b21b6] via-[#7c3aed] to-[#6d28d9]",
    badge: "border-white/30 bg-white/10",
    illustration: MedHeroIllustration,
  },
  resources: {
    gradient: "from-[#1d4ed8] via-[#2563eb] to-[#3b82f6]",
    badge: "border-white/30 bg-white/10",
    illustration: ResourcesHeroIllustration,
  },
};

interface PageHeroProps {
  variant?: PageHeroVariant;
  badge: string;
  title: string;
  subtitle: string;
  showHeart?: boolean;
  rounded?: boolean;
}

export function PageHero({
  variant = "clinics",
  badge,
  title,
  subtitle,
  showHeart = true,
  rounded = false,
}: PageHeroProps) {
  const styles = VARIANT_STYLES[variant];
  const Illustration = styles.illustration;

  return (
    <header
      className={`bg-gradient-to-br ${styles.gradient} text-white overflow-hidden ${
        rounded ? "rounded-b-3xl mx-2 sm:mx-4 mt-0" : ""
      }`}
    >
      <div className="max-w-5xl mx-auto px-4 py-8 md:py-10 relative">
        <div className="relative z-10 max-w-xl">
          <p
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium text-white/95 mb-4 uppercase tracking-wide ${styles.badge}`}
          >
            {showHeart && <HeartIcon className="w-3.5 h-3.5" />}
            {badge}
          </p>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight tracking-tight">
            {title}
          </h1>
          <p className="mt-3 text-sm md:text-base text-white/90 leading-relaxed">
            {subtitle}
          </p>
        </div>

        <div className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 hidden sm:block text-white/85 w-[min(42%,220px)]">
          <Illustration className="w-full h-auto" />
        </div>
      </div>
    </header>
  );
}
