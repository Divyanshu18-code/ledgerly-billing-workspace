import React, { useState } from 'react';
import { X, Printer, Download, Mail, Layout, Loader2 } from 'lucide-react';
import { usePDFPreview } from '../hooks/usePDF';
import { CustomSelect } from '@/components/ui/CustomSelect';

interface PDFPreviewModalProps {
  type: 'invoice' | 'quotation';
  id: string;
  number: string;
  isOpen: boolean;
  onClose: () => void;
  onOpenEmail: (theme: string) => void;
}

export const PDFPreviewModal: React.FC<PDFPreviewModalProps> = ({
  type,
  id,
  number,
  isOpen,
  onClose,
  onOpenEmail,
}) => {
  const [theme, setTheme] = useState<string>('Modern Glass');
  const { data, isLoading } = usePDFPreview(type, id, theme);

  if (!isOpen) return null;

  const handlePrint = () => {
    if (!data?.html) return;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(data.html);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 300);
    }
  };

  const handleDownload = () => {
    if (!data?.html) return;
    const blob = new Blob([data.html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${type === 'invoice' ? 'Invoice' : 'Quotation'}-${number}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl border border-white/10 bg-slate-900 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-white/10 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Layout className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white capitalize">
                {type} Preview — #{number}
              </h3>
              <p className="text-xs text-gray-400">A4 Document View & Export Standards</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Template Switcher */}
            <div className="w-44">
              <CustomSelect
                value={theme}
                onChange={(val) => setTheme(val)}
                options={[
                  { value: 'Modern Glass', label: 'Modern Glass' },
                  { value: 'Classic Corporate', label: 'Classic Corporate' },
                  { value: 'Minimalist Clean', label: 'Minimalist Clean' },
                ]}
              />
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live A4 Document Iframe Container */}
        <div className="flex-1 p-6 bg-slate-950/80 overflow-y-auto flex items-center justify-center min-h-[500px]">
          {isLoading ? (
            <div className="flex flex-col items-center gap-3 text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
              <p className="text-xs font-semibold">Generating high-precision A4 PDF layout...</p>
            </div>
          ) : (
            <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200">
              <iframe
                title="PDF Document Preview"
                srcDoc={data?.html}
                className="w-full h-[620px] border-none"
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-4 px-6 border-t border-white/10 bg-slate-950/90">
          <div className="text-xs text-gray-400">
            Selected Template: <span className="font-bold text-white">{theme}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePrint}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-slate-200 hover:bg-white/10 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
            >
              <Printer className="w-4 h-4 text-blue-400" />
              <span>Print A4</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenEmail(theme);
              }}
              disabled={isLoading}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <Mail className="w-4 h-4" />
              <span>Send Email</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
