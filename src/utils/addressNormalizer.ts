// src/utils/addressNormalizer.ts
export function normalizeAddress(address: string): string {
  // Remove special characters and extra spaces
  let normalized = address.toLowerCase()
    .replace(/[^\w\s,-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Standardize common abbreviations
  const abbreviations: { [key: string]: string } = {
    'st': 'street',
    'rd': 'road',
    'ave': 'avenue',
    'blvd': 'boulevard',
    'apt': 'apartment',
  };

  for (const [abbr, full] of Object.entries(abbreviations)) {
    const regex = new RegExp(`\\b${abbr}\\b`, 'g');
    normalized = normalized.replace(regex, full);
  }

  return normalized;
}
