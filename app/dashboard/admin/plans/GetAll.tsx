"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
    getAllPlans,
    updatePlan,
    deletePlan,
    transformPlansToUI,
    UIPlan,
} from "@/lib/api/services/plan/plan";

// shadcn ui
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

function GetAll() {
    const [plans, setPlans] = useState<UIPlan[]>([]);
    const [loading, setLoading] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const [selectedPlan, setSelectedPlan] = useState<UIPlan | null>(null);
    const [deletePlanId, setDeletePlanId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);


    const [form, setForm] = useState({
        name: "",
        priceCents: 0,
        description: "",
    });

    const getToken = () => {
        if (typeof window === "undefined") return "";

        return (
            localStorage.getItem("token") ||
            localStorage.getItem("accessToken") ||
            localStorage.getItem("authToken") ||
            localStorage.getItem("adminToken") ||
            ""
        );
    };

    const openDeleteModal = (id: string) => {
        setDeletePlanId(id);
    };
    const confirmDelete = async () => {
        if (!deletePlanId) return;

        try {
            setDeleting(true);

            await deletePlan(deletePlanId, getToken());

            toast.success("Plan deleted successfully 🗑️");

            setDeletePlanId(null);
            fetchPlans();

        } catch (err) {
            console.error(err);
            toast.error("Delete failed ❌");
        } finally {
            setDeleting(false);
        }
    };
    // ================= FETCH =================
    const fetchPlans = async () => {
        try {
            setLoading(true);

            const res = await getAllPlans({}, getToken());
            const plansArray = res?.data?.data?.plans;

            if (!Array.isArray(plansArray)) {
                throw new Error("Plans array not found");
            }

            setPlans(transformPlansToUI(plansArray));

        } catch (err) {
            console.error(err);
            toast.error("Failed to load plans ❌");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    // ================= EDIT =================
    const handleEdit = (plan: UIPlan) => {
        setSelectedPlan(plan);

        setForm({
            name: plan.name,
            priceCents: Number(plan.price.replace(/[^0-9]/g, "")),
            description: plan.description || "",
        });
    };

    // ================= UPDATE =================
    const handleUpdate = async () => {
        if (!selectedPlan) return;

        try {
            setUpdating(true);

            await updatePlan(
                selectedPlan.id,
                {
                    name: form.name,
                    priceCents: form.priceCents,
                    description: form.description,
                },
                getToken()
            );

            toast.success("Plan updated successfully 🎉");

            setSelectedPlan(null);
            fetchPlans();

        } catch (err) {
            console.error(err);
            toast.error("Update failed ❌");
        } finally {
            setUpdating(false);
        }
    };

    // ================= DELETE =================
    const handleDelete = async (id: string) => {
        try {
            setDeletingId(id);

            await deletePlan(id, getToken());

            toast.success("Plan deleted successfully 🗑️");

            fetchPlans();

        } catch (err) {
            console.error(err);
            toast.error("Delete failed ❌");
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* ================= HEADER ================= */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">All Plans</h2>

                {/* 🔄 REFRESH BUTTON */}
                <Button onClick={fetchPlans} variant="outline">
                    Refresh
                </Button>
            </div>

            {/* ================= LOADING ================= */}
            {loading ? (
                <div className="text-center text-gray-500">Loading plans...</div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {plans.map((plan) => (
                        <Card key={plan.id} className="hover:shadow-lg transition">
                            <CardHeader>
                                <CardTitle className="flex justify-between items-center">
                                    {plan.name}

                                    <span
                                        className={`text-xs px-2 py-1 rounded-full ${plan.status === "active"
                                                ? "bg-green-100 text-green-700"
                                                : "bg-red-100 text-red-700"
                                            }`}
                                    >
                                        {plan.status}
                                    </span>
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="space-y-2">
                                <p className="text-lg font-semibold">{plan.price}</p>
                                <p className="text-sm text-gray-500">{plan.duration}</p>

                                <div className="flex gap-2">
                                    <Button onClick={() => handleEdit(plan)}>
                                        Edit
                                    </Button>

                                    {/* 🗑️ DELETE BUTTON */}
                                    <Button
                                        variant="destructive"
                                        onClick={() => openDeleteModal(plan.id)}
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* ================= MODAL ================= */}
            <Dialog open={!!selectedPlan} onOpenChange={() => setSelectedPlan(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Plan</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-3">
                        <Input
                            value={form.name}
                            onChange={(e) =>
                                setForm({ ...form, name: e.target.value })
                            }
                            placeholder="Plan Name"
                        />

                        <Input
                            value={form.priceCents}
                            onChange={(e) =>
                                setForm({ ...form, priceCents: Number(e.target.value) })
                            }
                            placeholder="Price in cents"
                        />

                        <Input
                            value={form.description}
                            onChange={(e) =>
                                setForm({ ...form, description: e.target.value })
                            }
                            placeholder="Description"
                        />

                        <div className="flex gap-2">
                            <Button onClick={handleUpdate} disabled={updating}>
                                {updating ? "Updating..." : "Update"}
                            </Button>

                            <Button
                                variant="secondary"
                                onClick={() => setSelectedPlan(null)}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
            <Dialog open={!!deletePlanId} onOpenChange={() => setDeletePlanId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Delete</DialogTitle>
                    </DialogHeader>

                    <p className="text-sm text-gray-500">
                        Are you sure you want to delete this plan? This action cannot be undone.
                    </p>

                    <div className="flex gap-2 pt-4">
                        <Button
                            variant="destructive"
                            onClick={confirmDelete}
                            disabled={deleting}
                        >
                            {deleting ? "Deleting..." : "Yes, Delete"}
                        </Button>

                        <Button
                            variant="secondary"
                            onClick={() => setDeletePlanId(null)}
                        >
                            Cancel
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default GetAll;