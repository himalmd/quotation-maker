export type LayoutId = 'classic' | 'modern' | 'bold' | 'minimal';

  id: string;
  description: string;
  details: string[];
  price: number;
  quantity: number;
}

export interface QuotationData {
  clientName: string;
  quotationNumber: string;
  date: string;
  items: QuotationItem[];
  deliveryTime: string;
}

export interface BrandSettings {
  companyName: string;
  phone: string;
  address: string;
  website: string;
  primaryColor: string;
  darkColor: string;
  currency: string;
  logoDataUrl: string;
  signDataUrl: string;
}
