import React from 'react';
import { X, Printer, CheckCircle2, ShoppingBag } from 'lucide-react';
import type { CartItem, Customer } from '../../types';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderData: {
    items: CartItem[];
    subtotal: number;
    discount: number;
    total: number;
    paymentMethod: string;
    customer: Customer | null;
    transactionId: string;
    date: string;
  };
}

const ReceiptModal: React.FC<ReceiptModalProps> = ({ isOpen, onClose, orderData }) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4 print:p-0 print:bg-white">
      <div className="bg-bg-primary w-full max-w-md rounded-3xl shadow-2xl border border-border overflow-hidden animate-slide-up flex flex-col max-h-[90vh] print:shadow-none print:border-none print:max-h-none print:w-full">
        {/* Header - Hidden on Print */}
        <div className="flex justify-between items-center p-6 border-b border-border bg-bg-secondary print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-success/10 text-success rounded-xl">
              <CheckCircle2 size={24} />
            </div>
            <h2 className="text-xl font-black text-text-primary uppercase tracking-wider">Sale Complete</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-bg-tertiary text-text-muted transition-colors"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Receipt Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar print:overflow-visible print:p-4">
          {/* Shop Branding */}
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 bg-primary/10 text-primary rounded-2xl mb-2 print:hidden">
              <ShoppingBag size={32} />
            </div>
            <h1 className="text-2xl font-black text-text-primary uppercase tracking-tighter">KAUNG THANT</h1>
            <p className="text-xs font-bold text-text-muted">Premium POS & Inventory Solution</p>
            <p className="text-[10px] text-text-muted">123 Business Road, Yangon, Myanmar<br/>Tel: +95 9 123 456 789</p>
          </div>

          {/* Order Meta */}
          <div className="border-y border-dashed border-border py-4 space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-text-muted font-bold uppercase">Date:</span>
              <span className="text-text-primary font-black">{orderData.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted font-bold uppercase">Transaction:</span>
              <span className="text-text-primary font-black">#{orderData.transactionId.slice(-8).toUpperCase()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted font-bold uppercase">Customer:</span>
              <span className="text-text-primary font-black">{orderData.customer?.name || 'Guest Customer'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted font-bold uppercase">Payment:</span>
              <span className="text-text-primary font-black uppercase">{orderData.paymentMethod}</span>
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-text-muted font-black uppercase text-[10px]">
                <th className="text-left pb-2">Item</th>
                <th className="text-center pb-2">Qty</th>
                <th className="text-right pb-2">Price</th>
                <th className="text-right pb-2">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {orderData.items.map((item, idx) => (
                <tr key={idx} className="py-2">
                  <td className="py-3 font-bold text-text-primary">{item.name}</td>
                  <td className="py-3 text-center font-bold">{item.quantity}</td>
                  <td className="py-3 text-right font-medium">{item.price.toLocaleString()}</td>
                  <td className="py-3 text-right font-black text-text-primary">{item.total.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="border-t border-border pt-4 space-y-2">
            <div className="flex justify-between text-xs font-bold text-text-muted">
              <span className="uppercase">Subtotal:</span>
              <span>{orderData.subtotal.toLocaleString()} MMK</span>
            </div>
            {orderData.discount > 0 && (
              <div className="flex justify-between text-xs font-bold text-error">
                <span className="uppercase">Discount:</span>
                <span>-{orderData.discount.toLocaleString()} MMK</span>
              </div>
            )}
            <div className="flex justify-between items-end pt-2">
              <span className="text-base font-black text-text-primary uppercase tracking-wider">Grand Total:</span>
              <span className="text-xl font-black text-primary">{orderData.total.toLocaleString()} MMK</span>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center space-y-2 pt-8">
            <p className="text-xs font-black text-text-primary italic">Thank You for Shopping!</p>
            <div className="flex justify-center">
              {/* Simple Barcode Placeholder for Receipt UI */}
              <div className="h-10 w-48 bg-bg-tertiary flex items-center justify-center border border-border rounded opacity-50">
                <span className="text-[10px] font-mono tracking-[0.5em] text-text-muted">{orderData.transactionId.slice(-12).toUpperCase()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions - Hidden on Print */}
        <div className="p-6 border-t border-border bg-bg-secondary flex gap-4 print:hidden">
          <button 
            className="btn btn-secondary flex-1 py-4 font-black uppercase tracking-widest text-xs"
            onClick={onClose}
          >
            Close
          </button>
          <button 
            className="btn btn-primary flex-1 py-4 font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20"
            onClick={handlePrint}
          >
            <Printer size={20} />
            Print Receipt
          </button>
        </div>
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .fixed, .fixed * {
            visibility: visible;
          }
          .fixed {
            position: absolute;
            left: 0;
            top: 0;
            width: 80mm; /* Standard Thermal Receipt Width */
            margin: 0 auto;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ReceiptModal;
