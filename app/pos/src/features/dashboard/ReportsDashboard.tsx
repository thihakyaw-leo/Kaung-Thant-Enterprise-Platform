import { useTranslation } from 'react-i18next';
import { TrendingUp, Package, DollarSign, FileText, Download } from 'lucide-react';
import { LanguageSwitcher } from '../../components/shared/LanguageSwitcher';

export const ReportsDashboard = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <FileText className="text-primary" /> {t('reports_title')}
        </h1>
        <div className="flex gap-3">
          <LanguageSwitcher />
          <button 
            title={t('export_pdf')}
            className="bg-white/10 text-white px-4 py-2 rounded-xl border border-white/5 flex items-center gap-2 hover:bg-white/20 transition-all"
          >
            <Download size={18} /> {t('export_pdf')}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass p-6 rounded-3xl border border-white/10 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-emerald-500/20 rounded-2xl text-emerald-400">
              <DollarSign />
            </div>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-lg">+12.5%</span>
          </div>
          <h3 className="text-on-surface/40 text-sm font-medium">{t('daily_sales')}</h3>
          <div className="text-2xl font-bold text-white mt-1">1,250,000 <span className="text-xs">MMK</span></div>
        </div>

        <div className="glass p-6 rounded-3xl border border-white/10">
          <div className="p-3 bg-primary/20 rounded-2xl text-primary w-fit mb-4">
            <TrendingUp />
          </div>
          <h3 className="text-on-surface/40 text-sm font-medium">{t('total_transactions')}</h3>
          <div className="text-2xl font-bold text-white mt-1">48 <span className="text-xs font-normal">Sales</span></div>
        </div>

        <div className="glass p-6 rounded-3xl border border-white/10">
          <div className="p-3 bg-blue-500/20 rounded-2xl text-blue-400 w-fit mb-4">
            <Package />
          </div>
          <h3 className="text-on-surface/40 text-sm font-medium">{t('inventory_value')}</h3>
          <div className="text-2xl font-bold text-white mt-1">45,800,000 <span className="text-xs">MMK</span></div>
        </div>
      </div>

      {/* Top Products Table */}
      <div className="glass rounded-3xl border border-white/10 overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <h3 className="font-bold text-white">{t('top_products')}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white/5 text-[10px] uppercase tracking-widest text-on-surface/40 border-b border-white/5">
              <tr>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Sold Qty</th>
                <th className="px-6 py-4 text-right">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <tr className="hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-4 font-bold text-white">Premium Coffee Beans</td>
                <td className="px-6 py-4 text-on-surface/60">124 Packs</td>
                <td className="px-6 py-4 text-right text-primary font-bold">1,550,000 MMK</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
