import React, { useState, useEffect, useRef } from 'react';
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
  ChevronDown,
  UserCheck,
  Package,
  Wrench,
  FileText,
  Sparkles,
} from 'lucide-react';

const BILLING_SOFTWARE_SUGGESTIONS = [
  { id: '', name: 'Software Subscription (Annual)', price: 120, taxRateValue: 18, type: 'PRODUCT' },
  { id: '', name: 'Billing & POS Software Setup', price: 250, taxRateValue: 18, type: 'SERVICE' },
];

export const EditQuotationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: workspace } = useWorkspaceData();
  const { data: quotationResponse, isLoading: isQuotationLoading } = useQuotationQuery(id);
  const { data: clientsData } = useClientsQuery({ limit: 100 });
  const { data: productsData } = useProductsQuery({ limit: 100 });

  const quotation = quotationResponse?.data;
  const clients = (clientsData?.clients || []) as any[];
  const dbProducts = (productsData?.items || []) as any[];

  const products = dbProducts.length > 0 ? dbProducts : BILLING_SOFTWARE_SUGGESTIONS;

  const updateMutation = useUpdateQuotationMutation();

  // Form State
  const [clientId, setClientId] = useState('');
  const [clientInputText, setClientInputText] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [status, setStatus] = useState<string>('DRAFT');
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Client Combobox Toggle State
  const [isClientOpen, setIsClientOpen] = useState(false);
  const clientRef = useRef<HTMLDivElement>(null);

  // Product Combobox Toggle State
  const [activeProductRow, setActiveProductRow] = useState<number | null>(null);
  const productRef = useRef<HTMLTableCellElement>(null);

  // Dynamic Item Lines
  const [items, setItems] = useState<QuotationItemInput[]>([]);

  useEffect(() => {
    if (quotation) {
      setClientId(quotation.clientId);
      if (quotation.client?.name) {
        setClientInputText(quotation.client.name);
      }
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

  const currencySymbol = workspace?.currency === 'USD' ? '$' : '₹';

  // Click-away listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (clientRef.current && !clientRef.current.contains(event.target as Node)) {
        setIsClientOpen(false);
      }
      if (productRef.current && !productRef.current.contains(event.target as Node)) {
        setActiveProductRow(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProductSelect = (index: number, selectedProd: any | null) => {
    const updated = [...items];
    if (selectedProd) {
      updated[index] = {
        ...updated[index],
        productId: selectedProd.id || '',
        description: selectedProd.name,
        unitPrice: Number(selectedProd.price || 0),
        taxRateValue: Number(selectedProd.taxRateValue || 0),
      };
    } else {
      updated[index] = {
        ...updated[index],
        productId: '',
      };
    }
    setItems(updated);
    setActiveProductRow(null);
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

  const filteredClients = clients.filter(
    (c) =>
      c.name?.toLowerCase().includes(clientInputText.toLowerCase()) ||
      c.companyName?.toLowerCase().includes(clientInputText.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setErrorMsg(null);

    let finalClientId = clientId;
    if (!finalClientId && clientInputText) {
      const matched = clients.find((c) => c.name.toLowerCase() === clientInputText.trim().toLowerCase());
      if (matched) finalClientId = matched.id;
    }

    if (!finalClientId) {
      setErrorMsg('Please select or enter a client');
      return;
    }

    if (items.length === 0) {
      setErrorMsg('Please add at least one line item');
      return;
    }

    try {
      const payload = {
        clientId: finalClientId,
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
        <p className="text-xs font-medium text-gray-500">Loading proposal details...</p>
      </div>
    );
  }

  return (
    <div className="relative space-y-8 max-w-6xl mx-auto pb-20">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-gray-200/60 dark:border-white/10 relative z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/quotations')}
            className="p-2.5 rounded-2xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-[#161420]/80 hover:bg-gray-100 dark:hover:bg-white/10 transition shadow-xs cursor-pointer group"
            title="Back to Quotations"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300 group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading text-gray-900 dark:text-white">
              Edit Quotation {quotation?.quotationNumber}
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Update items, validity dates, terms, and rate details
            </p>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl text-xs font-semibold bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center gap-2.5 animate-fade-in shadow-sm">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
        <div className="p-6 sm:p-7 rounded-[26px] border border-gray-200/80 dark:border-white/10 bg-white/80 dark:bg-[#13111c]/80 backdrop-blur-2xl shadow-sm space-y-6 relative z-30">
          <div className="flex items-center gap-2.5 border-b border-gray-100 dark:border-white/10 pb-3.5">
            <div className="h-7 w-7 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
              <UserCheck className="h-4 w-4" />
            </div>
            <h2 className="text-sm font-bold text-gray-900 dark:text-white font-heading uppercase tracking-wider">
              Proposal Details & Recipient
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            <div className="space-y-2 relative" ref={clientRef}>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Select / Enter Client
              </label>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Type client name..."
                  value={clientInputText}
                  onChange={(e) => {
                    setClientInputText(e.target.value);
                    setClientId('');
                    setIsClientOpen(true);
                  }}
                  onFocus={() => setIsClientOpen(true)}
                  className="w-full pl-4 pr-10 py-3 rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-[#181624] text-gray-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/80 transition shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setIsClientOpen(!isClientOpen)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1 cursor-pointer"
                >
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isClientOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {isClientOpen && (
                <div className="absolute left-0 right-0 top-[108%] z-50 p-2 rounded-2xl border border-gray-200/90 dark:border-white/15 bg-white dark:bg-[#181624] shadow-2xl space-y-1 max-h-52 overflow-y-auto backdrop-blur-xl">
                  {filteredClients.length === 0 ? (
                    <div className="p-3 text-center text-xs text-gray-400 italic">Type custom client name...</div>
                  ) : (
                    filteredClients.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setClientId(c.id);
                          setClientInputText(c.name);
                          setIsClientOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition cursor-pointer text-left ${
                          clientId === c.id
                            ? 'bg-blue-50 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 font-bold'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'
                        }`}
                      >
                        <div className="truncate font-semibold">{c.name}</div>
                        {clientId === c.id && <UserCheck className="h-4 w-4 text-blue-500 shrink-0" />}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-[#181624] text-gray-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/80 transition cursor-pointer"
              >
                <option value="DRAFT">DRAFT</option>
                <option value="SENT">SENT</option>
                <option value="ACCEPTED">ACCEPTED</option>
                <option value="REJECTED">REJECTED</option>
                <option value="EXPIRED">EXPIRED</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Valid Until
              </label>
              <input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-[#181624] text-gray-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/80 transition shadow-xs"
              />
            </div>
          </div>
        </div>

        {/* Dynamic Line Items */}
        <div className="p-6 sm:p-7 rounded-[26px] border border-gray-200/80 dark:border-white/10 bg-white/80 dark:bg-[#13111c]/80 backdrop-blur-2xl shadow-sm space-y-5 relative z-20">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/10 pb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                <Package className="h-4 w-4" />
              </div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white font-heading uppercase tracking-wider">
                Line Items & Services
              </h2>
            </div>

            <button
              type="button"
              onClick={addItemRow}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition cursor-pointer active:scale-98"
            >
              <Plus className="h-4 w-4" />
              <span>Add Line Item</span>
            </button>
          </div>

          <div className="overflow-visible">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-200/60 dark:border-white/10 text-gray-400 uppercase tracking-wider font-bold text-[11px]">
                  <th className="py-3 px-3 w-[240px]">Item / Service</th>
                  <th className="py-3 px-3">Description</th>
                  <th className="py-3 px-3 w-24 text-center">Qty</th>
                  <th className="py-3 px-3 w-28 text-center">Rate ({currencySymbol})</th>
                  <th className="py-3 px-3 w-28 text-center">Disc ({currencySymbol})</th>
                  <th className="py-3 px-3 w-24 text-center">Tax (%)</th>
                  <th className="py-3 px-3 text-right w-28">Total</th>
                  <th className="py-3 px-3 text-center w-10"></th>
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

                  const filteredSuggestions = products.filter((p) =>
                    p.name?.toLowerCase().includes((item.description || '').toLowerCase())
                  );

                  return (
                    <tr key={index} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-3 relative" ref={activeProductRow === index ? productRef : null}>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Type item or select..."
                            value={item.description || ''}
                            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                            onFocus={() => setActiveProductRow(index)}
                            className="w-full pl-3.5 pr-8 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-[#181624] text-gray-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/80 transition"
                          />
                          <button
                            type="button"
                            onClick={() => setActiveProductRow(activeProductRow === index ? null : index)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1 cursor-pointer"
                          >
                            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${activeProductRow === index ? 'rotate-180' : ''}`} />
                          </button>
                        </div>

                        {activeProductRow === index && (
                          <div className="absolute left-3 right-3 top-[108%] z-50 p-2 rounded-2xl border border-gray-200/90 dark:border-white/15 bg-white dark:bg-[#181624] shadow-2xl space-y-1 max-h-52 overflow-y-auto backdrop-blur-xl">
                            <button
                              type="button"
                              onClick={() => handleProductSelect(index, null)}
                              className="w-full text-left px-3 py-2 rounded-xl text-xs italic text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer"
                            >
                              Custom Line Item (as typed)
                            </button>

                            {filteredSuggestions.length === 0 ? (
                              <div className="p-3 text-center text-xs text-gray-400 italic">No matching suggestions</div>
                            ) : (
                              filteredSuggestions.map((p, pIdx) => (
                                <button
                                  key={p.id || pIdx}
                                  type="button"
                                  onClick={() => handleProductSelect(index, p)}
                                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition cursor-pointer text-left ${
                                    item.productId === p.id && p.id !== ''
                                      ? 'bg-blue-50 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 font-bold'
                                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'
                                  }`}
                                >
                                  <div className="truncate flex items-center gap-2">
                                    {p.type === 'SERVICE' ? (
                                      <Wrench className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                                    ) : (
                                      <Package className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                                    )}
                                    <span className="font-semibold">{p.name}</span>
                                  </div>
                                  <span className="text-xs font-mono font-bold text-gray-400 shrink-0 ml-3">
                                    {currencySymbol}{p.price}
                                  </span>
                                </button>
                              ))
                            )}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        <input
                          type="text"
                          value={item.description || ''}
                          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                          placeholder="Scope details or specification..."
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-[#181624] text-gray-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/80 transition"
                        />
                      </td>

                      <td className="py-3 px-3">
                        <input
                          type="number"
                          min="0.01"
                          step="any"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                          className="w-full px-2.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-[#181624] text-gray-900 dark:text-white text-xs font-mono font-bold text-center focus:outline-none focus:ring-2 focus:ring-blue-500/80 transition"
                        />
                      </td>

                      <td className="py-3 px-3">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(index, 'unitPrice', Number(e.target.value))}
                          className="w-full px-2.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-[#181624] text-gray-900 dark:text-white text-xs font-mono font-bold text-center focus:outline-none focus:ring-2 focus:ring-blue-500/80 transition"
                        />
                      </td>

                      <td className="py-3 px-3">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={item.discountAmount || 0}
                          onChange={(e) => handleItemChange(index, 'discountAmount', Number(e.target.value))}
                          className="w-full px-2.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-[#181624] text-gray-900 dark:text-white text-xs font-mono font-bold text-center focus:outline-none focus:ring-2 focus:ring-blue-500/80 transition"
                        />
                      </td>

                      <td className="py-3 px-3">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="any"
                          value={item.taxRateValue || 0}
                          onChange={(e) => handleItemChange(index, 'taxRateValue', Number(e.target.value))}
                          className="w-full px-2.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-[#181624] text-gray-900 dark:text-white text-xs font-mono font-bold text-center focus:outline-none focus:ring-2 focus:ring-blue-500/80 transition"
                        />
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-extrabold text-gray-900 dark:text-white text-sm">
                        {currencySymbol}
                        {lineTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => removeItemRow(index)}
                          disabled={items.length <= 1}
                          className="p-2 rounded-xl text-gray-400 hover:text-rose-500 hover:bg-rose-500/10 disabled:opacity-20 transition cursor-pointer"
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

        {/* Bottom Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          <div className="md:col-span-2 p-6 sm:p-7 rounded-[26px] border border-gray-200/80 dark:border-white/10 bg-white/80 dark:bg-[#13111c]/80 backdrop-blur-2xl shadow-sm space-y-5">
            <div className="flex items-center gap-2.5 border-b border-gray-100 dark:border-white/10 pb-3.5">
              <div className="h-7 w-7 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                <FileText className="h-4 w-4" />
              </div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white font-heading uppercase tracking-wider">
                Proposal Notes & Terms
              </h2>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Notes
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-[#181624] text-gray-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/80 transition"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Terms
              </label>
              <textarea
                rows={3}
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-[#181624] text-gray-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/80 transition"
              />
            </div>
          </div>

          <div className="p-6 sm:p-7 rounded-[26px] border border-gray-200/80 dark:border-white/10 bg-gradient-to-b from-white/90 to-white/70 dark:from-[#161424]/90 dark:to-[#12101a]/90 backdrop-blur-2xl shadow-lg space-y-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 border-b border-gray-100 dark:border-white/10 pb-3 mb-4">
                <Sparkles className="h-4 w-4 text-blue-500" />
                <h2 className="text-sm font-bold text-gray-900 dark:text-white font-heading uppercase tracking-wider">
                  Updated Totals
                </h2>
              </div>

              <div className="space-y-2.5 text-xs pt-1">
                <div className="flex justify-between text-gray-500 dark:text-gray-400">
                  <span>Subtotal:</span>
                  <span className="font-mono font-bold text-gray-900 dark:text-white">
                    {currencySymbol}
                    {totals.subTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-gray-500 dark:text-gray-400">
                  <span>Discount:</span>
                  <span className="font-mono font-bold text-rose-500">
                    -{currencySymbol}
                    {totals.discountTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-gray-500 dark:text-gray-400">
                  <span>Tax:</span>
                  <span className="font-mono font-bold text-gray-900 dark:text-white">
                    +{currencySymbol}
                    {totals.taxTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-white/10 mt-3">
                  <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                      Grand Total
                    </span>
                    <span className="font-mono text-lg font-black text-blue-600 dark:text-blue-400">
                      {currencySymbol}
                      {totals.grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 space-y-2.5">
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-blue-500/25 transition-all cursor-pointer active:scale-98 disabled:opacity-50"
              >
                {updateMutation.isPending ? (
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                ) : (
                  <Save className="h-4.5 w-4.5" />
                )}
                <span>Update Quotation</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/quotations')}
                className="w-full text-center py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition cursor-pointer"
              >
                Cancel & Return
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
