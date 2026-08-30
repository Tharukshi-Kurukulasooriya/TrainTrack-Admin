import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { MessageSquareQuote, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { ConfirmDelete } from "@/components/shared/confirm-delete";
import { Stars } from "@/components/shared/stars";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAllReviews, useAppStore } from "@/hooks/useAppStore";
import { formatRelative } from "@/lib/utils";
import { PageSkeleton } from "@/components/shared/page-skeleton";

export const Route = createFileRoute("/reviews")({
  component: ReviewsPage,
});

function ReviewsPage() {
  const ready = useAppStore((s) => s.ready);
  const reviews = useAllReviews();
  const removeReview = useAppStore((s) => s.removeReview);
  const [search, setSearch] = useState("");
  const [pending, setPending] = useState<{
    trainingId: string;
    reviewId: string;
  } | null>(null);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return reviews;
    return reviews.filter(
      (r) =>
        r.reviewerName.toLowerCase().includes(query) ||
        r.reviewText.toLowerCase().includes(query) ||
        r.trainingName.toLowerCase().includes(query),
    );
  }, [reviews, search]);

  if (!ready) return <PageSkeleton cards={4} />;

  return (
    <div className="hero-wash -m-6 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <PageHeader
        eyebrow="Feedback"
        title="Learner reviews"
        description="Ratings and written feedback across the catalog."
      />

      <div className="relative max-w-sm">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter reviews by reviewer or text…"
          className="pl-9"
        />
      </div>

      <div className="mt-6 space-y-3">
        {filtered.map((review) => (
          <Card
            key={`${review.trainingId}-${review.id}`}
            className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between"
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <p className="font-medium text-foreground">{review.reviewerName}</p>
                <Stars value={review.reviewRating} />
                <span className="text-xs text-muted-foreground">
                  {formatRelative(review.reviewDate)}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {review.reviewText}
              </p>
              <p className="mt-3 text-xs text-muted-foreground">
                Program:{" "}
                <Link
                  to="/trainings/$id"
                  params={{ id: review.trainingId }}
                  className="font-medium text-foreground underline-offset-4 hover:underline"
                >
                  {review.trainingName}
                </Link>
              </p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="self-start text-destructive"
              onClick={() =>
                setPending({
                  trainingId: review.trainingId,
                  reviewId: review.id,
                })
              }
            >
              <Trash2 className="size-4" />
              Remove
            </Button>
          </Card>
        ))}

        {filtered.length === 0 ? (
          <Card className="flex flex-col items-center p-10 text-center">
            <MessageSquareQuote className="size-8 text-muted-foreground" />
            <p className="mt-3 font-display text-xl">No reviews found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {search ? "Try relaxing your search." : "Catalog is quiet."}
            </p>
          </Card>
        ) : null}
      </div>

      <ConfirmDelete
        open={Boolean(pending)}
        onOpenChange={(open) => {
          if (!open) setPending(null);
        }}
        title="Delete review?"
        description="This removes the review and recomputes the training rating average."
        onConfirm={() => {
          if (!pending) return;
          void removeReview(pending.trainingId, pending.reviewId).then(() =>
            toast.success("Review deleted."),
          );
          setPending(null);
        }}
      />
    </div>
  );
}
