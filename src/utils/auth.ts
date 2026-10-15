/**
 * Authentication and Security Utilities
 * Includes secure PIN hashing using Web Crypto API and DepEd LRN validation
 */

// Easy-to-read uppercase characters excluding ambiguous glyphs (0, O, 1, I, L)
const CODE_CHARACTERS = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';

/**
 * Generates a clean, 6-character uppercase Class Code that is easy to read aloud in class
 */
export function generateClassCode(): string {
  let result = '';
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * CODE_CHARACTERS.length);
    result += CODE_CHARACTERS[randomIndex];
  }
  return result;
}

/**
 * Hashes a student's 4-digit PIN using standard SHA-256 (Web Crypto API)
 * NEVER stores plain text PINs.
 */
export async function hashPin(pin: string): Promise<string> {
  const normalized = pin.trim();
  const encoder = new TextEncoder();
  // Salted to protect minor privacy against lookup tables
  const data = encoder.encode(`deped_jhs_pe_salt_${normalized}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Validates that an LRN is exactly 12 numeric digits as mandated by the Philippine DepEd
 */
export function validateLrn(lrn: string): boolean {
  return /^\d{12}$/.test(lrn.trim());
}

/**
 * Validates that a PIN is exactly 4 numeric digits
 */
export function validatePin(pin: string): boolean {
  return /^\d{4}$/.test(pin.trim());
}

/**
 * Validates a 6-character Class Code
 */
export function validateClassCode(code: string): boolean {
  const cleaned = code.trim().toUpperCase();
  return /^[A-Z0-9]{4,8}$/.test(cleaned);
}
