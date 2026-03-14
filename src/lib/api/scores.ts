import api from './axios';
import type { Score, Recommendation } from '@/types';

export const calculateScore = async (companyId: number): Promise<Score> => {
    const res = await api.post<Score>(`/scores/calculate/${companyId}`);
    return res.data;
};

export const getLatestScore = async (companyId: number): Promise<Score> => {
    const res = await api.get<Score>(`/scores/companies/${companyId}/latest`);
    return res.data;
};

export const getScoreHistory = async (companyId: number): Promise<Score[]> => {
    const res = await api.get<Score[]>(`/scores/companies/${companyId}/history`);
    return res.data;
};

export const getRecommendation = async (companyId: number): Promise<Recommendation> => {
    const res = await api.get<Recommendation>(`/scores/companies/${companyId}/recommendation`);
    return res.data;
};

export const getAllScores = async (): Promise<Score[]> => {
    const res = await api.get<Score[]>('/scores');
    return res.data;
};


