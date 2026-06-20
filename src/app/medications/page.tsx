import { AppHeader } from "@/components/AppHeader";
import { AppFooter } from "@/components/AppFooter";
import { OtcSection } from "@/components/OtcSection";
import {
  MedicationsDisclaimer,
  MedicationsPageHero,
} from "@/components/MedicationsPageContent";
import { getSymptoms } from "@/lib/otc-data";

export const metadata = {
  title: "OTC Medication Guide — Route2CareRx",
  description:
    "Search OTC medications by symptom and find nearby pharmacies. Uses, ingredients, side effects, and FDA product listings.",
};

export default function MedicationsPage() {
  const symptoms = getSymptoms();

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <MedicationsPageHero />

      <main className="flex-1 max-w-5xl mx-auto px-4 py-8 pb-16 w-full">
        <MedicationsDisclaimer />
        <OtcSection symptoms={symptoms} />
      </main>

      <AppFooter />
    </div>
  );
}
