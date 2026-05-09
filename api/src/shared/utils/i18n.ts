type Language = 'en' | 'my';

const translations: Record<Language, Record<string, string>> = {
  en: {
    'sale.success': 'Sale completed successfully',
    'sale.failed': 'Sale processing failed',
    'stock.low': 'Stock level is low',
    'stock.empty': 'Out of stock',
    'receipt.title': 'Tax Invoice / Receipt',
    'receipt.total': 'Total Amount',
    'receipt.change': 'Change',
    'auth.unauthorized': 'Unauthorized access',
    'general.error': 'Something went wrong',
    'nav.dashboard': 'Dashboard',
    'nav.sales': 'Sales',
    'nav.inventory': 'Inventory',
    'nav.reports': 'Reports',
    'nav.settings': 'Settings',
    'pos.terminal': 'Terminal',
    'pos.checkout': 'Checkout',
    'pos.clear': 'Clear Cart'
  },
  my: {
    'sale.success': 'အရောင်းအဝယ် အောင်မြင်ပါသည်',
    'sale.failed': 'အရောင်းအဝယ် လုပ်ဆောင်မှု မအောင်မြင်ပါ',
    'stock.low': 'လက်ကျန်ပစ္စည်း နည်းနေပါသည်',
    'stock.empty': 'ပစ္စည်းပြတ်နေပါသည်',
    'receipt.title': 'အခွန်ပြေစာ / အရောင်းပြေစာ',
    'receipt.total': 'စုစုပေါင်း ကျသင့်ငွေ',
    'receipt.change': 'ပြန်အမ်းငွေ',
    'auth.unauthorized': 'ဝင်ရောက်ခွင့် မရှိပါ',
    'general.error': 'တစ်စုံတစ်ရာ မှားယွင်းနေပါသည်',
    'nav.dashboard': 'ပင်မစာမျက်နှာ',
    'nav.sales': 'အရောင်းပိုင်း',
    'nav.inventory': 'ပစ္စည်းစာရင်း',
    'nav.reports': 'အစီရင်ခံစာများ',
    'nav.settings': 'ဆက်တင်များ',
    'pos.terminal': 'အရောင်းကောင်တာ',
    'pos.checkout': 'ငွေချေမည်',
    'pos.clear': 'စာရင်းဖျက်မည်'
  }
};

export function t(key: string, lang: Language = 'my'): string {
  return translations[lang][key] || translations['en'][key] || key;
}
