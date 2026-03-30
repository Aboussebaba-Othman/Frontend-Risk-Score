import api from './axios';
import type { Alert } from '@/types';

export const getAlerts = async (): Promise<Alert[]> => {
    const res = await api.get<Alert[]>('/alerts');
    return res.data;
};

export const markAlertAsRead = async (id: number): Promise<void> => {
    await api.put(`/alerts/${id}/read`);
};

export const markAllAlertsAsRead = async (): Promise<void> => {
    await api.put('/alerts/mark-all-read');
};
