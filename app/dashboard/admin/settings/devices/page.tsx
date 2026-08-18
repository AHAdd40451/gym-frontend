"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  FingerprintIcon,
  PlusIcon,
  RefreshCwIcon,
  Trash2Icon,
  WifiIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  biometricDevicesApi,
  type BiometricConnectionMode,
  type BiometricDevice,
} from "@/lib/api/services/biometricDevices/biometricDevices";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5003/api";

const getServerConnectionInfo = () => {
  try {
    const url = new URL(API_BASE_URL.replace(/\/api\/?$/, ""));
    return {
      address: url.hostname,
      port: url.port || (url.protocol === "https:" ? "443" : "80"),
    };
  } catch {
    return { address: "your-server-domain", port: "443" };
  }
};

const formatRelativeTime = (isoString?: string | null) => {
  if (!isoString) return "Never";

  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffSec = Math.round(diffMs / 1000);

  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffSec < 3600) return `${Math.round(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.round(diffSec / 3600)}h ago`;
  return `${Math.round(diffSec / 86400)}d ago`;
};

const isOnline = (lastSeenAt?: string | null) => {
  if (!lastSeenAt) return false;
  return Date.now() - new Date(lastSeenAt).getTime() < 2 * 60 * 1000;
};

export default function BiometricDevicesPage() {
  const [devices, setDevices] = useState<BiometricDevice[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [justRegistered, setJustRegistered] = useState<BiometricDevice | null>(null);

  const [form, setForm] = useState({
    name: "",
    connectionMode: "push" as BiometricConnectionMode,
    serialNumber: "",
    ip: "",
    port: "4370",
    commKey: "0",
  });

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const data = await biometricDevicesApi.getAll();
      setDevices(data);
    } catch (err: any) {
      toast.error(err?.message || "Failed to load devices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const resetForm = () => {
    setForm({
      name: "",
      connectionMode: "push",
      serialNumber: "",
      ip: "",
      port: "4370",
      commKey: "0",
    });
  };

  const handleRegister = async () => {
    if (!form.name.trim()) {
      toast.error("Give this device a name (e.g. Front Desk)");
      return;
    }

    if (form.connectionMode === "push" && !form.serialNumber.trim()) {
      toast.error("Serial number is required for push/ADMS mode");
      return;
    }

    if (form.connectionMode === "pull" && !form.ip.trim()) {
      toast.error("Device IP address is required for pull mode");
      return;
    }

    try {
      setSaving(true);

      const device = await biometricDevicesApi.register({
        name: form.name.trim(),
        connectionMode: form.connectionMode,
        serialNumber: form.serialNumber.trim() || undefined,
        ip: form.ip.trim() || undefined,
        port: Number(form.port) || undefined,
        commKey: Number(form.commKey) || 0,
      });

      toast.success("Device registered successfully");
      setDialogOpen(false);
      resetForm();
      fetchDevices();

      if (device.connectionMode === "push") {
        setJustRegistered(device);
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to register device");
    } finally {
      setSaving(false);
    }
  };

  const handleSync = async (device: BiometricDevice) => {
    try {
      setSyncingId(device._id);
      const result = await biometricDevicesApi.sync(device._id);
      toast.success(
        `Sync complete — ${result.created} new, ${result.duplicate} already marked, ${result.skipped} skipped`
      );
      fetchDevices();
    } catch (err: any) {
      toast.error(err?.message || "Sync failed");
    } finally {
      setSyncingId(null);
    }
  };

  const handleDelete = async (device: BiometricDevice) => {
    try {
      setDeletingId(device._id);
      await biometricDevicesApi.remove(device._id);
      toast.success("Device removed");
      fetchDevices();
    } catch (err: any) {
      toast.error(err?.message || "Failed to remove device");
    } finally {
      setDeletingId(null);
    }
  };

  const connectionInfo = getServerConnectionInfo();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Biometric Devices</h2>
          <p className="text-sm text-muted-foreground">
            Connect fingerprint/face scanners so member attendance is marked automatically.
          </p>
        </div>

        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="mr-1.5 size-4" />
              Add Device
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Biometric Device</DialogTitle>
              <DialogDescription>
                Push mode works from anywhere on the internet — recommended for
                gyms whose device supports Cloud Server / ADMS settings.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Device Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Front Desk"
                />
              </div>

              <div className="space-y-2">
                <Label>Connection Mode</Label>
                <Select
                  value={form.connectionMode}
                  onValueChange={(value) =>
                    setForm({ ...form, connectionMode: value as BiometricConnectionMode })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="push">Push / Cloud (ADMS) — recommended</SelectItem>
                    <SelectItem value="pull">Direct / Local network</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {form.connectionMode === "push" ? (
                <div className="space-y-2">
                  <Label>Serial Number</Label>
                  <Input
                    value={form.serialNumber}
                    onChange={(e) => setForm({ ...form, serialNumber: e.target.value })}
                    placeholder="Found on device: Menu → Info → Device Info"
                  />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Device IP</Label>
                      <Input
                        value={form.ip}
                        onChange={(e) => setForm({ ...form, ip: e.target.value })}
                        placeholder="192.168.1.201"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Port</Label>
                      <Input
                        value={form.port}
                        onChange={(e) => setForm({ ...form, port: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Comm Key</Label>
                    <Input
                      value={form.commKey}
                      onChange={(e) => setForm({ ...form, commKey: e.target.value })}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Direct mode only works while this server and the device are on
                    the same network.
                  </p>
                </>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
                Cancel
              </Button>
              <Button onClick={handleRegister} disabled={saving}>
                {saving ? "Adding..." : "Add Device"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {justRegistered && (
        <Card className="border-primary/40 bg-primary/5">
          <CardContent className="space-y-3 p-5">
            <h3 className="font-semibold">
              Now set this up on the "{justRegistered.name}" device
            </h3>
            <p className="text-sm text-muted-foreground">
              On the device screen: Menu → Comm → Cloud Server Setting (or "ADMS"),
              then enter:
            </p>
            <div className="grid gap-2 rounded-lg border bg-background p-3 text-sm sm:grid-cols-2">
              <div>
                <span className="text-muted-foreground">Server Address: </span>
                <span className="font-mono font-medium">{connectionInfo.address}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Server Port: </span>
                <span className="font-mono font-medium">{connectionInfo.port}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Save on the device — it will connect within a few seconds. This card's
              device will show as "Online" below once it does.
            </p>
            <Button size="sm" variant="outline" onClick={() => setJustRegistered(null)}>
              Got it
            </Button>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading devices...</p>
      ) : devices.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
            <FingerprintIcon className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No biometric devices added yet. Add one so member attendance can be
              marked automatically.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {devices.map((device) => {
            const online = isOnline(device.lastSeenAt);

            return (
              <Card key={device._id}>
                <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
                  <div>
                    <CardTitle className="text-base">{device.name || "Unnamed device"}</CardTitle>
                    <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">
                      {device.connectionMode === "push" ? "Push / Cloud (ADMS)" : "Direct / Local"}
                    </p>
                  </div>

                  <Badge
                    variant="outline"
                    className={
                      online
                        ? "border-green-500/30 bg-green-500/10 text-green-600"
                        : "border-muted-foreground/20 text-muted-foreground"
                    }
                  >
                    <WifiIcon className="mr-1 size-3" />
                    {online ? "Online" : "Offline"}
                  </Badge>
                </CardHeader>

                <CardContent className="space-y-3 text-sm">
                  {device.connectionMode === "push" ? (
                    <p className="text-muted-foreground">
                      Serial: <span className="font-mono">{device.serialNumber || "—"}</span>
                    </p>
                  ) : (
                    <p className="text-muted-foreground">
                      Address: <span className="font-mono">{device.ip}:{device.port}</span>
                    </p>
                  )}

                  <p className="text-muted-foreground">
                    Last seen: {formatRelativeTime(device.lastSeenAt)}
                  </p>

                  {device.lastSyncStatus && device.lastSyncStatus.startsWith("error") && (
                    <p className="text-xs text-destructive">{device.lastSyncStatus}</p>
                  )}

                  <div className="flex gap-2 pt-1">
                    {device.connectionMode === "pull" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSync(device)}
                        disabled={syncingId === device._id}
                      >
                        <RefreshCwIcon className="mr-1.5 size-3.5" />
                        {syncingId === device._id ? "Syncing..." : "Sync Now"}
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(device)}
                      disabled={deletingId === device._id}
                    >
                      <Trash2Icon className="mr-1.5 size-3.5" />
                      Remove
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
