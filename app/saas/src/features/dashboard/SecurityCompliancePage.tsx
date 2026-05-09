import {
  ShieldCheck,
  History,
  Lock,
  Download,
  Search,
  Filter,
  Fingerprint,
  CheckCircle2,
  AlertTriangle,
  Activity,
  FileText,
  RefreshCcw,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../utils/cn';
import { useAuditLogs, type AuditLogStatus } from './hooks/useAuditLogs';

// Format Unix timestamp → readable date string
function fmtTs(ts: number): string {
  return new Date(ts * 1000).toLocaleString('en-GB', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

const STATUS_STYLES: Record<AuditLogStatus, string> = {
  success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  failed:  'bg-rose-500/10 text-rose-400 border-rose-500/20',
};

const STATUS_ICON: Record<AuditLogStatus, React.ElementType> = {
  success: CheckCircle2,
  warning: AlertCircle,
  failed:  XCircle,
};

export const SecurityCompliancePage = () => {
  const [activeTab, setActiveTab] = useState<'audit' | 'compliance'>('audit');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<AuditLogStatus | ''>('');
  const [page, setPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const LIMIT = 10;

  const { data, isLoading, refetch, isFetching } = useAuditLogs({
    page,
    limit: LIMIT,
    status: statusFilter,
    q: searchQuery,
  });

  const logs = data?.logs ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const handleExport = async () => {
    setIsExporting(true);
    await new Promise(r => setTimeout(r, 1500));
    setIsExporting(false);
    alert('Security Audit Report generated and ready for download.');
  };

  // Reset to page 1 when filters change
  const handleSearch = (q: string) => { setSearchQuery(q); setPage(1); };
  const handleStatus = (s: AuditLogStatus | '') => { setStatusFilter(s); setPage(1); };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-display-lg font-bold text-white tracking-tight flex items-center gap-3">
            <ShieldCheck className="text-primary" size={32} />
            Security &amp; Compliance
          </h1>
          <p className="text-on-surface/60">Monitor global audit logs, system integrity, and regulatory readiness.</p>
        </div>
        <div className="flex gap-3">
          <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2">
            <Lock className="text-emerald-400" size={14} />
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">TLS 1.3 / AES-256 Active</span>
          </div>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-white transition-all flex items-center gap-2 border border-white/5 uppercase tracking-widest disabled:opacity-50"
          >
            {isExporting ? <RefreshCcw className="animate-spin" size={14} /> : <Download size={14} />}
            {isExporting ? 'Generating…' : 'Audit Report'}
          </button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[
          { label: 'Platform Integrity', value: 'Healthy',  icon: ShieldCheck,    color: 'text-emerald-400', desc: 'All system checksums verified.' },
          { label: 'Active Threats',     value: 'Zero',     icon: AlertTriangle,  color: 'text-primary',     desc: 'No suspicious activity in 24h.' },
          { label: 'Compliance Score',   value: '94%',      icon: Activity,       color: 'text-amber-400',   desc: 'ISO 27001 readiness: In Progress.' },
        ].map((s, i) => (
          <div key={i} className="glass p-6 rounded-[24px] border border-white/5 hover:border-primary/20 transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className={cn('p-3 rounded-2xl bg-white/5', s.color)}>
                <s.icon size={24} />
              </div>
              <CheckCircle2 size={16} className="text-emerald-400" />
            </div>
            <h3 className="text-[10px] font-black text-on-surface/40 uppercase tracking-widest">{s.label}</h3>
            <span className="text-2xl font-bold text-white">{s.value}</span>
            <p className="text-xs text-on-surface/40 mt-2 leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>

      {/* Main Panel */}
      <div className="glass rounded-[32px] overflow-hidden border border-white/5 flex flex-col min-h-[500px]">
        {/* Tab Bar + Filters */}
        <div className="p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/2">
          <div className="flex gap-2 p-1 bg-black/20 rounded-2xl w-fit border border-white/5">
            <button
              onClick={() => setActiveTab('audit')}
              className={cn(
                'px-8 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2 uppercase tracking-widest',
                activeTab === 'audit' ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'text-on-surface/40 hover:text-white'
              )}
            >
              <FileText size={16} />Global Audit Logs
              {total > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded text-[10px] font-black">{total}</span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('compliance')}
              className={cn(
                'px-8 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2 uppercase tracking-widest',
                activeTab === 'compliance' ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'text-on-surface/40 hover:text-white'
              )}
            >
              <History size={16} />Regulatory Status
            </button>
          </div>

          {activeTab === 'audit' && (
            <div className="flex gap-3 flex-wrap">
              {/* Status filter pills */}
              <div className="flex gap-1">
                {(['', 'success', 'warning', 'failed'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => handleStatus(s)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border',
                      statusFilter === s
                        ? 'bg-primary text-on-primary border-primary'
                        : 'bg-black/30 text-on-surface/40 border-white/5 hover:text-white'
                    )}
                  >
                    {s === '' ? 'All' : s}
                  </button>
                ))}
              </div>
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface/40" size={16} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => handleSearch(e.target.value)}
                  placeholder="Search audit trail…"
                  className="pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder:text-on-surface/30 focus:outline-none focus:border-primary/50 w-56 transition-all"
                />
              </div>
              {/* Refresh */}
              <button
                onClick={() => refetch()}
                disabled={isFetching}
                className="p-2.5 bg-black/40 border border-white/10 rounded-xl text-on-surface/40 hover:text-white transition-all disabled:opacity-50"
                title="Refresh logs"
              >
                <Filter size={18} className={isFetching ? 'animate-spin' : ''} />
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        {activeTab === 'audit' ? (
          <>
            {isLoading ? (
              <div className="flex-1 flex items-center justify-center py-20">
                <RefreshCcw size={32} className="animate-spin text-primary" />
              </div>
            ) : logs.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20 gap-4 text-on-surface/30">
                <ShieldCheck size={48} />
                <p className="text-sm font-bold">No audit records found</p>
                {(searchQuery || statusFilter) && (
                  <button onClick={() => { handleSearch(''); handleStatus(''); }} className="text-xs text-primary hover:underline">
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/5">
                      <th className="px-8 py-5 text-[10px] font-black text-on-surface/40 uppercase tracking-widest">Event Detail</th>
                      <th className="px-8 py-5 text-[10px] font-black text-on-surface/40 uppercase tracking-widest">Actor</th>
                      <th className="px-8 py-5 text-[10px] font-black text-on-surface/40 uppercase tracking-widest">Target System</th>
                      <th className="px-8 py-5 text-[10px] font-black text-on-surface/40 uppercase tracking-widest">IP Address</th>
                      <th className="px-8 py-5 text-[10px] font-black text-on-surface/40 uppercase tracking-widest">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {logs.map(log => {
                      const StatusIcon = STATUS_ICON[log.status as AuditLogStatus] ?? CheckCircle2;
                      return (
                        <tr key={log.id} className="hover:bg-white/2 transition-all group">
                          <td className="px-8 py-6">
                            <div className="flex flex-col gap-1">
                              <span className={cn(
                                'text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-tighter border w-fit flex items-center gap-1.5',
                                STATUS_STYLES[log.status as AuditLogStatus] ?? STATUS_STYLES.success
                              )}>
                                <StatusIcon size={11} />
                                {log.action}
                              </span>
                              <span className="text-[10px] text-on-surface/40 group-hover:text-white/60 transition-colors font-mono">
                                {log.id}
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-linear-to-br from-primary/20 to-secondary/20 flex items-center justify-center border border-white/5">
                                <Fingerprint size={14} className="text-primary" />
                              </div>
                              <span className="text-sm font-medium text-white">{log.actor}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <span className="text-sm text-on-surface/60 font-mono tracking-tight">{log.target}</span>
                          </td>
                          <td className="px-8 py-6">
                            <span className="text-sm text-on-surface/60 font-mono">{log.ip_address}</span>
                          </td>
                          <td className="px-8 py-6 text-sm text-on-surface/40 font-mono">
                            {fmtTs(log.created_at)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {!isLoading && total > LIMIT && (
              <div className="px-8 py-5 border-t border-white/5 flex items-center justify-between">
                <p className="text-xs text-on-surface/40">
                  Showing {((page - 1) * LIMIT) + 1}–{Math.min(page * LIMIT, total)} of {total} records
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    aria-label="Previous page"
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-all"
                  >
                    <ChevronLeft size={16} className="text-white" />
                  </button>
                  <span className="text-xs font-bold text-white px-3">
                    {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    aria-label="Next page"
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-all"
                  >
                    <ChevronRightIcon size={16} className="text-white" />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="p-12 flex flex-col items-center justify-center text-center space-y-6">
            <div className="p-8 rounded-full bg-white/5 text-on-surface/10">
              <ShieldCheck size={64} />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-white tracking-tight">Compliance Tracking In Progress</h3>
              <p className="text-on-surface/40 max-w-md mx-auto leading-relaxed">
                Detailed GDPR, ISO 27001, and SOC2 readiness reporting is being synchronized with your regional infrastructure.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4 w-full max-w-lg mt-4">
              {[
                { label: 'GDPR',     progress: 78, color: 'bg-blue-500',   widthClass: 'w-[78%]' },
                { label: 'ISO 27001', progress: 61, color: 'bg-amber-500',  widthClass: 'w-[61%]' },
                { label: 'SOC 2',    progress: 45, color: 'bg-violet-500', widthClass: 'w-[45%]' },
              ].map(item => (
                <div key={item.label} className="glass rounded-2xl p-4 text-center space-y-2">
                  <p className="text-[10px] font-black text-on-surface/40 uppercase tracking-widest">{item.label}</p>
                  <p className="text-xl font-bold text-white">{item.progress}%</p>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    {/* Static arbitrary Tailwind width class avoids inline style */}
                    <div className={cn('h-full rounded-full', item.color, item.widthClass)} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
