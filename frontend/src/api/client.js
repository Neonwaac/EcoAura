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
  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}
