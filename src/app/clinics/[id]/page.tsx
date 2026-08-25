import { AppHeader } from "@/components/AppHeader";
import { AppFooter } from "@/components/AppFooter";
import { ClinicDetailContent } from "@/components/ClinicDetailContent";

export const metadata = {
  title: "Clinic Details — Route2CareRx",
};

export default async function ClinicDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader />
      <ClinicDetailContent id={id} />
      <AppFooter />
    </div>
  );
}
