"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Fingerprint } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usersApi } from "@/lib/api/services/users/users";
import type { User } from "@/lib/types/models";

type BiometricIdFieldProps = {
  userId: string;
  initialValue?: string | null;
};

export function BiometricIdField({ userId, initialValue }: BiometricIdFieldProps) {
  const router = useRouter();
  const [value, setValue] = useState(initialValue ?? "");
  const [saving, setSaving] = useState(false);

  const isDirty = value.trim() !== (initialValue ?? "").trim();

  const handleSave = async () => {
    setSaving(true);

    try {
      await usersApi.update(userId, {
        biometricId: value.trim() || null,
      } as Partial<User>);

      toast.success("Biometric ID updated");
      router.refresh();
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Failed to update biometric ID";

      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <Fingerprint className="size-4 text-muted-foreground" />

      <div className="flex-1">
        <p className="text-muted-foreground">Biometric ID</p>

        <div className="mt-1.5 flex items-center gap-2">
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Device PIN, e.g. 101"
            className="h-8 max-w-[160px] text-sm"
            disabled={saving}
          />

          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8"
            onClick={handleSave}
            disabled={saving || !isDirty}
          >
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>

        <p className="mt-1 text-xs text-muted-foreground">
          Numeric PIN this member was enrolled with on the fingerprint/face scanner.
        </p>
      </div>
    </div>
  );
}
