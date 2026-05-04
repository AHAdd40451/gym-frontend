"use client";

import { useEffect, useState } from "react";
import {
    getAllAttendance,
    updateLeaveStatus,
} from "@/lib/api/services/attendence/attendence";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

/* ================= TYPES ================= */

type User = {
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: string;
};

type Attendance = {
    _id: string;
    user: User; // ✅ FIXED (backend actual field)
    date: string;
    status: "present" | "absent" | "leave";
    leaveStatus?: "pending" | "approved" | "rejected";
    leaveReason: string;


};

/* ================= COMPONENT ================= */

function All() {
    const [data, setData] = useState<Attendance[]>([]);
    const [loading, setLoading] = useState(false);

    const [selectedLeave, setSelectedLeave] = useState<Attendance | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

    /* ================= FETCH ================= */

    const fetchAll = async () => {
        try {
            setLoading(true);

            const res = await getAllAttendance();

            console.log("📦 API Response:", res);

            const finalData = res?.data?.attendance || [];

            setData(finalData);
        } catch (err) {
            console.error("❌ Error fetching attendance:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAll();
    }, []);

    /* ================= MODAL ================= */

    const openLeaveModal = (item: Attendance) => {
        setSelectedLeave(item);
        setModalOpen(true);
    };

    /* ================= ACTION ================= */

    const handleAction = async (status: "approved" | "rejected") => {
        if (!selectedLeave) return;

        try {
            await updateLeaveStatus(selectedLeave._id, status);

            await fetchAll();

            setModalOpen(false);
            setSelectedLeave(null);
        } catch (err) {
            console.error("Error updating leave:", err);
        }
    };

    /* ================= HELPERS ================= */

    const getStatusColor = (status: string) => {
        switch (status) {
            case "present":
                return "bg-green-500";
            case "absent":
                return "bg-red-500";
            case "leave":
                return "bg-yellow-500";
            default:
                return "bg-gray-400";
        }
    };

    const getUserName = (user?: User) => {
        return user
            ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
            : "Staff";
    };

    /* ================= UI ================= */

    return (
        <div className="p-6 space-y-6">
            <h2 className="text-2xl font-bold">📋 Attendance Dashboard</h2>

            {loading ? (
                <p className="text-gray-500">Loading...</p>
            ) : (
                <div className="grid gap-4">
                    {data.map((item) => (
                        <Card key={item._id} className="shadow-sm hover:shadow-md transition">

                            <CardHeader className="flex flex-row justify-between items-center">

                                <CardTitle className="text-lg">
                                    👤 {getUserName(item.user)}
                                </CardTitle>

                                <Badge className={getStatusColor(item.status)}>
                                    {item.status}
                                </Badge>

                            </CardHeader>

                            <CardContent className="flex justify-between items-center">

                                <p className="text-sm text-gray-500">
                                    📅 {new Date(item.date).toDateString()}
                                </p>

                                {item.status === "leave" &&
                                    item.leaveStatus === "pending" && (
                                        <Button
                                            variant="outline"
                                            onClick={() => openLeaveModal(item)}
                                        >
                                            Review Leave
                                        </Button>
                                    )}
                            </CardContent>

                        </Card>
                    ))}
                </div>
            )}

            {/* ================= MODAL ================= */}

            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent>

                    <DialogHeader>
                        <DialogTitle>Leave Request</DialogTitle>
                    </DialogHeader>

                    {selectedLeave && (
                        <div className="space-y-4">
                            <p>
                                <b>User:</b> {getUserName(selectedLeave.user)}
                            </p>
                            <p>
                                <b>Date:</b>{" "}
                                {new Date(selectedLeave.date).toDateString()}
                            </p>


                            <p>
                                <b>Status:</b>{" "}
                                <Badge className="bg-yellow-500">Pending</Badge>
                            </p>

                            <div className="p-3 rounded-md bg-gray-100">
                                <p className="text-sm font-medium text-gray-700">
                                    Leave Reason:
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                    {selectedLeave.leaveReason || "No Reason Provided"}
                                </p>
                            </div>

                            <div className="flex gap-2 pt-4">

                                <Button
                                    className="bg-green-600 hover:bg-green-700"
                                    onClick={() => handleAction("approved")}
                                >
                                    Accept
                                </Button>

                                <Button
                                    variant="destructive"
                                    onClick={() => handleAction("rejected")}
                                >
                                    Reject
                                </Button>

                                <Button
                                    variant="outline"
                                    onClick={() => setModalOpen(false)}
                                >
                                    Close
                                </Button>

                            </div>
                        </div>
                    )}

                </DialogContent>
            </Dialog>
        </div>
    );
}

export default All;