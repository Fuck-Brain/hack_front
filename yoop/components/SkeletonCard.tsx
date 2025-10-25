import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function SkeletonCard() {
  return (
    <Card className="w-64 shrink-0">
      <CardContent className="p-3">
        <div className="aspect-[4/5] rounded-xl overflow-hidden">
          <Skeleton className="h-full w-full" />
        </div>
        <div className="mt-3 space-y-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-3 w-3/4" />
          <div className="mt-2 flex gap-2">
            <Skeleton className="h-9 flex-1 rounded-xl" />
            <Skeleton className="h-9 flex-1 rounded-xl" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
