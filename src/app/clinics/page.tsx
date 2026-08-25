import { AppHeader } from "@/components/AppHeader";
import { AppFooter } from "@/components/AppFooter";
import { ClinicsPageMain } from "@/components/ClinicsPageContent";

export const metadata = {
  title: "Find Free & Low-Cost Clinics — Route2CareRx",
  description:
    "Search free and low-cost community health centers, FQHCs, and student-run clinics by ZIP code.",
};

export default function ClinicsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader />
      <ClinicsPageMain />
      <AppFooter />
    </div>
  );
}
