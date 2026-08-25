import { createFileRoute } from "@tanstack/react-router";
import { TrainingForm } from "@/components/trainings/training-form";
import { useAppStore } from "@/hooks/useAppStore";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/trainings/$id")({
  component: TrainingDetailPage,
});

function TrainingDetailPage() {
  const { id } = Route.useParams();
  const ready = useAppStore((s) => s.ready);
  const training = useAppStore((s) => s.trainings.find((t) => t.id === id));

  if (!ready) return <PageSkeleton cards={2} />;

  if (id === "new") {
    return <TrainingForm mode="create" />;
  }

  if (!training) {
    return (
      <Card className="flex flex-col items-center p-12 text-center">
        <p className="font-display text-2xl">Training program not found</p>
        <p className="mt-1 text-sm text-muted-foreground">
          The program with ID "{id}" does not exist in the database.
        </p>
        <Button asChild className="mt-6">
          <Link to="/trainings">Back to catalog</Link>
        </Button>
      </Card>
    );
  }

  return <TrainingForm mode="edit" initial={training} />;
}
