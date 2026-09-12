const fs = require('fs');
const fontData = fs.readFileSync('src/assets/NotoSansDevanagari.ttf');
const base64 = fontData.toString('base64');
const jsContent = `const NotoSansDevanagariBase64 = "${base64}";\nexport default NotoSansDevanagariBase64;\n`;
fs.writeFileSync('src/assets/NotoSansDevanagariFont.js', jsContent);
console.log('Done! base64 length:', base64.length);
