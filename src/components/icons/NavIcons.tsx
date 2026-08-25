function mergeIconClass(defaultSize: string, className?: string): string {
  if (!className) return defaultSize;
  const hasWidth = /\bw-/.test(className);
  const hasHeight = /\bh-/.test(className);
  if (hasWidth && hasHeight) return className;
  return `${defaultSize} ${className}`.trim();
}

export function LocationPinIcon({ className }: { className?: string }) {
  const classes = mergeIconClass("w-5 h-5", className);
  return (
    <svg
      className={classes}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11Z"
      />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

export function PillIcon({ className }: { className?: string }) {
  const classes = mergeIconClass("w-5 h-5", className);
  return (
    <svg
      className={classes}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.5 8.5 15.5 15.5M9.5 5.5a5 5 0 0 1 7.07 7.07l-7.07 7.07a5 5 0 0 1-7.07-7.07L9.5 5.5Z"
      />
    </svg>
  );
}

export function BookIcon({ className }: { className?: string }) {
  const classes = mergeIconClass("w-5 h-5", className);
  return (
    <svg
      className={classes}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"
      />
    </svg>
  );
}

export function HeartIcon({ className }: { className?: string }) {
  const classes = mergeIconClass("w-4 h-4", className);
  return (
    <svg
      className={classes}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z"
      />
    </svg>
  );
}

export function ShieldCheckIcon({ className }: { className?: string }) {
  const classes = mergeIconClass("w-4 h-4", className);
  return (
    <svg
      className={classes}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m9 12 2 2 4-4" />
    </svg>
  );
}

export function ChevronRightIcon({ className }: { className?: string }) {
  const classes = mergeIconClass("w-5 h-5", className);
  return (
    <svg
      className={classes}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
    </svg>
  );
}

export function SendIcon({ className }: { className?: string }) {
  const classes = mergeIconClass("w-4 h-4", className);
  return (
    <svg
      className={classes}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m22 2-7 20-4-9-9-4Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M22 2 11 13" />
    </svg>
  );
}

export function ClinicHeroIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="200"
      height="140"
      viewBox="0 0 200 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M28 18c8-6 18-6 26 0 6 4 10 10 12 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M58 92V58h18l10-12 10 12h18v34"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path d="M72 92V72h16v20" stroke="currentColor" strokeWidth="2" />
      <path d="M88 50v-8h8v8" stroke="currentColor" strokeWidth="2" />
      <path d="M92 42v-10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M86 32h12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path
        d="M148 92c0-10 6-18 16-20 4-1 8 0 12 2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M156 72c-2 8-2 14 0 20M164 70c2 7 2 14 0 22M172 74c-1 6-1 12 0 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M36 92h132" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function MedHeroIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="200"
      height="140"
      viewBox="0 0 200 140"
      fill="none"
      aria-hidden
    >
      <rect x="118" y="28" width="52" height="72" rx="8" stroke="currentColor" strokeWidth="2.5" />
      <path d="M144 40v-12M138 34h12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="132" cy="108" r="8" stroke="currentColor" strokeWidth="2" />
      <circle cx="156" cy="100" r="6" stroke="currentColor" strokeWidth="2" />
      <rect x="148" y="112" width="14" height="8" rx="2" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export function ResourcesHeroIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="200"
      height="140"
      viewBox="0 0 200 140"
      fill="none"
      aria-hidden
    >
      <path d="M28 24c6-4 14-4 20 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M118 36h52v72h-52a8 8 0 0 1-8-8V44a8 8 0 0 1 8-8Z" stroke="currentColor" strokeWidth="2.5" />
      <path d="M118 52h36" stroke="currentColor" strokeWidth="2" />
      <path d="M130 68h24M130 82h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M144 98c0 4 3 8 8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
