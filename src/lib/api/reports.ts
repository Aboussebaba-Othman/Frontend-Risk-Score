import api from './axios';
import { } from '@/store/authStore';

export const downloadReport = async (companyId: number): Promise<Blob> => {
    const res = await api.get(`/reports/company/${companyId}/download`, {
        responseType: 'blob',
        headers: {
            'Accept': 'application/pdf'
        }
    });
    return res.data;
};

export const triggerReport = async (companyId: number): Promise<void> => {
    try {
        const blob = await downloadReport(companyId);
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.setAttribute('download', `rapport_${companyId}.pdf`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
        console.error('Report download failed:', err);
        // Show user-friendly error
        alert('Échec du téléchargement du rapport. Le serveur a rencontré une erreur ou les données sont indisponibles.');
    }
};
