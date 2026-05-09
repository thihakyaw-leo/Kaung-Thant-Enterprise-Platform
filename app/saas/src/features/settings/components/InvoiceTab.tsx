import {
  FileText,
  Building2,
  Hash,
  Percent,
  Landmark,
  MessageSquare,
  Eye,
} from 'lucide-react';
import type { SettingsTabProps } from './SettingsTabProps';

// ─── Helpers ────────────────────────────────────────────────────────────────

type DateFormatKey = 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD' | 'DD-MMM-YYYY';
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function formatDate(date: Date, fmt: string): string {
  const dd   = String(date.getDate()).padStart(2, '0');
  const mm   = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = String(date.getFullYear());
  switch (fmt as DateFormatKey) {
    case 'DD/MM/YYYY':   return `${dd}/${mm}/${yyyy}`;
    case 'MM/DD/YYYY':   return `${mm}/${dd}/${yyyy}`;
    case 'YYYY-MM-DD':   return `${yyyy}-${mm}-${dd}`;
    case 'DD-MMM-YYYY':  return `${dd}-${MONTHS[date.getMonth()]}-${yyyy}`;
    default:             return `${dd}/${mm}/${yyyy}`;
  }
}

function buildInvoiceNo(prefix: string, seq: string, padding: number): string {
  const d    = new Date();
  const yy   = String(d.getFullYear()).slice(-2);
  const mo   = String(d.getMonth() + 1).padStart(2, '0');
  const seqP = seq.padStart(padding, '0');
  return `${prefix}${yy}${mo}${seqP}`;
}

// ─── Sub-section layout helper ───────────────────────────────────────────────

interface SectionProps {
  icon: React.ElementType;
  title: string;
  colorClass: string;
  children: React.ReactNode;
}

function Section({ icon: Icon, title, colorClass, children }: SectionProps) {
  return (
    <div className="space-y-5 pt-8 border-t border-outline-variant/10 first:pt-0 first:border-t-0">
      <h3 className="text-base font-bold text-white flex items-center gap-2">
        <Icon size={18} className={colorClass} />
        {title}
      </h3>
      {children}
    </div>
  );
}

// ─── Field helpers ───────────────────────────────────────────────────────────

const INPUT_CLS = 'w-full px-4 py-2.5 bg-surface-container-high/30 border border-outline-variant/10 rounded-xl text-white outline-none focus:border-primary/50 transition-all text-sm';
const SELECT_CLS = INPUT_CLS;
const TEXTAREA_CLS = `${INPUT_CLS} resize-none`;
const LABEL_CLS = 'block text-xs font-bold text-on-surface/50 uppercase tracking-widest mb-1.5';

// ─── Main Component ──────────────────────────────────────────────────────────

