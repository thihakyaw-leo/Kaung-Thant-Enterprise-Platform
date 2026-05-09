import { 
  LifeBuoy, 
  MessageSquare, 
  Mail, 
  Phone, 
  Send, 
  FileText, 
  ExternalLink,
  CheckCircle2,
  ChevronRight,
  BookOpen,
  HelpCircle
} from 'lucide-react';
import { cn } from '../../utils/cn';
export function SupportPage() {

  const supportChannels = [
    { 
      title: 'Technical Support', 
      desc: 'Deep technical issues or system bugs', 
      icon: MessageSquare, 
      color: 'text-primary', 
      bg: 'bg-primary/10',
      action: 'Open Live Chat',
      link: '#'
    },
    { 
      title: 'Billing Inquiry', 
      desc: 'Questions about payments or invoices', 
      icon: Mail, 
      color: 'text-secondary', 
      bg: 'bg-secondary/10',
      action: 'Email Support',
      link: 'mailto:billing@kinetic.io'
    },
    { 
      title: 'Telegram Support', 
      desc: 'Real-time updates and community chat', 
      icon: Send, 
      color: 'text-blue-400', 
      bg: 'bg-blue-400/10',
      action: 'Join Telegram',
      link: 'https://t.me/kinetic_support'
    },
    { 
      title: 'Emergency Hot-line', 
      desc: 'Critical production downtime issues', 
      icon: Phone, 
      color: 'text-error', 
      bg: 'bg-error/10',
      action: 'Call Now',
      link: 'tel:+95912345678'
    },
  ];

  const faqs = [
    { q: 'How do I add a new POS terminal?', a: 'Navigate to Tenants > Manage and select the specific tenant. From there, you can issue new terminal credentials.' },
    { q: 'Can I custom my invoice prefix?', a: 'Yes, you can configure this in Settings > Invoice Settings > Generation Rules.' },
    { q: 'What payment methods are supported?', a: 'We currently support KBZ Pay, Wave Money, and Direct Bank Transfer for SaaS billing.' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <LifeBuoy className="text-primary" size={32} />
          Customer Support
        </h1>
        <p className="text-on-surface/60 mt-1">We're here to help you scale your business operations efficiently.</p>
      </div>

      {/* Support Channels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {supportChannels.map((channel, i) => (
          <div key={i} className="glass rounded-3xl p-6 border border-white/5 group hover:border-primary/20 transition-all hover:scale-[1.02]">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", channel.bg, channel.color)}>
              <channel.icon size={24} />
            </div>
            <h3 className="font-bold text-white text-lg">{channel.title}</h3>
            <p className="text-sm text-on-surface/50 mt-2 min-h-[40px]">{channel.desc}</p>
            <a 
              href={channel.link}
              className="mt-6 flex items-center justify-between group/btn text-xs font-black uppercase tracking-widest text-primary"
            >
              {channel.action}
              <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
            </a>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Help Center Section */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-surface-container-low/40 backdrop-blur-md border border-outline-variant/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
            
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-2xl">
                  <HelpCircle className="text-primary w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Frequently Asked Questions</h2>
              </div>

              <div className="space-y-4">
                {faqs.map((faq, i) => (
                  <div key={i} className="p-5 bg-surface-container-high/20 rounded-2xl border border-outline-variant/10 hover:bg-surface-container-high/30 transition-all group">
                    <div className="flex items-start gap-4">
                      <div className="mt-1 p-1 bg-white/5 rounded-md text-primary">
                        <BookOpen size={14} />
                      </div>
                      <div className="space-y-2">
                        <div className="font-bold text-white group-hover:text-primary transition-colors">{faq.q}</div>
                        <div className="text-sm text-on-surface/60 leading-relaxed">{faq.a}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-on-surface/70 font-bold transition-all flex items-center justify-center gap-2">
                Browse All Documentation
                <ExternalLink size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Info Section */}
        <div className="space-y-6">
          {/* Platform Status */}
          <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-400" />
                <span className="text-sm font-bold text-white">System Status</span>
              </div>
              <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest">All Systems Operational</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-on-surface/40">API & Backend</span>
                <span className="text-emerald-400 font-bold">100%</span>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="w-full h-full bg-emerald-500"></div>
              </div>
            </div>
          </div>

          {/* Ticket Summary Placeholder */}
          <div className="bg-surface-container-low/40 border border-outline-variant/10 rounded-3xl p-6 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary/10 rounded-xl">
                <FileText className="text-secondary w-5 h-5" />
              </div>
              <h3 className="font-bold text-white">Recent Tickets</h3>
            </div>
            
            <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
              <div className="p-4 bg-white/5 rounded-full text-on-surface/20">
                <MessageSquare size={32} />
              </div>
              <div>
                <div className="text-sm font-bold text-white">No Active Tickets</div>
                <p className="text-xs text-on-surface/40 mt-1">You haven't submitted any support requests yet.</p>
              </div>
              <button className="px-6 py-2 bg-primary text-on-primary rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20">
                Create New Ticket
              </button>
            </div>
          </div>

          {/* Contact Banner */}
          <div className="p-6 bg-linear-to-br from-primary/20 to-secondary/20 border border-white/5 rounded-3xl text-center space-y-2">
            <div className="text-sm font-bold text-white">Need Enterprise Support?</div>
            <p className="text-xs text-on-surface/60">Get a dedicated account manager for your business.</p>
            <div className="pt-2">
              <button className="text-xs font-black text-primary uppercase underline decoration-2 underline-offset-4">Upgrade to Enterprise</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
