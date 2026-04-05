import { PlannerClient } from "./PlannerClient";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ initialDistrict?: string }>;
}

export default async function PlannerPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { initialDistrict } = await searchParams;

  return <PlannerClient id={id} initialDistrict={initialDistrict} />;
}
