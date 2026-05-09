import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      'login_title': 'Enterprise POS',
      'login_subtitle': 'Retail Sales & Velocity Management',
      'employee_id': 'Employee ID',
      'passcode': 'Passcode',
      'login_button': 'Clock In & Open Terminal',
      'login_error': 'Invalid credentials or connection error',
      'version': 'v2.4.0',
      'copyright': '© 2026 Kaung Thant POS',
      'switch_lang': 'Switch Language',
      'search_placeholder': 'Scan Barcode or Search Items...',
      'cart_title': 'Current Order',
      'total': 'Total',
      'subtotal': 'Subtotal',
      'tax': 'Tax',
      'pay_button': 'Pay & Print',
      'open_shift': 'Open Counter',
      'opening_balance': 'Opening Balance',
      'start_selling': 'Start Selling',
      'customer': 'Customer',
      'items': 'Items',
      'reports_title': 'Analytics & Reports',
      'daily_sales': 'Daily Sales',
      'top_products': 'Top Selling Products',
      'inventory_value': 'Inventory Value',
      'total_transactions': 'Total Transactions',
      'report_date': 'Report Date',
      'export_pdf': 'Export PDF'
    }
  },
  mm: {
    translation: {
      'login_title': 'အရောင်းစနစ် (POS)',
      'login_subtitle': 'လက်လီအရောင်းနှင့် စတော့စီမံခန့်ခွဲမှုစနစ်',
      'employee_id': 'ဝန်ထမ်းအိုင်ဒီ',
      'passcode': 'လျှို့ဝှက်နံပါတ်',
      'login_button': 'စတင်အသုံးပြုမည်',
      'login_error': 'အိုင်ဒီ (သို့) လျှို့ဝှက်နံပါတ် မှားယွင်းနေပါသည်',
      'version': 'ဗားရှင်း ၂.၄.၀',
      'copyright': '© ၂၀၂၆ ကောင်းသန့် POS',
      'switch_lang': 'ဘာသာစကားပြောင်းရန်',
      'search_placeholder': 'ဘာကုဒ်ဖတ်ပါ (သို့) ပစ္စည်းရှာပါ...',
      'cart_title': 'လက်ရှိအရောင်းစာရင်း',
      'total': 'စုစုပေါင်း',
      'subtotal': 'စုစုပေါင်း (အသားတင်)',
      'tax': 'အခွန်',
      'pay_button': 'ငွေချေပြီး ပြေစာထုတ်မည်',
      'open_shift': 'အရောင်းကောင်တာဖွင့်ခြင်း',
      'opening_balance': 'စတင်ငွေသားလက်ကျန်',
      'start_selling': 'အရောင်းစတင်မည်',
      'customer': 'ဝယ်ယူသူ',
      'items': 'ခု',
      'reports_title': 'အစီရင်ခံစာနှင့် စာရင်းဇယားများ',
      'daily_sales': 'နေ့စဉ်အရောင်းစာရင်း',
      'top_products': 'အရောင်းရဆုံး ပစ္စည်းများ',
      'inventory_value': 'လက်ကျန်ပစ္စည်းတန်ဖိုး',
      'total_transactions': 'စုစုပေါင်း အရောင်းအကြိမ်ရေ',
      'report_date': 'အစီရင်ခံစာရက်စွဲ',
      'export_pdf': 'PDF ထုတ်ယူမည်'
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "mm", 
    fallbackLng: "mm",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
