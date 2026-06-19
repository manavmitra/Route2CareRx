import { AppHeader } from "@/components/AppHeader";
import { AppFooter } from "@/components/AppFooter";
import { ExternalResources } from "@/components/ExternalResources";
import { ResourcesPageHero } from "@/components/ResourcesPageContent";
import { EXTERNAL_RESOURCES } from "@/lib/types";

export const metadata = {
  title: "Additional Resources — ClinMedFind",
  description:
    "Trusted directories for free clinics, charitable care, cancer screening, mental health, and community health centers.",
};

export default function ResourcesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <ResourcesPageHero />

      <main className="flex-1 max-w-5xl mx-auto px-4 py-8 pb-16 w-full">
        <ExternalResources resources={EXTERNAL_RESOURCES} />
      </main>

      <AppFooter />
    </div>
  );
}
