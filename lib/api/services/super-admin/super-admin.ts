"use client";

import apiClient from "@/lib/api/axios";

export type SuperAdminMetricMap = {
  totalGyms: number;
  activeSubscriptions: number;
  trialGyms: number;
  trialsEndingSoon: number;
  pendingPayments: number;
  expiredGyms: number;
  suspendedGyms: number;
  monthlyRevenue: number;
  newGymsThisMonth: number;
};

export const superAdminApi = {
  getOverview: async () => {
    const res = await apiClient.get("/super-admin/overview");
    return res.data?.data;
  },
  listGyms: async (params?: Record<string, string>) => {
    const res = await apiClient.get("/super-admin/gyms", { params });
    return res.data?.data || [];
  },
  getGymDetail: async (id: string) => {
    const res = await apiClient.get(`/super-admin/gyms/${id}`);
    return res.data?.data;
  },
  createGym: async (payload: Record<string, unknown>) => {
    const res = await apiClient.post("/super-admin/gyms", payload);
    return res.data;
  },
  updateGymStatus: async (id: string, payload: Record<string, unknown>) => {
    const res = await apiClient.patch(`/super-admin/gyms/${id}/status`, payload);
    return res.data;
  },
  manageTrial: async (id: string, payload: Record<string, unknown>) => {
    const res = await apiClient.post(`/super-admin/gyms/${id}/trial`, payload);
    return res.data;
  },
  listPlans: async () => {
    const res = await apiClient.get("/super-admin/plans");
    return res.data?.data || [];
  },
  createPlan: async (payload: Record<string, unknown>) => {
    const res = await apiClient.post("/super-admin/plans", payload);
    return res.data;
  },
  updatePlan: async (id: string, payload: Record<string, unknown>) => {
    const res = await apiClient.patch(`/super-admin/plans/${id}`, payload);
    return res.data;
  },
  listPayments: async (params?: Record<string, string>) => {
    const res = await apiClient.get("/super-admin/payments", { params });
    return res.data?.data || [];
  },
  markPaymentPaid: async (id: string, payload: Record<string, unknown>) => {
    const res = await apiClient.patch(`/super-admin/payments/${id}/mark-paid`, payload);
    return res.data;
  },
  listConversations: async () => {
    const res = await apiClient.get("/super-admin/conversations");
    return res.data?.data || [];
  },
  getConversation: async (id: string) => {
    const res = await apiClient.get(`/super-admin/conversations/${id}`);
    return res.data?.data;
  },
  sendConversationMessage: async (payload: Record<string, unknown>) => {
    const res = await apiClient.post("/super-admin/conversations/message", payload);
    return res.data;
  },
  listNotifications: async () => {
    const res = await apiClient.get("/super-admin/notifications");
    return res.data?.data || [];
  },
  listAuditLogs: async (params?: Record<string, string>) => {
    const res = await apiClient.get("/super-admin/audit-logs", { params });
    return res.data?.data || [];
  },
};
