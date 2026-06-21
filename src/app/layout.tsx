import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Route2CareRx — Free Clinics & OTC Medication Guide",
  description:
    "Find free and low-cost healthcare clinics by ZIP code, and browse over-the-counter medications with uses, ingredients, side effects, and safety information.",
  keywords: [
    "free clinic",
    "low cost healthcare",
    "community health center",
    "FQHC",
    "OTC medications",
    "over the counter drugs",
    "uninsured healthcare",
  ],
  openGraph: {
    title: "Route2CareRx — Free Clinics & OTC Medication Guide",
    description:
      "Find community health centers near your ZIP code and browse OTC medication information in one place.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
