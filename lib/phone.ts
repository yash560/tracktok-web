export function normalizePhone(phone: string | undefined | null): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  return digits.length > 10 ? digits.slice(-10) : digits;
}

export function phonesMatch(a: string | undefined | null, b: string | undefined | null): boolean {
  const na = normalizePhone(a);
  const nb = normalizePhone(b);
  return na !== '' && nb !== '' && na === nb;
}
