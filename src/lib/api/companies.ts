import api from './axios';
import type { Company, FinancialData } from '@/types';

export const getCompanies = async (): Promise<Company[]> => {
    const res = await api.get<Company[]>('/companies');
    return res.data;
};

export const getCompany = async (id: number): Promise<Company> => {
    const res = await api.get<Company>(`/companies/${id}`);
    return res.data;
};

export const createCompany = async (data: Partial<Company>): Promise<Company> => {
    const res = await api.post<Company>('/companies', data);
    return res.data;
};

export const updateCompany = async (id: number, data: Partial<Company>): Promise<Company> => {
    const res = await api.put<Company>(`/companies/${id}`, data);
    return res.data;
};

export const deleteCompany = async (id: number): Promise<void> => {
    await api.delete(`/companies/${id}`);
};

export const addFinancialData = async (companyId: number, data: Partial<FinancialData>): Promise<FinancialData> => {
    const res = await api.post<FinancialData>(`/companies/${companyId}/financials`, data);
    return res.data;
};

export const getLatestFinancials = async (companyId: number): Promise<FinancialData> => {
    const res = await api.get<FinancialData>(`/companies/${companyId}/financials/latest`);
    return res.data;
};
