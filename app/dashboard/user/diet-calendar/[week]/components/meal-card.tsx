"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MealCardProps {
  mealName: string;
  mealId: string;
}

export function MealCard({ mealName, mealId }: MealCardProps) {
  const [isOpen, setIsOpen] = React.useState(true);

  return (
    <Card className="rounded-lg border shadow-sm">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="hover:bg-muted/50 cursor-pointer transition-colors">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">{mealName}</CardTitle>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-4 pt-0">
            <div className="space-y-2">
              <Label htmlFor={`meal-description-${mealId}`} className="text-sm font-medium">
                Meal Description
              </Label>
              <Textarea
                id={`meal-description-${mealId}`}
                placeholder="Describe your meal (e.g., Oatmeal with berries and nuts, Grilled chicken with vegetables)..."
                className="min-h-[100px] resize-none"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor={`calories-${mealId}`} className="text-sm font-medium">
                  Calories
                </Label>
                <Input
                  id={`calories-${mealId}`}
                  type="number"
                  placeholder="kcal"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`protein-${mealId}`} className="text-sm font-medium">
                  Protein (g)
                </Label>
                <Input id={`protein-${mealId}`} type="number" placeholder="g" className="w-full" />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`carbs-${mealId}`} className="text-sm font-medium">
                  Carbs (g)
                </Label>
                <Input id={`carbs-${mealId}`} type="number" placeholder="g" className="w-full" />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`fats-${mealId}`} className="text-sm font-medium">
                  Fats (g)
                </Label>
                <Input id={`fats-${mealId}`} type="number" placeholder="g" className="w-full" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`notes-${mealId}`} className="text-sm font-medium">
                Add Notes
              </Label>
              <Input
                id={`notes-${mealId}`}
                placeholder="Optional notes about this meal..."
                className="w-full"
              />
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
