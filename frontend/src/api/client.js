import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

export function parseCurrency(value) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export function parseNumber(value) {
  return new Intl.NumberFormat('es-CO').format(Number(value || 0));
}

export function formatDate(value) {
  const date = new Date(value);
  const adjusted = new Date(date.getTime() - 5 * 60 * 60 * 1000);

  if (Number.isNaN(adjusted.getTime())) {
    return String(value || '');
  }

  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(adjusted);
}
