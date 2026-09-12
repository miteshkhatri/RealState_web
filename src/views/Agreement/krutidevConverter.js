// Utility to escape regex special characters
const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
};

// Complete Kruti Dev -> Unicode Hindi Converter
export const krutiToUnicode = (input) => {
  if (!input) return "";

  let text = input;

  // --- Mapping array ---
  const map = [
    ["v", "ि"], ["vk", "ा"], ["b", "ु"], ["bZ", "ू"], ["m", "े"], ["Å", "ै"], ["‚", "ं"], ["~", "़"], ["w", "ृ"], ["`", "्"],
    ["d", "क"], ["[k", "ख"], ["x", "ग"], ["?k", "घ"], ["p", "च"], ["N", "छ"], ["t", "ज"], [">", "झ"],
    ["V", "ट"], ["B", "ठ"], ["M", "ड"], ["<", "ढ"], ["y", "त"], ["C", "थ"], ["c", "द"], ["Hk", "ध"],
    ["q", "न"], ["r", "प"], ["n", "फ"], ["u", "ब"], ["i", "भ"], ["Q", "म"], ["l", "य"], ["j", "र"],
    ["k", "ल"], ["g", "व"], ["e", "स"], [";", "श"], ["R", "ह"],
    ["0", "०"], ["1", "१"], ["2", "२"], ["3", "३"], ["4", "४"], ["5", "५"], ["6", "६"], ["7", "७"], ["8", "८"], ["9", "९"],
    [".k", "।"], [".", "।"], ["/k", "्य"], ["/", "्"], ["@", "अ"], ["#", "ह"],
    ["Z", "र्"], ["t+", "ज्ञ"], ["kZ", "ळ"], ["x+", "क्ष"], ["h+", "त्र"], ["n+", "श्र"],
    ["Â", "ॉ"], ["Ê", "ी"], ["Ç", "िं"], ["É", "र्िं"], ["±", "Zं"], ["Æ", "र्f"]
  ];

  // --- Apply mapping safely ---
  for (const [key, val] of map) {
    const regex = new RegExp(escapeRegExp(key), "g");
    text = text.replace(regex, val);
  }

  // --- Fix 'ि' position before consonants ---
  text = text.replace(/([क-ह]़?)(ि)/g, "ि$1");

  // --- Fix reph for 'Z' properly ---
  let rephIndex = text.indexOf("Z");
  const matras = "ािीुूृेैोौंःँॅ";
  while (rephIndex >= 0) {
    let left = rephIndex - 1;
    while (left >= 0 && matras.includes(text[left])) left--;
    const replacement = "र्" + text.slice(left + 1, rephIndex);
    text = text.slice(0, left + 1) + replacement + text.slice(rephIndex + 1);
    rephIndex = text.indexOf("Z", left + replacement.length);
  }

  // --- Optional: fix simple halant ligatures ---
  text = text.replace(/([क-ह])्([क-ह])/g, "$1$2");

  return text;
};
