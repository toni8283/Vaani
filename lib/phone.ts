import { isValidPhoneNumber, parsePhoneNumberFromString } from "libphonenumber-js";

/**
 * Validates whether a phone number is a valid international E.164 phone number.
 */
export function validatePhoneNumber(phone: string): {
  isValid: boolean;
  e164?: string;
  error?: string;
} {
  const trimmed = phone.trim();
  if (!trimmed) {
    return {
      isValid: false,
      error: "Phone number is required.",
    };
  }

  // Must start with +
  const formattedInput = trimmed.startsWith("+") ? trimmed : `+${trimmed}`;

  try {
    const parsed = parsePhoneNumberFromString(formattedInput);
    if (parsed && parsed.isValid()) {
      return {
        isValid: true,
        e164: parsed.number,
      };
    }
  } catch {
    // parse failed
  }

  return {
    isValid: false,
    error: "That number doesn't look quite right. Try including the country code, like +91.",
  };
}

/**
 * Masks a phone number for UI display (e.g. +91 98•••• ••210)
 */
export function maskPhoneNumber(phone?: string | null): string {
  if (!phone) return "";
  const clean = phone.trim();
  if (clean.length <= 6) return clean;

  const prefix = clean.slice(0, 5); // e.g. +91 9
  const suffix = clean.slice(-3);  // e.g. 210
  return `${prefix}•••• ••${suffix}`;
}
