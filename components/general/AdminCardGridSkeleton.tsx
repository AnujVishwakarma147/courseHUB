import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type AdminCardGridSkeletonProps = {
  title: string;
  description: string;
  cardCount?: number;
  showSummary?: boolean;
};

export function AdminCardGridSkeleton({
  title,
  description,
  cardCount = 6,
  showSummary = false,
}: AdminCardGridSkeletonProps) {
  return (
    <main
      className="px-5 md:px-7"
      role="status"
      aria-label={`Loading ${title}`}
    >
      <section className="mb-7 flex items-center gap-3">
        <Skeleton className="size-11 shrink-0 rounded-xl" />

        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="mt-1 text-muted-foreground">{description}</p>
        </div>
      </section>

      {showSummary ? (
        <section className="mb-7 grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="rounded-2xl">
              <CardContent className="flex items-center justify-between p-5">
                <div className="space-y-3">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-8 w-16" />
                </div>
                <Skeleton className="size-11 rounded-xl" />
              </CardContent>
            </Card>
          ))}
        </section>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: cardCount }).map((_, index) => (
          <Card key={index} className="rounded-2xl">
            <CardHeader>
              <div className="flex items-start gap-4">
                <Skeleton className="size-12 shrink-0 rounded-xl" />
                <div className="min-w-0 flex-1 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {Array.from({ length: 3 }).map((_, statIndex) => (
                  <Skeleton key={statIndex} className="h-20 rounded-xl" />
                ))}
              </div>
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </CardContent>
          </Card>
        ))}
      </div>

      <span className="sr-only">Loading cards...</span>
    </main>
  );
}
