import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminSearchLoading() {
  return (
    <main
      className="px-5 md:px-7"
      role="status"
      aria-label="Loading search results"
    >
      <section className="mx-auto max-w-5xl">
        <div className="flex items-center gap-3">
          <Skeleton className="size-11 rounded-xl" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Search</h1>
            <p className="mt-1 text-muted-foreground">
              Search courses and registered users.
            </p>
          </div>
        </div>

        <div className="mt-7 flex gap-3">
          <Skeleton className="h-12 flex-1 rounded-xl" />
          <Skeleton className="h-12 w-28 rounded-xl" />
        </div>

        <div className="mt-7 grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="rounded-2xl">
              <CardHeader>
                <div className="flex justify-between gap-3">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-10 w-32 rounded-xl" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <span className="sr-only">Loading results...</span>
    </main>
  );
}
