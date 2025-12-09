/**
 * Utility functions for handling prices in the application.
 * All prices are stored in cents in the database and application state.
 */

/**
 * Formats a price in cents to a human-readable string in reais
 * @param cents - The price in cents (e.g., 100 = R$ 1,00)
 * @returns Formatted price string (e.g., "R$ 1,00")
 */
export function formatPrice(cents: number): string {
  const reais = cents / 100;
  return reais.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Converts a price string in reais to cents
 * @param reais - The price string in reais (e.g., "1,00")
 * @returns The price in cents (e.g., 100)
 */
export function parsePriceToCents(reais: string): number {
  if (!reais) return 0;
  // Remove all non-numeric characters except comma and dot
  const numericString = reais.replace(/[^0-9,.]/g, '');
  // Replace comma with dot and parse as float
  const floatValue = parseFloat(numericString.replace(',', '.'));
  // Convert to cents and round to avoid floating point issues
  return Math.round(floatValue);
}

/**
 * Validates if a price is valid (not negative)
 * @param cents - The price in cents
 * @returns boolean indicating if the price is valid
 */
export function isValidPrice(cents: number | null): boolean {
  return cents !== null && !isNaN(cents) && cents >= 0;
}
