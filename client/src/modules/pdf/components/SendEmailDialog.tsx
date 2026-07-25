import React, { useState } from 'react';
import { X, Send, Paperclip, Loader2, Sparkles } from 'lucide-react';
import { useSendPDFEmail } from '../hooks/usePDF';
import { CustomSelect } from '@/components/ui/CustomSelect';

interface SendEmailDialogProps {
  type: 'invoice' | 'quotation';
  id: string;
  number: string;
  defaultEmail?: string;
  theme?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const SendEmailDialog: React.FC<SendEmailDialogProps> = ({
  type,
  id,
  number,
  defaultEmail = '',
  theme = 'Modern Glass',
  isOpen,
  onClose,
}) => {
  const [recipient, setRecipient] = useState<string>(defaultEmail);
  const [cc, setCc] = useState<string>('');
  const [bcc, setBcc] = useState<string>('');
  const [subject, setSubject] = useState<string>(
    `${type === 'invoice' ? 'Invoice' : 'Quotation'} #${number} from Ledgerly`
  );
  const [preset, setPreset] = useState<string>('Standard Document Email');
  const [message, setMessage] = useState<string>(
    `Dear Customer,\n\nPlease find attached ${type === 'invoice' ? 'Invoice' : 'Quotation'} #${number}.\n\nThank you for your business.`
  );
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { mutate: sendEmail, isPending } = useSendPDFEmail();

  if (!isOpen) return null;

  const handlePresetChange = (val: string) => {
    setPreset(val);
    if (val === 'Payment Reminder') {
      setSubject(`Payment Reminder: Invoice #${number}`);
      setMessage(`Dear Customer,\n\nThis is a friendly payment reminder regarding Invoice #${number}.\n\nPlease remit payment at your earliest convenience.\n\nThank you!`);
    } else if (val === 'Thank You Email') {
      setSubject(`Thank You for Payment — Invoice #${number}`);
      setMessage(`Dear Customer,\n\nWe have received your payment for Invoice #${number}.\n\nThank you for partnering with us!`);
    } else {
      setSubject(`${type === 'invoice' ? 'Invoice' : 'Quotation'} #${number} from Ledgerly`);
      setMessage(`Dear Customer,\n\nPlease find attached ${type === 'invoice' ? 'Invoice' : 'Quotation'} #${number}.\n\nThank you for your business.`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    sendEmail(
      {
        type,
        id,
        recipient,
        cc: cc || undefined,
        bcc: bcc || undefined,
        subject,
        message,
        theme,
      },
      {
        onSuccess: (data) => {
          setStatusMsg({ type: 'success', text: data.message || 'Email dispatched successfully!' });
          setTimeout(() => {
            onClose();
          }, 1500);
        },
        onError: (err: any) => {
          setStatusMsg({ type: 'error', text: err.response?.data?.message || err.message || 'Failed to dispatch email' });
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-slate-900 shadow-2xl overflow-hidden space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-white/10 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Dispatch {type === 'invoice' ? 'Invoice' : 'Quotation'} Email
              </h3>
              <p className="text-xs text-gray-400">SMTP Server Delivery — #{number}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 pt-2 space-y-4 text-xs">
          {statusMsg && (
            <div
              className={`p-3 rounded-xl text-xs font-bold ${
                statusMsg.type === 'success'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-red-500/10 text-red-400 border border-red-500/30'
              }`}
            >
              {statusMsg.text}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                Preset Email Template
              </label>
              <CustomSelect
                value={preset}
                onChange={handlePresetChange}
                options={[
                  { value: 'Standard Document Email', label: 'Standard Document Email' },
                  { value: 'Payment Reminder', label: 'Payment Reminder' },
                  { value: 'Thank You Email', label: 'Thank You Email' },
                ]}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                Recipient Email *
              </label>
              <input
                type="email"
                required
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="customer@client.com"
                className="w-full h-10 px-3.5 rounded-xl border border-white/10 bg-slate-950 text-white focus:ring-2 focus:ring-blue-500/20 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                CC (Optional)
              </label>
              <input
                type="email"
                value={cc}
                onChange={(e) => setCc(e.target.value)}
                placeholder="accounts@client.com"
                className="w-full h-10 px-3.5 rounded-xl border border-white/10 bg-slate-950 text-white focus:ring-2 focus:ring-blue-500/20 outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                BCC (Optional)
              </label>
              <input
                type="email"
                value={bcc}
                onChange={(e) => setBcc(e.target.value)}
                placeholder="audit@company.com"
                className="w-full h-10 px-3.5 rounded-xl border border-white/10 bg-slate-950 text-white focus:ring-2 focus:ring-blue-500/20 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
              Subject Line *
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl border border-white/10 bg-slate-950 text-white font-medium focus:ring-2 focus:ring-blue-500/20 outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
              Custom Message Body
            </label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-3 rounded-xl border border-white/10 bg-slate-950 text-white font-mono text-xs focus:ring-2 focus:ring-blue-500/20 outline-none"
            />
          </div>

          {/* PDF Attachment Chip */}
          <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Paperclip className="w-4 h-4 shrink-0" />
            <span className="font-bold text-xs">Attachment:</span>
            <span className="font-mono text-xs text-white">
              {type === 'invoice' ? 'Invoice' : 'Quotation'}-{number}.pdf
            </span>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-white/10 text-gray-300 font-semibold cursor-pointer hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 cursor-pointer disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Dispatching via SMTP...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Send Email Now</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
