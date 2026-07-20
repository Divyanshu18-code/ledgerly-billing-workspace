import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useClientsQuery } from '@/modules/clients/hooks/useClients';
import { useProductsQuery } from '@/modules/products/hooks/useProducts';
import { useQuotationQuery, useUpdateQuotationMutation, type QuotationItemInput } from '../hooks/useQuotations';
import { useWorkspaceData } from '@/modules/workspace/hooks/useWorkspace';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Loader2,
  AlertCircle,
  UserCheck,
} from 'lucide-react';

export const EditQuotationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: workspace } = useWorkspaceData();
  const { data: quotationResponse, isLoading: isQuotationLoading } = useQuotationQuery(id);
  const { data: clientsData } = useClientsQuery({ limit: 100 });
  const { data: productsData } = useProductsQuery({ limit: 100 });

  const quotation = quotationResponse?.data;
  const clients = (clientsData?.clients || []) as any[];
  const products = (productsData?.items || []) as any[];

  const updateMutation = useUpdateQuotationMutation();

  // Form State
  const [clientId, setClientId] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [status, setStatus] = useState<string>('DRAFT');
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Dynamic Item Lines
  const [items, setItems] = useState<QuotationItemInput[]>([]);

  useEffect(() => {
    if (quotation) {
      setClientId(quotation.clientId);
      setValidUntil(new Date(quotation.validUntil).toISOString().split('T')[0]);
      setStatus(quotation.status);
      setNotes(quotation.notes || '');
      setTerms(quotation.terms || '');
      if (quotation.items && quotation.items.length > 0) {
        setItems(
          quotation.items.map((it) => ({
            productId: it.productId || '',
            description: it.description || '',
            quantity: Number(it.quantity),
            unitPrice: Number(it.unitPrice),
            discountAmount: Number(it.discountAmount || 0),
            taxRateValue: Number(it.taxRateValue || 0),
          }))
        );
      }
    }
  }, [quotation]);

  const currencySymbol = workspace?.currency === 'INR' ? '₹' : '$';

  const handleProductSelect = (index: number, prodId: string) => {
    const selectedProd = products.find((p: any) => p.id === prodId);
    const updated = [...items];
    if (selectedProd) {
      updated[index] = {
        ...updated[index],
        productId: selectedProd.id,
        description: selectedProd.description || selectedProd.name,
        unitPrice: Number(selectedProd.price),
        taxRateValue: Number(selectedProd.taxRateValue || 0),
      };
    } else {
      updated[index] = {
        ...updated[index],
        productId: '',
      };
    }
    setItems(updated);
  };

  const handleItemChange = (index: number, field: keyof QuotationItemInput, val: any) => {
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      [field]: val,
    };
    setItems(updated);
  };

  const addItemRow = () => {
    setItems([
      ...items,
      { productId: '', description: '', quantity: 1, unitPrice: 0, discountAmount: 0, taxRateValue: 0 },
    ]);
  };

  const removeItemRow = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  // Calculations
  const calculateTotals = () => {
    let subTotal = 0;
    let taxTotal = 0;
    let discountTotal = 0;

    for (const item of items) {
      const qty = Number(item.quantity) || 0;
      const rate = Number(item.unitPrice) || 0;
      const disc = Number(item.discountAmount) || 0;
      const taxR = Number(item.taxRateValue) || 0;

      const lineSub = qty * rate - disc;
      const lineTax = (lineSub * taxR) / 100;

      subTotal += qty * rate;
      discountTotal += disc;
      taxTotal += lineTax;
    }

    const grandTotal = Math.max(0, subTotal - discountTotal + taxTotal);

    return {
      subTotal,
      taxTotal,
      discountTotal,
      grandTotal,
    };
  };

  const totals = calculateTotals();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setErrorMsg(null);

    if (!clientId) {
      setErrorMsg('Please select a client');
      return;
    }

    if (items.length === 0) {
      setErrorMsg('Please add at least one line item');
      return;
    }

    try {
      const payload = {
        clientId,
        validUntil,
        status,
        notes: notes || null,
        terms: terms || null,
        items: items.map((it) => ({
          productId: it.productId && it.productId.trim() !== '' ? it.productId : null,
          description: it.description || null,
          quantity: Number(it.quantity) || 1,
          unitPrice: Number(it.unitPrice) || 0,
          discountAmount: Number(it.discountAmount || 0),
          taxRateValue: Number(it.taxRateValue || 0),
        })),
      };

      await updateMutation.mutateAsync({ id, payload });
      navigate('/quotations');
    } catch (err: any) {
      const serverErrors = err.response?.data?.errors;
      if (Array.isArray(serverErrors) && serverErrors.length > 0) {
        setErrorMsg(`Validation failed: ${serverErrors.map((e: any) => `${e.field}: ${e.message}`).join(', ')}`);
      } else {
        setErrorMsg(err.response?.data?.message || 'Failed to update quotation proposal.');
      }
    }
  };

  if (isQuotationLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-3" />
        <p className="text-xs font-medium text-gray-500">Loading quotation proposal details...</p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-100 dark:border-white/10 relative z-10">
        <div className="flex items-center gap-3.5">
          <button
            onClick={() => navigate('/quotations')}
            className="p-2 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 transition cursor-pointer"
            title="Back to Quotations"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight font-heading text-gray-900 dark:text-white">
              Edit Quotation {quotation?.quotationNumber}
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Update items, validity dates, terms, and rate details
            </p>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl text-xs font-semibold bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center gap-2 animate-fade-in">
          <AlertCircle className="h-4.5 w-4.5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Quotation Form */}
      <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
        <div className="p-6 rounded-[22px] border border-gray-200/80 dark:border-white/10 bg-white/70 dark:bg-[#121118]/70 backdrop-blur-xl shadow-sm space-y-6">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white font-heading border-b border-gray-100 dark:border-white/10 pb-2">
            Proposal Details & Recipient
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Client
              </label>
              <div className="relative">
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  required
                  className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#16151a] text-gray-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer font-semibold"
                >
                  {clients.map((c: any) => (
                    <option key={c.id} value={c.id} className="dark:bg-[#16151a] text-gray-900 dark:text-white">
                      {c.name} {c.companyName ? `(${c.companyName})` : ''}
                    </option>
                  ))}
                </select>
                <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#16151a] text-gray-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer font-semibold"
              >
                <option value="DRAFT" className="dark:bg-[#16151a]">DRAFT</option>
                <option value="SENT" className="dark:bg-[#16151a]">SENT</option>
                <option value="ACCEPTED" className="dark:bg-[#16151a]">ACCEPTED</option>
                <option value="REJECTED" className="dark:bg-[#16151a]">REJECTED</option>
                <option value="EXPIRED" className="dark:bg-[#16151a]">EXPIRED</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Valid Until
              </label>
              <input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#16151a] text-gray-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Line Items Table Card */}
        <div className="p-6 rounded-[22px] border border-gray-200/80 dark:border-white/10 bg-white/70 dark:bg-[#121118]/70 backdrop-blur-xl shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/10 pb-3">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white font-heading">
              Line Items & Services
            </h2>
            <button
              type="button"
              onClick={addItemRow}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-600/10 text-blue-600 dark:text-blue-400 font-bold text-xs hover:bg-blue-100 transition cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Line Item</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-white/10 text-gray-400 uppercase tracking-wider font-semibold">
                  <th className="py-2.5 px-3 w-[240px]">Item / Service</th>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3 w-24 text-center">Qty</th>
                  <th className="py-2.5 px-3 w-32 text-center">Rate ({currencySymbol})</th>
                  <th className="py-2.5 px-3 w-28 text-center">Disc ({currencySymbol})</th>
                  <th className="py-2.5 px-3 w-24 text-center">Tax (%)</th>
                  <th className="py-2.5 px-3 text-right w-28">Total</th>
                  <th className="py-2.5 px-3 text-center w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {items.map((item, index) => {
                  const qty = Number(item.quantity) || 0;
                  const rate = Number(item.unitPrice) || 0;
                  const disc = Number(item.discountAmount) || 0;
                  const taxR = Number(item.taxRateValue) || 0;
                  const lineSub = qty * rate - disc;
                  const lineTax = (lineSub * taxR) / 100;
                  const lineTotal = Math.max(0, lineSub + lineTax);

                  return (
                    <tr key={index} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02]">
                      <td className="py-2.5 px-3">
                        <select
                          value={item.productId || ''}
                          onChange={(e) => handleProductSelect(index, e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#16151a] text-gray-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer font-semibold"
                        >
                          <option value="" className="dark:bg-[#16151a] text-gray-400">Custom Line Item...</option>
                          {products.map((p: any) => (
                            <option key={p.id} value={p.id} className="dark:bg-[#16151a] text-gray-900 dark:text-white">
                              {p.name} ({p.sku})
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2.5 px-3">
                        <input
                          type="text"
                          value={item.description || ''}
                          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#16151a] text-gray-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="py-2.5 px-3">
                        <input
                          type="number"
                          min="0.01"
                          step="any"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                          className="w-full px-2.5 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#16151a] text-gray-900 dark:text-white text-xs font-mono font-bold text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="py-2.5 px-3">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(index, 'unitPrice', Number(e.target.value))}
                          className="w-full px-2.5 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#16151a] text-gray-900 dark:text-white text-xs font-mono font-bold text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="py-2.5 px-3">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={item.discountAmount || 0}
                          onChange={(e) => handleItemChange(index, 'discountAmount', Number(e.target.value))}
                          className="w-full px-2.5 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#16151a] text-gray-900 dark:text-white text-xs font-mono font-bold text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="py-2.5 px-3">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="any"
                          value={item.taxRateValue || 0}
                          onChange={(e) => handleItemChange(index, 'taxRateValue', Number(e.target.value))}
                          className="w-full px-2.5 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#16151a] text-gray-900 dark:text-white text-xs font-mono font-bold text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-gray-900 dark:text-white text-sm">
                        {currencySymbol}
                        {lineTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => removeItemRow(index)}
                          disabled={items.length <= 1}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-rose-500 disabled:opacity-30 transition cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notes & Summary Box */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 p-6 rounded-[22px] border border-gray-200/80 dark:border-white/10 bg-white/70 dark:bg-[#121118]/70 backdrop-blur-xl shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white font-heading">
              Proposal Notes & Payment Terms
            </h2>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Notes
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#16151a] text-gray-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Terms
              </label>
              <textarea
                rows={2}
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#16151a] text-gray-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="p-6 rounded-[22px] border border-gray-200/80 dark:border-white/10 bg-white/70 dark:bg-[#121118]/70 backdrop-blur-xl shadow-sm space-y-3 flex flex-col justify-between">
            <div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white font-heading border-b border-gray-100 dark:border-white/10 pb-2 mb-3">
                Updated Totals
              </h2>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal:</span>
                  <span className="font-mono font-bold text-gray-900 dark:text-white">
                    {currencySymbol}
                    {totals.subTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Discount:</span>
                  <span className="font-mono font-bold text-rose-500">
                    -{currencySymbol}
                    {totals.discountTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Tax:</span>
                  <span className="font-mono font-bold text-gray-900 dark:text-white">
                    +{currencySymbol}
                    {totals.taxTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold pt-3 border-t border-gray-100 dark:border-white/10 text-gray-900 dark:text-white">
                  <span>Grand Total:</span>
                  <span className="font-mono text-base text-blue-600 dark:text-blue-400">
                    {currencySymbol}
                    {totals.grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 space-y-2">
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold text-xs shadow-md transition cursor-pointer disabled:opacity-50"
              >
                {updateMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                <span>Update Quotation</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/quotations')}
                className="w-full text-center py-2 text-xs font-semibold text-gray-500 hover:text-gray-800 transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
