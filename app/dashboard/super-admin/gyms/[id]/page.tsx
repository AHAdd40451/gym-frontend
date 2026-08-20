import GymDetailClient from "../../components/gym-detail-client";

export default async function GymDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <GymDetailClient gymId={id} />;
}
