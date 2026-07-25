export class PDFGeneratorService {
  generateInvoiceHTML(invoice: any, settings: any, theme: string = 'Modern Glass'): string {
    const isModern = theme.includes('Modern') || theme === 'Modern Glass';
    const isClassic = theme.includes('Classic') || theme === 'Classic Corporate';

    const items = invoice.items || [];
    const client = invoice.client || {};
    const companyName = settings?.companyName || 'Alex Enterprise Group';
    const currency = invoice.currency || settings?.currency || 'INR';
    const currencySymbol = currency === 'INR' ? '₹' : '$';
    const number = invoice.invoiceNumber || invoice.number || 'INV-0001';

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice #${number}</title>
  <style>
    @page { size: A4; margin: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 40px;
      color: ${isClassic ? '#111827' : '#1e293b'};
      background: #ffffff;
      -webkit-print-color-adjust: exact;
    }
    .header-banner {
      ${
        isModern
          ? 'background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); color: #ffffff; padding: 32px; border-radius: 16px; margin-bottom: 32px;'
          : isClassic
          ? 'border-b: 2px solid #111827; padding-bottom: 20px; margin-bottom: 24px;'
          : 'border-b: 1px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 24px;'
      }
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .company-title {
      font-size: 24px;
      font-weight: 800;
      margin: 0;
      color: ${isModern ? '#ffffff' : '#0f172a'};
    }
    .invoice-badge {
      text-align: right;
    }
    .doc-title {
      font-size: 28px;
      font-weight: 900;
      margin: 0;
      color: ${isModern ? '#ffffff' : '#2563eb'};
      text-transform: uppercase;
      letter-spacing: -0.5px;
    }
    .meta-table {
      font-size: 13px;
      margin-top: 8px;
    }
    .meta-table td { padding: 2px 0; }
    .billing-grid {
      display: flex;
      justify-content: space-between;
      gap: 32px;
      margin-bottom: 32px;
      font-size: 13px;
    }
    .bill-card {
      flex: 1;
      padding: 16px;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      background: #f8fafc;
    }
    .card-label {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      color: #64748b;
      margin-bottom: 6px;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 32px;
      font-size: 13px;
    }
    .items-table th {
      background: ${isModern ? '#0f172a' : '#f1f5f9'};
      color: ${isModern ? '#ffffff' : '#334155'};
      font-weight: 700;
      text-transform: uppercase;
      font-size: 11px;
      padding: 12px 16px;
      text-align: left;
    }
    .items-table td {
      padding: 14px 16px;
      border-bottom: 1px solid #e2e8f0;
    }
    .summary-container {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 32px;
    }
    .summary-table {
      width: 280px;
      font-size: 13px;
    }
    .summary-table td {
      padding: 6px 12px;
    }
    .total-row {
      font-size: 16px;
      font-weight: 800;
      background: #eff6ff;
      color: #1e40af;
    }
    .footer-block {
      margin-top: 40px;
      border-top: 1px dashed #cbd5e1;
      padding-top: 20px;
      font-size: 12px;
      color: #64748b;
    }
  </style>
</head>
<body>

  <div class="header-banner">
    <div>
      <h1 class="company-title">${companyName}</h1>
      <p style="margin: 4px 0 0 0; font-size: 12px; opacity: 0.9;">
        ${settings?.address || '101 Tech Avenue, Cyber City'}<br/>
        ${settings?.city || 'New Delhi'}, ${settings?.country || 'India'} | Phone: ${settings?.phone || '+91 9876543210'}
      </p>
      ${settings?.gstNumber ? `<p style="margin: 4px 0 0 0; font-size: 11px;">GSTIN: <strong>${settings.gstNumber}</strong></p>` : ''}
    </div>
    <div class="invoice-badge">
      <h2 class="doc-title">INVOICE</h2>
      <table class="meta-table">
        <tr><td style="color: ${isModern ? '#93c5fd' : '#64748b'}; font-weight: bold;">Number:</td><td style="font-weight: bold; text-align: right;">${number}</td></tr>
        <tr><td style="color: ${isModern ? '#93c5fd' : '#64748b'};">Issue Date:</td><td style="text-align: right;">${new Date(invoice.issueDate || invoice.createdAt || Date.now()).toLocaleDateString()}</td></tr>
        <tr><td style="color: ${isModern ? '#93c5fd' : '#64748b'};">Due Date:</td><td style="text-align: right;">${new Date(invoice.dueDate || Date.now()).toLocaleDateString()}</td></tr>
      </table>
    </div>
  </div>

  <div class="billing-grid">
    <div class="bill-card">
      <div class="card-label">Billed To</div>
      <strong style="font-size: 15px; color: #0f172a;">${client.name || 'Valued Customer'}</strong><br/>
      ${client.email || ''}<br/>
      ${client.phone || ''}<br/>
      ${client.billingAddress || client.address || 'Standard Billing Address'}
    </div>
    <div class="bill-card" style="text-align: right;">
      <div class="card-label">Payment Status</div>
      Status: <strong style="color: ${invoice.status === 'PAID' ? '#16a34a' : '#d97706'}; text-transform: uppercase;">${invoice.status || 'UNPAID'}</strong><br/>
      Balance Due: <strong>${currencySymbol}${Number(invoice.balanceDue || invoice.grandTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
    </div>
  </div>

  <table class="items-table">
    <thead>
      <tr>
        <th>Item / Service</th>
        <th style="text-align: center;">Qty</th>
        <th style="text-align: right;">Rate</th>
        <th style="text-align: right;">Tax (%)</th>
        <th style="text-align: right;">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${items
        .map(
          (item: any) => `
        <tr>
          <td>
            <strong>${item.description || item.name || 'Product Item'}</strong>
          </td>
          <td style="text-align: center;">${Number(item.quantity || 1)}</td>
          <td style="text-align: right;">${currencySymbol}${Number(item.unitPrice || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          <td style="text-align: right;">${Number(item.taxRateValue || 18)}%</td>
          <td style="text-align: right; font-weight: bold;">${currencySymbol}${Number(item.totalAmount || item.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        </tr>
      `
        )
        .join('')}
    </tbody>
  </table>

  <div class="summary-container">
    <table class="summary-table">
      <tr>
        <td>Subtotal:</td>
        <td style="text-align: right; font-weight: bold;">${currencySymbol}${Number(invoice.subTotal || invoice.grandTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
      </tr>
      <tr>
        <td>Tax Amount:</td>
        <td style="text-align: right;">${currencySymbol}${Number(invoice.taxTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
      </tr>
      <tr class="total-row">
        <td>Total Due:</td>
        <td style="text-align: right;">${currencySymbol}${Number(invoice.grandTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
      </tr>
    </table>
  </div>

  <div class="footer-block">
    <strong style="color: #334155;">Terms & Conditions:</strong><br/>
    ${invoice.terms || settings?.terms || 'Thank you for your business. Please remit payment within the due date.'}
  </div>

</body>
</html>
    `;
  }

  generateQuotationHTML(quotation: any, settings: any, theme: string = 'Modern Glass'): string {
    const items = quotation.items || [];
    const client = quotation.client || {};
    const companyName = settings?.companyName || 'Alex Enterprise Group';
    const currency = quotation.currency || settings?.currency || 'INR';
    const currencySymbol = currency === 'INR' ? '₹' : '$';
    const number = quotation.quotationNumber || quotation.number || 'QT-0001';

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Quotation #${number}</title>
  <style>
    @page { size: A4; margin: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 40px;
      color: #1e293b;
      background: #ffffff;
    }
    .header-banner {
      background: linear-gradient(135deg, #0f172a 0%, #334155 100%);
      color: #ffffff;
      padding: 32px;
      border-radius: 16px;
      margin-bottom: 32px;
      display: flex;
      justify-content: space-between;
    }
    .doc-title { font-size: 28px; font-weight: 900; margin: 0; color: #38bdf8; text-transform: uppercase; }
    .bill-card { padding: 16px; border-radius: 12px; border: 1px solid #e2e8f0; background: #f8fafc; margin-bottom: 32px; }
    .items-table { width: 100%; border-collapse: collapse; margin-bottom: 32px; font-size: 13px; }
    .items-table th { background: #0f172a; color: #ffffff; padding: 12px 16px; text-align: left; }
    .items-table td { padding: 14px 16px; border-bottom: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="header-banner">
    <div>
      <h1 style="margin: 0; font-size: 24px;">${companyName}</h1>
      <p style="margin: 4px 0 0 0; font-size: 12px; opacity: 0.9;">${settings?.address || 'Tech Park, Cyber City'}</p>
    </div>
    <div style="text-align: right;">
      <h2 class="doc-title">QUOTATION</h2>
      <p style="margin: 4px 0 0 0; font-size: 13px; font-weight: bold;">#${number}</p>
      <p style="margin: 2px 0 0 0; font-size: 12px; color: #94a3b8;">Valid Until: ${new Date(quotation.validUntil || Date.now()).toLocaleDateString()}</p>
    </div>
  </div>

  <div class="bill-card">
    <div style="font-size: 11px; font-weight: bold; text-transform: uppercase; color: #64748b; margin-bottom: 4px;">Prepared For</div>
    <strong style="font-size: 15px; color: #0f172a;">${client.name || 'Valued Client'}</strong><br/>
    ${client.email || ''} | ${client.phone || ''}
  </div>

  <table class="items-table">
    <thead>
      <tr>
        <th>Description</th>
        <th style="text-align: center;">Qty</th>
        <th style="text-align: right;">Unit Price</th>
        <th style="text-align: right;">Total</th>
      </tr>
    </thead>
    <tbody>
      ${items
        .map(
          (item: any) => `
        <tr>
          <td><strong>${item.description || item.name}</strong></td>
          <td style="text-align: center;">${Number(item.quantity || 1)}</td>
          <td style="text-align: right;">${currencySymbol}${Number(item.unitPrice || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          <td style="text-align: right; font-weight: bold;">${currencySymbol}${Number(item.totalAmount || item.total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        </tr>
      `
        )
        .join('')}
    </tbody>
  </table>

  <div style="text-align: right; font-size: 16px; font-weight: 800; color: #0284c7; padding: 16px; background: #f0f9ff; border-radius: 12px;">
    Total Estimated Quote: ${currencySymbol}${Number(quotation.grandTotal || quotation.total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
  </div>
</body>
</html>
    `;
  }
}
