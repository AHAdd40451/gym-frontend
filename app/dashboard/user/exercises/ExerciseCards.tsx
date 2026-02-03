import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Dumbbell, PlayCircle } from "lucide-react";
import type { Exercise } from "@/lib/api/services/getexercises/exercises";

interface Props {
  exercises: Exercise[];
}

const difficultyVariant: Record<string, string> = {
  Beginner: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Intermediate: "bg-amber-100 text-amber-700 border-amber-200",
  Advanced: "bg-rose-100 text-rose-700 border-rose-200"
};

const ExerciseCards = ({ exercises }: Props) => {
  if (exercises.length === 0) {
    return <p className="text-center col-span-full text-muted-foreground mt-10">No exercises found.</p>;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
      {exercises.map((ex) => (
        <Card key={ex._id} className="hover:shadow-lg transition group">
          <CardHeader className="space-y-3 pb-0">
            <div className="aspect-video w-full overflow-hidden rounded-lg bg-muted flex items-center justify-center">
              {ex.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={ex.imageUrl}
                  alt={ex.name}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                />
              ) : (
                <PlayCircle className="size-14 text-primary" />
              )}
            </div>
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-lg line-clamp-1">{ex.name}</CardTitle>
              <Badge
                className={`text-xs ${difficultyVariant[ex.difficulty] || "bg-slate-100 text-slate-700 border-slate-200"}`}
              >
                {ex.difficulty}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">{ex.description}</p>
          </CardHeader>

          <CardContent className="pb-6 space-y-3">
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              <Badge variant="outline" className="gap-1">
                <Dumbbell className="size-3" />
                {ex.equipment || "Any"}
              </Badge>
              {ex.muscleGroup?.slice(0, 3).map((m) => (
                <Badge key={m} variant="secondary" className="bg-slate-100 text-slate-700">
                  {m}
                </Badge>
              ))}
            </div>

            <Button variant="outline" size="sm" asChild className="w-full">
              <Link href={`/dashboard/user/exercises/${ex._id}`}>
                View Details <ArrowRight className="size-4 ml-1" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ExerciseCards;
