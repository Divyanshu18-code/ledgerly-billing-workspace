import React from 'react';
import { Mail, CheckCircle2, XCircle, Clock, User, FileText } from 'lucide-react';
import { useEmailHistory } from '../hooks/usePDF';

export const EmailHistoryTable: React.FC = () => {
  const { data: history = [], isLoading } = useEmailHistory();

  if (isLoading) {
    return (
      <div className="p-8 rounded-2xl border border-white/10 bg-slate-900/50 text-center text-gray-400 text-xs">
        Loading dispatch history logs...
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="p-8 rounded-2xl border border-white/10 bg-slate-900/50 text-center text-gray-400 text-xs space-y-2">
        <Mail className="w-8 h-8 text-gray-500 mx-auto opacity-50" />
        <p className="font-bold text-white">No Email Dispatches Logged Yet</p>
        <p className="text-[11px] text-gray-400">Emails sent with Invoice and Quotation PDF attachments will appear here.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900 overflow-hidden shadow-xl">
      <div className="p-4 px-6 border-b border-white/10 flex items-center justify-between bg-slate-950/60">
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-bold text-white">Document Dispatch Email History</h3>
        </div>
        <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-mono text-[10px] font-bold">
          {history.length} Logs
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/80 text-gray-400 font-bold uppercase text-[10px] tracking-wider border-b border-white/10">
            <tr>
              <th className="p-3.5 px-6">Recipient</th>
              <th className="p-3.5">Document</th>
              <th className="p-3.5">Subject</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5">Sent By</th>
              <th className="p-3.5 pr-6">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {history.map((log) => (
              <tr key={log.id} className="hover:bg-white/5 transition-colors">
                <td className="p-3.5 px-6 font-semibold text-white">
                  {log.recipient}
                </td>
                <td className="p-3.5">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 text-blue-400 font-mono text-[11px] font-bold">
                    <FileText className="w-3 h-3" />
                    {log.documentType}
                  </span>
                </td>
                <td className="p-3.5 text-slate-300 max-w-xs truncate">
                  {log.subject}
                </td>
                <td className="p-3.5">
                  {log.status === 'SENT' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold text-[10px]">
                      <CheckCircle2 className="w-3 h-3" /> SENT
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 font-bold text-[10px]">
                      <XCircle className="w-3 h-3" /> FAILED
                    </span>
                  )}
                </td>
                <td className="p-3.5 text-gray-400">
                  <span className="inline-flex items-center gap-1">
                    <User className="w-3 h-3 text-gray-500" />
                    {log.createdBy ? `${log.createdBy.firstName} ${log.createdBy.lastName}` : 'System Admin'}
                  </span>
                </td>
                <td className="p-3.5 pr-6 text-gray-400 font-mono text-[11px]">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3 h-3 text-gray-500" />
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
