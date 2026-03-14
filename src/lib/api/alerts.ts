import api from './axios';
import type { Alert } from '@/types';

export const getAlerts = async (): Promise<Alert[]> => {
    const res = await api.get<Alert[]>('/alerts');
    return res.data;
};
