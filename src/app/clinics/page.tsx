import { ClinicSearch } from "@/components/ClinicSearch";
import { AppHeader } from "@/components/AppHeader";
import { AppFooter } from "@/components/AppFooter";
import { ClinicsPageHero, ClinicsPageSteps } from "@/components/ClinicsPageContent";

export const metadata = {
  title: "Find Free & Low-Cost Clinics — Route2CareRx",
  description:
    "Search free and low-cost community health centers, FQHCs, and student-run clinics by ZIP code.",
};

export default function ClinicsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <ClinicsPageHero />

      <main className="flex-1 max-w-5xl mx-auto px-4 py-8 pb-16 w-full">
        <ClinicSearch />
        <ClinicsPageSteps />
      </main>

      <AppFooter />
    </div>
  );
}
