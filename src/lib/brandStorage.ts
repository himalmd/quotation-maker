import type { BrandSettings } from '../types';

export const CURRENCIES = ['USD', 'AUD', 'EUR', 'GBP', 'CAD', 'SGD', 'AED', 'INR'];

export const DEFAULT_BRAND: BrandSettings = {
  companyName: 'My Company',
  phone: '+1 000 000 0000',
  address: '123 Main St, City, Country',
  website: 'https://example.com',
  primaryColor: '#3498db',
  darkColor: '#2c3e50',
  currency: 'USD',
  logoDataUrl: '',
  signDataUrl: '',
};

export function loadBrand(): BrandSettings {
  try {
    const saved = localStorage.getItem('quotation_brand');
    return saved ? { ...DEFAULT_BRAND, ...JSON.parse(saved) } : DEFAULT_BRAND;
  } catch {
    return DEFAULT_BRAND;
  }
}
