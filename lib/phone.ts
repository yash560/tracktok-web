const COUNTRY_CODES: Record<string, string> = {
  '1': '+1',
  '44': '+44',
  '91': '+91',
  '61': '+61',
  '64': '+64',
  '27': '+27',
  '86': '+86',
  '81': '+81',
  '33': '+33',
  '49': '+49',
  '39': '+39',
  '34': '+34',
  '55': '+55',
  '7': '+7',
  '82': '+82',
  '65': '+65',
  '60': '+60',
  '66': '+66',
  '62': '+62',
  '63': '+63',
  '971': '+971',
  '966': '+966',
  '974': '+974',
  '968': '+968',
  '973': '+973',
  '965': '+965',
  '353': '+353',
  '852': '+852',
};

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

export function parsePhoneInput(raw: string): { countryCode: string; localNumber: string } {
  const trimmed = raw.trim();
  const digits = trimmed.replace(/\D/g, '');

  if (trimmed.startsWith('+')) {
    const withoutPlus = trimmed.slice(1).replace(/\D/g, '');

    for (const len of [3, 2, 1]) {
      const prefix = withoutPlus.slice(0, len);
      if (COUNTRY_CODES[prefix]) {
        const local = withoutPlus.slice(len);
        if (local.length >= 7) {
          return { countryCode: COUNTRY_CODES[prefix], localNumber: local };
        }
      }
    }
  }

  if (digits.length > 10) {
    for (const len of [3, 2, 1]) {
      const prefix = digits.slice(0, len);
      if (COUNTRY_CODES[prefix]) {
        const local = digits.slice(len);
        if (local.length >= 7) {
          return { countryCode: COUNTRY_CODES[prefix], localNumber: local };
        }
      }
    }
  }

  return { countryCode: '+91', localNumber: digits.length > 10 ? digits.slice(-10) : digits };
}
