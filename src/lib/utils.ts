
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format number in Indian numbering system (K, Lakh, Cr)
 * @param value - The number to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string
 */
export function formatIndianNumber(value: number, decimals: number = 2): string {
  if (value === 0) return '0';
  
  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  
  // 1 Crore = 10,000,000 (1,00,00,000)
  if (absValue >= 10000000) {
    return `${sign}${(absValue / 10000000).toFixed(decimals)} Cr`;
  }
  // 1 Lakh = 100,000 (1,00,000)
  else if (absValue >= 100000) {
    return `${sign}${(absValue / 100000).toFixed(decimals)} L`;
  }
  // 1 Thousand = 1,000
  else if (absValue >= 1000) {
    return `${sign}${(absValue / 1000).toFixed(decimals)} K`;
  }
  
  return `${sign}${absValue.toFixed(decimals)}`;
}

/**
 * Format currency in Indian numbering system with ₹ symbol
 * @param value - The number to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted currency string
 */
export function formatIndianCurrency(value: number, decimals: number = 2): string {
  return `₹${formatIndianNumber(value, decimals)}`;
}

/**
 * Format quantity/count in Indian numbering system
 * @param value - The number to format
 * @param decimals - Number of decimal places (default: 0 for quantities)
 * @returns Formatted string
 */
export function formatIndianQuantity(value: number, decimals: number = 0): string {
  return formatIndianNumber(value, decimals);
}

/**
 * Format currency with full precision for detailed views (no K/L/Cr abbreviation)
 * @param value - The number to format
 * @returns Formatted currency string with Indian locale
 */
export function formatIndianCurrencyFull(value: number): string {
  return `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
