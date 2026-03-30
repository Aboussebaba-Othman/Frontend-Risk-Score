import api from './axios';
import type { FinancialAnalysis } from '@/types/analysis';

export async function triggerAnalysis(companyId: number): Promise<FinancialAnalysis> {
    const response = await api.post(`/analysis/companies/${companyId}/trigger`);
    return response.data;
}

export async function getLatestAnalysis(companyId: number): Promise<FinancialAnalysis> {
    const response = await api.get(`/analysis/companies/${companyId}/latest`);
    return response.data;
}

export async function getAnalysisHistory(companyId: number): Promise<FinancialAnalysis[]> {
    const response = await api.get(`/analysis/companies/${companyId}/history`);
    return response.data;
}
