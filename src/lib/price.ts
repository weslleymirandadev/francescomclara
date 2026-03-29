
export function formatPrice(cents: number): string {
  const reais = cents / 100;
  return reais.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function parsePriceToCents(reais: string): number {
  if (!reais) return 0;
  const numericString = reais.replace(/[^0-9,.]/g, '');
  const floatValue = parseFloat(numericString.replace(',', '.'));
  return Math.round(floatValue);
}

export function isValidPrice(cents: number | null): boolean {
  return cents !== null && !isNaN(cents) && cents >= 0;
}
