import { API_ORIGIN } from '../api/axios';

export function assetUrl(input) {
  if (!input) return '';
  if (typeof input !== 'string') return '';
  if (input.startsWith('data:')) return input;
  if (input.startsWith('http://') || input.startsWith('https://')) return input;
  if (input.startsWith('/')) return `${API_ORIGIN}${input}`;
  return `${API_ORIGIN}/${input}`;
}

