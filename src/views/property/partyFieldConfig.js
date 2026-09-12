// partyFieldConfig.js

export const relationOptions = [
  { value: 'S/O', labelEn: 'S/O', labelHi: 'पुत्र/पौत्री' },
  { value: 'W/O', labelEn: 'W/O', labelHi: 'पत्नि/पति का' },
  { value: 'D/O', labelEn: 'D/O', labelHi: 'पुत्री' },
];

export const sellerIndividualFields = [
  { key: 'eller_name', col: 3, type: 'hindi', labelKey: 'sellerLabel', phKey: 'sellerName', required: true },
  { key: 'relation', col: 1, type: 'relation' },
  { key: 'fatherName', col: 3, type: 'relationName' },
  { key: 'age', col: 1, type: 'number', max: 3 },
  { key: 'aadhaar', col: 2, type: 'aadhaar' },
  { key: 'pan', col: 2, type: 'pan' },
  { key: 'mobile', col: 3, type: 'mobile' },
  { key: 'address', col: 4, type: 'hindi', labelKey: 'sellerAddressLabel', phKey: 'sellerAddress' },
  { key: 'reference', col: 3, type: 'hindi', labelKey: 'sellerReferenceLabel', phKey: 'sellerReference' },
  { key: 'area', col: 2, type: 'number', labelKey: 'sellerAreaLabel', phKey: 'sellerAreaPh' },
  { key: 'poa_holder_name', col: 3, type: 'hindi', labelKey: 'poaHolderLabel', phKey: 'poaHolderPh' },
];

export const sellerCompanyFields = [
  { key: 'seller_name', col: 3, type: 'hindi', labelKey: 'sellerCompanyNameLabel', phKey: 'sellerCompanyNamePh', required: true },
  { key: 'poa_holder_name', col: 3, type: 'hindi', labelKey: 'sellerDirectorLabel', phKey: 'sellerDirectorNamePh' },
  { key: 'age', col: 2, type: 'number', max: 3 },
  { key: 'aadhaar', col: 3, type: 'aadhaar' },
  { key: 'pan', col: 3, type: 'pan' },
  { key: 'mobile', col: 3, type: 'mobile' },
  { key: 'reference', col: 3, type: 'hindi' },
  { key: 'address', col: 4, type: 'hindi' },
  { key: 'area', col: 2, type: 'number' },
];

export const buyerIndividualFields = [
  { key: 'name', col: 3, type: 'hindi', labelKey: 'buyerNameLabel', phKey: 'buyerName' },
  { key: 'relation', col: 1, type: 'relation' },
  { key: 'fatherName', col: 3, type: 'relationName' },
  { key: 'age', col: 2, type: 'number', max: 3 },
  { key: 'aadhaar', col: 3, type: 'aadhaar' },
  { key: 'pan', col: 3, type: 'pan' },
  { key: 'mobile', col: 3, type: 'mobile' },
  { key: 'reference', col: 3, type: 'hindi' },
  { key: 'address', col: 4, type: 'hindi' },
  { key: 'area', col: 2, type: 'number' },
];
