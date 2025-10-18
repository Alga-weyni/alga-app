/**
 * Format amount in Ethiopian Birr (ETB) currency
 * @param amount - Numeric amount to format
 * @returns Formatted currency string with ETB symbol
 */
export function formatETB(amount: number): string {
  return new Intl.NumberFormat('en-ET', {
    style: 'currency',
    currency: 'ETB',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format amount in ETB with custom decimal places
 * @param amount - Numeric amount to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted currency string
 */
export function formatETBCustom(amount: number, decimals: number = 2): string {
  return new Intl.NumberFormat('en-ET', {
    style: 'currency',
    currency: 'ETB',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

/**
 * Format amount as plain number with ETB suffix (no symbol)
 * Example: 1,234.56 ETB
 */
export function formatETBPlain(amount: number): string {
  return `${new Intl.NumberFormat('en-ET', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)} ETB`;
}
