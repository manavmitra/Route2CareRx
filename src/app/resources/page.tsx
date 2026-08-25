import { AppHeader } from "@/components/AppHeader";
import { AppFooter } from "@/components/AppFooter";
import { ExternalResources } from "@/components/ExternalResources";
import {
  ResourcesPageHero,
  ResourcesPageFooter,
} from "@/components/ResourcesPageContent";
import { EXTERNAL_RESOURCES } from "@/lib/types";

export const metadata = {
  title: "Additional Resources — Route2CareRx",
  description:
    "Trusted directories for free clinics, charitable care, cancer screening, mental health, and community health centers.",
};

export default function ResourcesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader />
      <ResourcesPageHero />

      <main className="flex-1 max-w-5xl mx-auto px-4 py-6 pb-4 w-full">
        <ExternalResources resources={EXTERNAL_RESOURCES} />
        <ResourcesPageFooter />
      </main>

      <AppFooter />
    </div>
  );
}