export default function InvoiceTab({ formData, setFormData }: SettingsTabProps) {
  const set = (key: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setFormData(prev => ({ ...prev, [key]: e.target.value }));

  // Computed preview values
  const today       = new Date();
  const dueDate     = new Date(today);
  dueDate.setDate(dueDate.getDate() + Number(formData.payment_due_days || 30));
  const fmt         = formData.invoice_date_format || 'DD/MM/YYYY';
  const invoiceNo   = buildInvoiceNo(
    formData.invoice_prefix  || 'INV-',
    formData.next_sequence   || '1001',
    Number(formData.sequence_padding || 4),
  );
  const subTotal  = 150000;
  const taxRate   = Number(formData.tax_rate || 0);
  const taxAmt    = Math.round(subTotal * taxRate / 100);
  const total     = subTotal + taxAmt;
  const currency  = formData.default_currency || 'MMK';

  return (
    <div className="space-y-0 animate-in slide-in-from-bottom duration-500">

      {/* ── 1. Company / Issuer Details ─────────────────────────────── */}
      <Section icon={Building2} title="Company / Issuer Details" colorClass="text-primary">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label htmlFor="inv_platform_name" className={LABEL_CLS}>Business Name</label>
            <input
              type="text" id="inv_platform_name" title="Business Name"
              value={formData.platform_name || ''}
              onChange={set('platform_name')}
              className={INPUT_CLS}
              placeholder="Kaung Thant Enterprise"
            />
          </div>
          <div>
            <label htmlFor="inv_support_email" className={LABEL_CLS}>Business Email</label>
            <input
              type="email" id="inv_support_email" title="Business Email"
              value={formData.support_email || ''}
              onChange={set('support_email')}
              className={INPUT_CLS}
              placeholder="billing@company.com"
            />
          </div>
          <div>
            <label htmlFor="inv_phone" className={LABEL_CLS}>Business Phone</label>
            <input
              type="text" id="inv_phone" title="Business Phone"
              value={formData.platform_phone || ''}
              onChange={set('platform_phone')}
              className={INPUT_CLS}
              placeholder="+95 9 123 456 789"
            />
          </div>
          <div>
            <label htmlFor="inv_tax_number" className={LABEL_CLS}>Tax / Business Reg. Number</label>
            <input
              type="text" id="inv_tax_number" title="Tax / Business Registration Number"
              value={formData.tax_number || ''}
              onChange={set('tax_number')}
              className={`${INPUT_CLS} font-mono`}
              placeholder="123456789"
            />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="inv_address" className={LABEL_CLS}>Business Address</label>
            <textarea
              id="inv_address" title="Business Address"
              rows={3}
              value={formData.platform_address || ''}
              onChange={set('platform_address')}
              className={TEXTAREA_CLS}
              placeholder="No. 1, Pyay Road, Yangon, Myanmar"
            />
          </div>
        </div>
      </Section>

      {/* ── 2. Invoice Numbering ─────────────────────────────────────── */}
      <Section icon={Hash} title="Invoice Numbering" colorClass="text-secondary">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          <div>
            <label htmlFor="inv_prefix" className={LABEL_CLS}>Prefix</label>
            <input
              type="text" id="inv_prefix" title="Invoice Number Prefix"
              value={formData.invoice_prefix || 'INV-'}
              onChange={set('invoice_prefix')}
              className={`${INPUT_CLS} font-mono`}
              placeholder="INV-"
            />
          </div>
          <div>
            <label htmlFor="next_seq" className={LABEL_CLS}>Next Sequence</label>
            <input
              type="number" id="next_seq" title="Next Sequence Number" min={1}
              value={formData.next_sequence || '1001'}
              onChange={set('next_sequence')}
              className={`${INPUT_CLS} font-mono`}
            />
          </div>
          <div>
            <label htmlFor="seq_pad" className={LABEL_CLS}>Zero Padding</label>
            <input
              type="number" id="seq_pad" title="Number of zero-padded digits" min={1} max={10}
              value={formData.sequence_padding || '4'}
              onChange={set('sequence_padding')}
              className={INPUT_CLS}
            />
          </div>
          <div>
            <label htmlFor="inv_date_fmt" className={LABEL_CLS}>Date Format</label>
            <select
              id="inv_date_fmt" title="Invoice Date Format"
              value={formData.invoice_date_format || 'DD/MM/YYYY'}
              onChange={set('invoice_date_format')}
              className={`${SELECT_CLS} cursor-pointer`}
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              <option value="DD-MMM-YYYY">DD-MMM-YYYY</option>
            </select>
          </div>
        </div>
        <div className="px-4 py-3 bg-black/20 rounded-xl border border-white/5 flex items-center gap-3">
          <FileText size={14} className="text-primary shrink-0" />
          <p className="text-xs text-on-surface/50">
            Preview:&nbsp;
            <span className="font-mono font-bold text-white">{invoiceNo}</span>
            &nbsp;·&nbsp;
            Date: <span className="font-mono text-white">{formatDate(today, fmt)}</span>
          </p>
        </div>
      </Section>

      {/* ── 3. Tax & Currency ────────────────────────────────────────── */}
      <Section icon={Percent} title="Tax & Currency" colorClass="text-amber-400">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label htmlFor="inv_tax_label" className={LABEL_CLS}>Tax Label</label>
            <input
              type="text" id="inv_tax_label" title="Tax label shown on invoice"
              value={formData.tax_label || 'Tax'}
              onChange={set('tax_label')}
              className={INPUT_CLS}
              placeholder="VAT / GST / Tax"
            />
          </div>
          <div>
            <label htmlFor="inv_tax_rate" className={LABEL_CLS}>Tax Rate (%)</label>
            <div className="relative">
              <input
                type="number" id="inv_tax_rate" title="Tax rate percentage" min={0} max={100} step={0.5}
                value={formData.tax_rate || '0'}
                onChange={set('tax_rate')}
                className={`${INPUT_CLS} pr-8`}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface/40 text-sm font-bold">%</span>
            </div>
          </div>
          <div>
            <label htmlFor="inv_currency" className={LABEL_CLS}>Currency</label>
            <select
              id="inv_currency" title="Default currency"
              value={formData.default_currency || 'MMK'}
              onChange={set('default_currency')}
              className={`${SELECT_CLS} cursor-pointer`}
            >
              <option value="MMK">MMK — Myanmar Kyat</option>
              <option value="USD">USD — US Dollar</option>
              <option value="SGD">SGD — Singapore Dollar</option>
              <option value="THB">THB — Thai Baht</option>
            </select>
          </div>
        </div>
      </Section>

      {/* ── 4. Payment Terms & Bank Details ──────────────────────────── */}
      <Section icon={Landmark} title="Payment Terms & Bank Details" colorClass="text-emerald-400">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label htmlFor="inv_due_days" className={LABEL_CLS}>Payment Due (days)</label>
            <select
              id="inv_due_days" title="Number of days before invoice is due"
              value={formData.payment_due_days || '30'}
              onChange={set('payment_due_days')}
              className={`${SELECT_CLS} cursor-pointer`}
            >
              <option value="7">Net 7 — Due in 7 days</option>
              <option value="15">Net 15 — Due in 15 days</option>
              <option value="30">Net 30 — Due in 30 days</option>
              <option value="45">Net 45 — Due in 45 days</option>
              <option value="60">Net 60 — Due in 60 days</option>
            </select>
          </div>
          <div>
            <label htmlFor="inv_bank_name" className={LABEL_CLS}>Bank Name</label>
            <input
              type="text" id="inv_bank_name" title="Bank name for payment"
              value={formData.bank_name || ''}
              onChange={set('bank_name')}
              className={INPUT_CLS}
              placeholder="KBZ Bank / AYA Bank"
            />
          </div>
          <div>
            <label htmlFor="inv_bank_holder" className={LABEL_CLS}>Account Holder</label>
            <input
              type="text" id="inv_bank_holder" title="Bank account holder name"
              value={formData.bank_holder || ''}
              onChange={set('bank_holder')}
              className={INPUT_CLS}
              placeholder="Kaung Thant Co., Ltd."
            />
          </div>
          <div className="md:col-span-3">
            <label htmlFor="inv_bank_account" className={LABEL_CLS}>Bank Account Number</label>
            <input
              type="text" id="inv_bank_account" title="Bank account number"
              value={formData.bank_account || ''}
              onChange={set('bank_account')}
              className={`${INPUT_CLS} font-mono`}
              placeholder="09-1234-5678-901"
            />
          </div>
        </div>
      </Section>

      {/* ── 5. Invoice Footer / Notes ─────────────────────────────────── */}
      <Section icon={MessageSquare} title="Default Invoice Notes" colorClass="text-violet-400">
        <div>
          <label htmlFor="inv_notes" className={LABEL_CLS}>Footer Note (shown on every invoice)</label>
          <textarea
            id="inv_notes" title="Default invoice footer notes"
            rows={3}
            value={formData.invoice_notes || ''}
            onChange={set('invoice_notes')}
            className={TEXTAREA_CLS}
            placeholder="Thank you for your business. Payment is due within the stated terms."
          />
          <p className="text-[10px] text-on-surface/30 mt-1.5">Max 300 characters. Supports plain text only.</p>
        </div>
      </Section>

      {/* ── 6. Live Invoice Preview ───────────────────────────────────── */}
      <Section icon={Eye} title="Invoice Preview" colorClass="text-cyan-400">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-xl mx-auto border border-black/5">
          {/* Header */}
          <div className="bg-gray-900 px-8 py-6 flex items-start justify-between">
            <div>
              <p className="text-2xl font-black text-white tracking-tight">{formData.platform_name || 'Your Business'}</p>
              <p className="text-gray-400 text-xs mt-1 leading-relaxed max-w-[200px]">{formData.platform_address || 'Business Address'}</p>
              {formData.platform_phone && <p className="text-gray-400 text-xs">{formData.platform_phone}</p>}
              {formData.tax_number && <p className="text-gray-500 text-[10px] mt-1 font-mono">Reg: {formData.tax_number}</p>}
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Invoice</p>
              <p className="text-sm font-black text-white font-mono mt-1">{invoiceNo}</p>
              <p className="text-[10px] text-gray-400 mt-2">
                Issued: <span className="text-white">{formatDate(today, fmt)}</span>
              </p>
              <p className="text-[10px] text-gray-400">
                Due: <span className="text-amber-400 font-bold">{formatDate(dueDate, fmt)}</span>
              </p>
            </div>
          </div>

          {/* Sample Line Items */}
          <div className="px-8 py-5 border-b border-gray-100">
            <div className="grid grid-cols-12 text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">
              <span className="col-span-6">Description</span>
              <span className="col-span-2 text-center">Qty</span>
              <span className="col-span-2 text-right">Unit Price</span>
              <span className="col-span-2 text-right">Amount</span>
            </div>
            <div className="grid grid-cols-12 text-xs text-gray-800 py-2 border-t border-gray-100">
              <span className="col-span-6 font-medium">Retail Core Plan · Monthly</span>
              <span className="col-span-2 text-center text-gray-500">1</span>
              <span className="col-span-2 text-right font-mono">150,000</span>
              <span className="col-span-2 text-right font-mono font-bold">150,000</span>
            </div>
          </div>

          {/* Totals */}
          <div className="px-8 py-5 bg-gray-50">
            <div className="flex justify-end">
              <div className="w-48 space-y-2">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-mono">{subTotal.toLocaleString()} {currency}</span>
                </div>
                {taxRate > 0 && (
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>{formData.tax_label || 'Tax'} ({taxRate}%)</span>
                    <span className="font-mono">{taxAmt.toLocaleString()} {currency}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-black text-gray-900 pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span className="font-mono">{total.toLocaleString()} {currency}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bank & Notes */}
          {(formData.bank_name || formData.bank_account || formData.invoice_notes) && (
            <div className="px-8 py-5 border-t border-gray-100 space-y-3">
              {formData.bank_name && (
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Payment Details</p>
                  <p className="text-xs text-gray-700">{formData.bank_name} · {formData.bank_holder}</p>
                  <p className="text-xs font-mono text-gray-700">{formData.bank_account}</p>
                </div>
              )}
              {formData.invoice_notes && (
                <p className="text-[10px] text-gray-400 italic leading-relaxed border-t border-gray-100 pt-3">
                  {formData.invoice_notes}
                </p>
              )}
            </div>
          )}
        </div>
      </Section>

    </div>
  );
}
