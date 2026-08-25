import { AppHeader } from "@/components/AppHeader";
import { AppFooter } from "@/components/AppFooter";
import { MedicationsPageMain } from "@/components/MedicationsPageContent";
import { getSymptoms } from "@/lib/otc-data";

export const metadata = {
  title: "OTC Medication Guide — Route2CareRx",
  description:
    "Search OTC medications by symptom and find nearby pharmacies. Uses, ingredients, side effects, and FDA product listings.",
};

export default function MedicationsPage() {
  const symptoms = getSymptoms();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader />
      <MedicationsPageMain symptoms={symptoms} />
      <AppFooter />
    </div>
  );
}
