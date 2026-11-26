/**
 * Pocket Health Worker — Text Normalization for Safety Matching
 *
 * Shared, deterministic text cleanup used by the crisis and red-flag detectors so that
 * real-world phone input matches our keyword dictionaries reliably. Phones frequently
 * insert smart/curly apostrophes and varied dashes, and users add inconsistent spacing —
 * none of which should ever cause a danger sign to be missed.
 *
 * This only normalizes punctuation and whitespace and lowercases the text. It does NOT
 * translate language or alter meaning, so the conservative safety guarantees are preserved.
 */

export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    // Smart/curly apostrophes and backtick → straight apostrophe
    .replace(/[‘’ʼ`]/g, "'")
    // Various unicode dashes → simple hyphen
    .replace(/[‐-―]/g, "-")
    // Collapse any run of whitespace to a single space
    .replace(/\s+/g, " ")
    .trim();
}
