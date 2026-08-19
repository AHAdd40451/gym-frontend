"use client";

import { useEffect, useMemo, useState } from "react";
import { io, Socket } from "socket.io-client";
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
  _id?: string;
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
};

type Attendance = {
  _id: string;
  user: User;
  date: string;
  status: "present" | "absent" | "leave";
  leaveStatus?: "pending" | "approved" | "rejected";
  leaveReason: string;
};

type UserAttendanceGroup = {
  userKey: string;
  user: User;
  records: Attendance[];
  presentCount: number;
  absentCount: number;
  leaveCount: number;
  pendingLeave?: Attendance;
  latestRecord?: Attendance;
};

const SOCKET_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5003/api"
).replace(/\/api\/?$/, "");

const getGymId = (): string | null => {
  if (typeof window === "undefined") return null;

  for (const key of ["user", "currentUser", "authUser", "adminUser"]) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;

      const parsed = JSON.parse(raw);
      if (parsed?.gymId) return parsed.gymId;
    } catch {
      // ignore malformed entries and try the next key
    }
  }

  return null;
};

/* ================= COMPONENT ================= */

function All() {
  const [data, setData] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");

  const [selectedLeave, setSelectedLeave] = useState<Attendance | null>(null);
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);

  const [selectedUserGroup, setSelectedUserGroup] =
    useState<UserAttendanceGroup | null>(null);
  const [calendarModalOpen, setCalendarModalOpen] = useState(false);

  const [calendarMonth, setCalendarMonth] = useState(() => new Date());

  /* ================= FETCH ================= */

  const fetchAll = async (silent = false) => {
    try {
      if (!silent) setLoading(true);

      const res = await getAllAttendance();

      const finalData =
        res?.data?.attendance ||
        res?.attendance ||
        res?.data ||
        [];

      setData(Array.isArray(finalData) ? finalData : []);
    } catch (err) {
      console.error("❌ Error fetching attendance:", err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();

    // Poll for new punches as a fallback so a fresh device scan shows up
    // even if the socket connection above ever drops.
    const intervalId = setInterval(() => fetchAll(true), 15000);

    return () => clearInterval(intervalId);
  }, []);

  // Live push: the moment the backend marks a biometric punch as
  // attendance, refresh instantly instead of waiting for the next poll.
  useEffect(() => {
    const gymId = getGymId();
    if (!gymId) return;

    const socket: Socket = io(SOCKET_URL, { transports: ["websocket"] });

    socket.emit("joinGym", gymId);

    socket.on("attendance:new", () => {
      fetchAll(true);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  /* ================= HELPERS ================= */

  const getUserName = (user?: User) => {
    const name = `${user?.firstName || ""} ${user?.lastName || ""}`.trim();

    return name || user?.email || "Deleted Member";
  };

  const getUserKey = (user?: User) => {
    return (
      user?._id ||
      user?.id ||
      user?.email ||
      `${user?.firstName || ""}-${user?.lastName || ""}`
    );
  };

  const getDateKey = (dateValue: string | Date) => {
    const date = new Date(dateValue);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return "bg-green-500 text-white";
      case "absent":
        return "bg-red-500 text-white";
      case "leave":
        return "bg-yellow-500 text-white";
      default:
        return "bg-gray-400 text-white";
    }
  };

  const getLeaveStatusColor = (status?: string) => {
    switch (status) {
      case "approved":
        return "bg-green-600 text-white";
      case "rejected":
        return "bg-red-600 text-white";
      case "pending":
      default:
        return "bg-yellow-500 text-white";
    }
  };

  /* ================= GROUP USERS ================= */

  const groupedUsers = useMemo<UserAttendanceGroup[]>(() => {
    const map = new Map<string, UserAttendanceGroup>();

    data.forEach((item) => {
      const userKey = getUserKey(item.user);

      if (!map.has(userKey)) {
        map.set(userKey, {
          userKey,
          user: item.user,
          records: [],
          presentCount: 0,
          absentCount: 0,
          leaveCount: 0,
          pendingLeave: undefined,
          latestRecord: undefined,
        });
      }

      const group = map.get(userKey)!;

      group.records.push(item);

      if (item.status === "present") group.presentCount += 1;
      if (item.status === "absent") group.absentCount += 1;
      if (item.status === "leave") group.leaveCount += 1;

      if (item.status === "leave" && item.leaveStatus === "pending") {
        group.pendingLeave = item;
      }

      if (
        !group.latestRecord ||
        new Date(item.date).getTime() >
          new Date(group.latestRecord.date).getTime()
      ) {
        group.latestRecord = item;
      }
    });

    return Array.from(map.values());
  }, [data]);

  const filteredAndSortedUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    const users = [...groupedUsers];

    if (!query) {
      return users.sort((a, b) => {
        const aTime = a.latestRecord
          ? new Date(a.latestRecord.date).getTime()
          : 0;
        const bTime = b.latestRecord
          ? new Date(b.latestRecord.date).getTime()
          : 0;

        return bTime - aTime;
      });
    }

    return users.sort((a, b) => {
      const aName = getUserName(a.user).toLowerCase();
      const bName = getUserName(b.user).toLowerCase();

      const aEmail = a.user?.email?.toLowerCase() || "";
      const bEmail = b.user?.email?.toLowerCase() || "";

      const aMatch = aName.includes(query) || aEmail.includes(query);
      const bMatch = bName.includes(query) || bEmail.includes(query);

      if (aMatch && !bMatch) return -1;
      if (!aMatch && bMatch) return 1;

      return aName.localeCompare(bName);
    });
  }, [groupedUsers, search]);

  /* ================= MODAL ACTIONS ================= */

  const openLeaveModal = (item: Attendance) => {
    setSelectedLeave(item);
    setLeaveModalOpen(true);
  };

  const openCalendarModal = (group: UserAttendanceGroup) => {
    setSelectedUserGroup(group);

    const latestDate = group.latestRecord?.date
      ? new Date(group.latestRecord.date)
      : new Date();

    setCalendarMonth(latestDate);
    setCalendarModalOpen(true);
  };

  const handleLeaveAction = async (status: "approved" | "rejected") => {
    if (!selectedLeave) return;

    try {
      await updateLeaveStatus(selectedLeave._id, status);

      await fetchAll();

      setLeaveModalOpen(false);
      setSelectedLeave(null);
    } catch (err) {
      console.error("Error updating leave:", err);
    }
  };

  /* ================= CALENDAR HELPERS ================= */

  const selectedMonthRecords = useMemo(() => {
    if (!selectedUserGroup) return new Map<string, Attendance>();

    const map = new Map<string, Attendance>();

    selectedUserGroup.records.forEach((record) => {
      const recordDate = new Date(record.date);

      if (
        recordDate.getMonth() === calendarMonth.getMonth() &&
        recordDate.getFullYear() === calendarMonth.getFullYear()
      ) {
        map.set(getDateKey(record.date), record);
      }
    });

    return map;
  }, [selectedUserGroup, calendarMonth]);

  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const firstWeekDay = firstDayOfMonth.getDay();
    const totalDays = lastDayOfMonth.getDate();

    const days: Array<Date | null> = [];

    for (let i = 0; i < firstWeekDay; i++) {
      days.push(null);
    }

    for (let day = 1; day <= totalDays; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  }, [calendarMonth]);

  const changeMonth = (direction: "prev" | "next") => {
    setCalendarMonth((prev) => {
      const nextDate = new Date(prev);

      if (direction === "prev") {
        nextDate.setMonth(nextDate.getMonth() - 1);
      } else {
        nextDate.setMonth(nextDate.getMonth() + 1);
      }

      return nextDate;
    });
  };

  const monthTitle = calendarMonth.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  /* ================= UI ================= */

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">📋 Attendance Dashboard</h2>
          <p className="text-sm text-gray-500 mt-1">
            Search user and click card to view monthly attendance calendar.
          </p>
        </div>

        <div className="w-full md:w-[360px]">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search user by name or email..."
            className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
          />
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <div className="grid gap-4">
          {filteredAndSortedUsers.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-sm text-gray-500">
                No attendance records found.
              </CardContent>
            </Card>
          ) : (
            filteredAndSortedUsers.map((group) => (
              <Card
                key={group.userKey}
                onClick={() => openCalendarModal(group)}
                className="cursor-pointer shadow-sm transition hover:shadow-md"
              >
                <CardHeader className="flex flex-row items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg">
                      👤 {getUserName(group.user)}
                    </CardTitle>

                    <p className="mt-1 text-sm text-gray-500">
                      {group.user?.email || "No email"}{" "}
                      {group.user?.role ? `• ${group.user.role}` : ""}
                    </p>
                  </div>

                  {group.latestRecord && (
                    <Badge className={getStatusColor(group.latestRecord.status)}>
                      Latest: {group.latestRecord.status}
                    </Badge>
                  )}
                </CardHeader>

                <CardContent className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-green-500 text-white">
                      Present {group.presentCount}
                    </Badge>

                    <Badge className="bg-red-500 text-white">
                      Absent {group.absentCount}
                    </Badge>

                    <Badge className="bg-yellow-500 text-white">
                      Leave {group.leaveCount}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-3">
                    {group.latestRecord && (
                      <p className="text-sm text-gray-500">
                        Last:{" "}
                        {new Date(group.latestRecord.date).toDateString()}
                      </p>
                    )}

                    {group.pendingLeave && (
                      <Button
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          openLeaveModal(group.pendingLeave!);
                        }}
                      >
                        Review Leave
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* ================= MONTHLY CALENDAR MODAL ================= */}

      <Dialog open={calendarModalOpen} onOpenChange={setCalendarModalOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Monthly Attendance -{" "}
              {selectedUserGroup ? getUserName(selectedUserGroup.user) : ""}
            </DialogTitle>
          </DialogHeader>

          {selectedUserGroup && (
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-3">
                <Button variant="outline" onClick={() => changeMonth("prev")}>
                  Previous
                </Button>

                <h3 className="text-lg font-semibold">{monthTitle}</h3>

                <Button variant="outline" onClick={() => changeMonth("next")}>
                  Next
                </Button>
              </div>

              <div className="grid grid-cols-7 gap-2 text-center text-sm font-semibold text-gray-600">
                <div>Sun</div>
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((day, index) => {
                  if (!day) {
                    return (
                      <div
                        key={`empty-${index}`}
                        className="min-h-[58px] rounded-lg border border-transparent"
                      />
                    );
                  }

                  const key = getDateKey(day);
                  const record = selectedMonthRecords.get(key);

                  return (
                    <div
                      key={key}
                      className="min-h-[58px] rounded-lg border bg-white p-1.5"
                    >
                      <p className="text-sm font-semibold">{day.getDate()}</p>

                      {record ? (
                        <div className="mt-1 space-y-1">
                          <Badge className={getStatusColor(record.status)}>
                            {record.status}
                          </Badge>

                          {record.status === "leave" && (
                            <div className="space-y-1">
                              <Badge
                                className={getLeaveStatusColor(
                                  record.leaveStatus
                                )}
                              >
                                {record.leaveStatus || "pending"}
                              </Badge>

                              {record.leaveReason && (
                                <p className="line-clamp-1 text-[10px] text-gray-500">
                                  {record.leaveReason}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="mt-3 text-xs text-gray-400">
                          No record
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-wrap gap-2 border-t pt-4">
                <Badge className="bg-green-500 text-white">Present</Badge>
                <Badge className="bg-red-500 text-white">Absent</Badge>
                <Badge className="bg-yellow-500 text-white">Leave</Badge>
                <Badge className="bg-gray-400 text-white">No Record</Badge>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ================= LEAVE REVIEW MODAL ================= */}

      <Dialog open={leaveModalOpen} onOpenChange={setLeaveModalOpen}>
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
                <Badge className="bg-yellow-500 text-white">Pending</Badge>
              </p>

              <div className="rounded-md bg-gray-100 p-3">
                <p className="text-sm font-medium text-gray-700">
                  Leave Reason:
                </p>

                <p className="mt-1 text-sm text-gray-600">
                  {selectedLeave.leaveReason || "No Reason Provided"}
                </p>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => handleLeaveAction("approved")}
                >
                  Accept
                </Button>

                <Button
                  variant="destructive"
                  onClick={() => handleLeaveAction("rejected")}
                >
                  Reject
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setLeaveModalOpen(false)}
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