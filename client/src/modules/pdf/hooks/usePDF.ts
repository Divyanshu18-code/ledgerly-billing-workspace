import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';

export interface EmailHistoryItem {
  id: string;
  documentType: string;
  documentId: string;
  recipient: string;
  cc?: string;
  bcc?: string;
  subject: string;
  message?: string;
  status: 'SENT' | 'FAILED';
  createdAt: string;
  createdBy?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export function usePDFPreview(type: 'invoice' | 'quotation', id?: string, theme: string = 'Modern Glass') {
  return useQuery({
    queryKey: ['pdf-preview', type, id, theme],
    queryFn: async () => {
      if (!id) return null;
      const res = await apiClient.get(`/pdf/${type}/${id}?theme=${encodeURIComponent(theme)}`);
      return res.data.data;
    },
    enabled: !!id,
  });
}

export function useSendPDFEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      type: 'invoice' | 'quotation';
      id: string;
      recipient: string;
      cc?: string;
      bcc?: string;
      subject: string;
      message?: string;
      theme?: string;
    }) => {
      const res = await apiClient.post(`/pdf/${payload.type}/${payload.id}/email`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-history'] });
    },
  });
}

export function useEmailHistory() {
  return useQuery({
    queryKey: ['email-history'],
    queryFn: async () => {
      const res = await apiClient.get('/pdf/emails/history');
      return res.data.data as EmailHistoryItem[];
    },
  });
}
