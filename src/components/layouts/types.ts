import type { QuotationData, BrandSettings } from '../../types';

export interface LayoutProps {
  data: QuotationData;
  brand: BrandSettings;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  discountAmount: number;
  taxRate: number;
  taxAmount: number;
  subTotal: number;
  total: number;
  cur: string;
  terms: string;
}
