import { getExercises } from "@/lib/api/services/getexercises/exercises";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, PlayCircle } from "lucide-react";
import type { Exercise } from "@/lib/api/services/getexercises/exercises";

interface Props {
  exercises: Exercise[];
}

const ExerciseCards = ({ exercises }: Props) => {
  if (exercises.length === 0) {
    return <p className="text-center col-span-full text-muted-foreground mt-10">No exercises found.</p>;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
      {exercises.map((ex) => (
        <Card key={ex._id} className="hover:shadow-lg transition">
          <CardContent className="pt-6 pb-6 flex flex-col items-center space-y-4">
            <PlayCircle className="size-14 text-primary" />

            <h5 className="text-xl font-semibold text-center">{ex.title}</h5>

            <ul className="text-sm text-muted-foreground list-disc ml-4">
              {ex.points.slice(0, 2).map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>

            <Button variant="outline" size="sm" asChild>
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
