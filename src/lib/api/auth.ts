import axios from 'axios';
import type { LoginRequest, LoginResponse } from '@/types';

const authApi = axios.create({ baseURL: '/api/v1/auth', timeout: 10000 });

export const login = async (data: LoginRequest): Promise<LoginResponse> => {
    const res = await authApi.post<LoginResponse>('/login', data);
    return res.data;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const register = async (data: any): Promise<any> => {
    const res = await authApi.post('/register', data);
    return res.data;
};
