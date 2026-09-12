/**
 * Krutidev to Unicode converter
 * Krutidev is a legacy ASCII-based Hindi font encoding.
 * This converter maps Krutidev characters to proper Unicode Devanagari.
 */

// The mapping table: order matters — longer sequences must come before shorter ones.
const KRUTI_TO_UNI_MAP = [
  // --- Matras and special forms ---
  ["f=k",  "ति"],  // f + consonant cluster
  ["f=",   "ति"],
  ["+k",   "ैं"],
  ["ksa",  "ों"],
  ["ksa",  "ों"],
  ["Ùk",   "त्त"],
  ["ä",    "क्त"],
  ["œ",    "र्"],
  ["+",    "ै"],
  ["ks",   "ो"],
  ["ksa",  "ों"],
  ["ds",   "के"],

  // --- Vowels (standalone) ---
  ["vkS",  "औ"],
  ["vks",  "ओ"],
  ["vk",   "आ"],
  ["vS",   "ऐ"],
  [",s",   "ऐ"],
  ["bZ",   "ई"],
  ["Å",    "ऊ"],
  ["_",    "ऋ"],
  ["v%",   "अः"],
  ["va",   "अं"],
  ["v",    "अ"],
  [",",    "ए"],
  ["b",    "इ"],
  ["m",    "उ"],

  // --- Consonants with halant (conjuncts) ---
  ["[k",   "ख"],
  ["Øk",   "क्रा"],
  ["Ø",    "क्र"],
  ["x",    "ग"],
  ["?k",   "घ"],
  ["Pk",   "च"],
  ["N",    "छ"],
  [">k",   "झ"],
  ["Jh",   "श्री"],
  ["/k",   "ध"],
  ["Hk",   "भ"],
  ["\"k",  "श"],
  ["'k",   "श"],
  ["\"k",  "ष"],
  ["'",    "ष"],
  ["Fk",   "थ"],
  ["V",    "ट"],
  ["B",    "ठ"],
  ["M",    "ड"],
  ["<",    "ढ"],

  // --- Single consonants ---
  ["d",    "क"],
  ["p",    "च"],
  ["t",    "ज"],
  [".",    "ण"],
  ["r",    "त"],
  ["u",    "न"],
  ["i",    "प"],
  ["Q",    "फ"],
  ["c",    "ब"],
  ["e",    "म"],
  ["j",    "र"],
  ["y",    "ल"],
  ["o",    "व"],
  ["l",    "स"],
  ["g",    "ह"],
  ["k",    "ा"],

  // --- Matras ---
  ["k",    "ा"],  // aa matra
  ["h",    "ी"],  // ee matra (long i)
  ["q",    "ु"],  // u matra
  ["w",    "ू"],  // uu matra
  ["s",    "े"],  // e matra
  ["Z",    "र्"], // ra halant
  ["Z",    "र्"],
  [";",    "य"],
  ["a",    "ं"],  // anusvara
  ["%",    "ः"],  // visarga
  ["~",    "्"],  // halant
  ["|",    "।"],  // danda
  ["$",    "़"],  // nukta

  // --- Digits (Devanagari) ---
  ["0",    "०"],
  ["1",    "१"],
  ["2",    "२"],
  ["3",    "३"],
  ["4",    "४"],
  ["5",    "५"],
  ["6",    "६"],
  ["7",    "७"],
  ["8",    "८"],
  ["9",    "९"],

  // --- Punctuation ---
  [",",    ","],
  ["&",    "&"],
];

/**
 * Detects if a string is likely Krutidev encoded.
 * Krutidev text often contains characters like 'f', 'j', ';', 'dk', 'kk' etc.
 * but is NOT valid Unicode Devanagari (no chars in \u0900-\u097F range predominantly).
 */
export function isKrutidev(str) {
  if (!str || typeof str !== "string") return false;
  // If the string already has Devanagari unicode, it's not Krutidev
  const hasDevanagari = /[\u0900-\u097F]/.test(str);
  if (hasDevanagari) return false;
  // Krutidev strings often contain these typical ASCII combos
  const krutiPatterns = /[fdjleoiuvgprtncbmVBMNZ;k\$_]/.test(str);
  return krutiPatterns && str.length > 1;
}

/**
 * Converts a Krutidev encoded string to Unicode Devanagari.
 */
export function krutiDevToUnicode(str) {
  if (!str || typeof str !== "string") return str;
  if (!isKrutidev(str)) return str; // already Unicode or empty

  let result = str;

  // Handle 'f' (short i matra ि) — it appears BEFORE the consonant in Krutidev
  // but must go AFTER in Unicode. We move it after the next character.
  result = result.replace(/f(.)/g, "$1\u093f"); // ि

  // Apply all other mappings (longer ones first to avoid partial matches)
  for (const [kruti, uni] of KRUTI_TO_UNI_MAP) {
    result = result.split(kruti).join(uni);
  }

  return result;
}

/**
 * Converts any string — if it's Krutidev, converts it; otherwise returns as-is.
 */
export function toHindi(str) {
  if (!str) return str || "";
  return krutiDevToUnicode(String(str));
}
