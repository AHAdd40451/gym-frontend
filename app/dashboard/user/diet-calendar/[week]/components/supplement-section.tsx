"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SupplementSection() {
  const [supplements, setSupplements] = React.useState({
    multivitamin: false,
    omega3: false,
    protein: false
  });
  const [customSupplement, setCustomSupplement] = React.useState("");

  const handleSupplementChange = (supplement: string, checked: boolean) => {
    setSupplements((prev) => ({
      ...prev,
      [supplement]: checked
    }));
  };

  return (
    <Card className="rounded-lg border shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Supplements</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="multivitamin"
              checked={supplements.multivitamin}
              onCheckedChange={(checked) =>
                handleSupplementChange("multivitamin", checked === true)
              }
            />
            <Label
              htmlFor="multivitamin"
              className="cursor-pointer text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Multivitamin
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="omega3"
              checked={supplements.omega3}
              onCheckedChange={(checked) => handleSupplementChange("omega3", checked === true)}
            />
            <Label
              htmlFor="omega3"
              className="cursor-pointer text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Omega-3
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="protein"
              checked={supplements.protein}
              onCheckedChange={(checked) => handleSupplementChange("protein", checked === true)}
            />
            <Label
              htmlFor="protein"
              className="cursor-pointer text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Protein
            </Label>
          </div>
        </div>

        <div className="space-y-2 border-t pt-2">
          <Label htmlFor="custom-supplement" className="text-sm font-medium">
            Custom Supplement
          </Label>
          <div className="flex gap-2">
            <Input
              id="custom-supplement"
              placeholder="Enter supplement name..."
              value={customSupplement}
              onChange={(e) => setCustomSupplement(e.target.value)}
              className="flex-1"
            />
            <Button type="button" variant="outline" size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
