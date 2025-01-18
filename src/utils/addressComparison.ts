// src/utils/addressComparison.ts
export function compareStreetNames(addr1: string, addr2: string): number {
  return calculateSimilarity(extractStreet(addr1), extractStreet(addr2));
}

export function comparePostalCodes(addr1: string, addr2: string): number {
  const postal1 = extractPostalCode(addr1);
  const postal2 = extractPostalCode(addr2);
  return postal1 === postal2 ? 1 : 0;
}

export function compareCities(addr1: string, addr2: string): number {
  return calculateSimilarity(extractCity(addr1), extractCity(addr2));
}

function extractStreet(address: string): string {
  const parts = address.split(',')[0];
  return parts.trim();
}

function extractPostalCode(address: string): string {
  const matches = address.match(/\b\d{5}(?:-\d{4})?\b/);
  return matches ? matches[0] : '';
}

function extractCity(address: string): string {
  const parts = address.split(',');
  return parts.length > 1 ? parts[1].trim() : '';
}

function calculateSimilarity(str1: string, str2: string): number {
  if (!str1 || !str2) return 0;
  
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  const longerLength = longer.length;
  if (longerLength === 0) return 1.0;

  const editDistance = levenshteinDistance(longer, shorter);
  return (longerLength - editDistance) / longerLength;
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => 
    Array(str1.length + 1).fill(null)
  );

  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const substitutionCost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + substitutionCost
      );
    }
  }

  return matrix[str2.length][str1.length];
}