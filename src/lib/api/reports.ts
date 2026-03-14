import api from './axios';
import { useAuthStore } from '@/store/authStore';

export const downloadReport = async (companyId: number): Promise<Blob> => {
    const res = await api.get(`/reports/company/${companyId}/download`, { responseType: 'blob' });
    return res.data;
};

export const triggerReport = (companyId: number): void => {
    // Get token from Zustand persisted store
    const token = useAuthStore.getState().token;
    const url = `/api/v1/reports/company/${companyId}/download`;

    fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
        .then(async (r) => {
            if (!r.ok) throw new Error(`Server error: ${r.status}`);
            return r.blob();
        })
        .then((blob) => {
            const blobUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.setAttribute('download', `rapport_${companyId}.pdf`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(blobUrl);
        })
        .catch((err) => console.error('Report download failed:', err));
};
