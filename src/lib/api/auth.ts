import axios from 'axios';
import type { LoginRequest, LoginResponse } from '@/types';

const authApi = axios.create({ baseURL: '/api/v1/auth', timeout: 10000 });

export const login = async (data: LoginRequest): Promise<LoginResponse> => {
    const res = await authApi.post<LoginResponse>('/login', data);
    return res.data;
};
