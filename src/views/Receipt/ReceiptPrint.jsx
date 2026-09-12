// import React from "react";
// import "./Receipt.css";
// import { Button } from "react-bootstrap";

// export default function Receipt({
//   receiptNo = "160",
//   date = "29/10/2025",
//   name = "Amit Bishnoi",
//   mobile = "9876543210",
//   rupees = "One Lakh Eleven Thousand only",
//   chequeNo = "Online Transfer",
//   chequeDate = "29/10/2025",
//   bank = "P.N.B Bank",
//   towards = "Plot Amount",
//   pan = "ABCDE1234F",
//   project = 'Sagar Setu Enclave "D" Block',
//   plotNo = "114",
//   amount = "1,11,000",
//   onClose,
// }) {
//   const handlePrint = () => window.print();

//   const ReceiptBlock = ({ copyLabel }) => (
//     <div className="receipt-block">
//       {copyLabel && <div className="copy-label">{copyLabel}</div>}

//       <div className="receipt-card">
//         {/* HEADER */}
//         <div className="receipt-header">
//           <div className="cin">CIN : U51100RJ2008SPTC055536</div>
//           <div className="gstin">GSTIN : 08AAFCA6481R1ZB</div>
//         </div>

//         <div className="top-section">
//           <div>
//             <h3 className="company-name">Amar Pratap Developers Pvt. Ltd.</h3>
//             <p className="company-address">
//               Room No. 2 & 4, Ground Floor, A-21, Sadulganj, BIKANER (Raj.)
//               <br />
//               Mobile : 09001997459, 09929091171
//             </p>
//           </div>

//           <div className="receipt-info">
//             <div>
//               No. <span className="fill-text">{receiptNo}</span>
//             </div>
//             <div>
//               Date <span className="fill-text">{date}</span>
//             </div>
//           </div>
//         </div>

//         <div className="receipt-title">RECEIPT BOOK</div>

//         {/* BODY */}
//         <div className="section paragraph-style">
//           <div className="line">
//             Received with thanks from Mr./Mrs./Ms.
//             <span className="dots-line">
//               <span className="data">{name}</span>
//             </span>
//           </div>

//           <div className="line">
//             Mobile No.
//             <span className="dots-line small">
//               <span className="data">{mobile}</span>
//             </span>
//           </div>

//           <div className="line">
//             a sum of Rupees
//             <span className="dots-line wide">
//               <span className="data">{rupees}</span>
//             </span>
//           </div>

//           <div className="line">
//             by Cheque / DD / Online Transfer No.
//             <span className="dots-line">
//               <span className="data">{chequeNo}</span>
//             </span>
//             &nbsp;dated
//             <span className="dots-line small">
//               <span className="data">{chequeDate}</span>
//             </span>
//           </div>

//           <div className="line">
//             Drawn on Bank
//             <span className="dots-line medium">
//               <span className="data">{bank}</span>
//             </span>
//           </div>

//           <div className="line">
//             Towards
//             <span className="dots-line">
//               <span className="data">{towards}</span>
//             </span>
//             &nbsp;PAN No.
//             <span className="dots-line small">
//               <span className="data">{pan}</span>
//             </span>
//           </div>

//           <div className="line">
//             Project
//             <span className="dots-line wide">
//               <span className="data">{project}</span>
//             </span>
//             &nbsp;Plot No.
//             <span className="dots-line small">
//               <span className="data">{plotNo}</span>
//             </span>
//           </div>
//         </div>

//         {/* FOOTER */}
//         <div className="amount-signature-row">
//           <div className="amount">
//             ₹ <span className="fill-text">{amount} /-</span>
//             <div className="footer-text">
//               Cheque Subject to Realization
//               <br />
//               PAN is Mandatory.
//             </div>
//           </div>

//           <div className="sign-section">
//             <div className="sign-line"></div>
//             <div className="sign-text">Authorised Signatory</div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );

//   return (
//     <div className="receipt-wrapper bg-white p-4">
//       {/* Buttons */}
//       <div className="d-flex justify-content-end gap-2 mb-3 no-print">
//         <Button variant="secondary" onClick={onClose}>
//           Close
//         </Button>
//         <Button variant="primary" onClick={handlePrint}>
//           Print / Download
//         </Button>
//       </div>

//       {/* 🧾 Screen pe ek hi visible */}
//       <div className="no-print">
//         <ReceiptBlock />
//       </div>

//       {/* 🖨️ Print hone par 2 copies ek page par */}
//       <div className="print-layout">
//         <ReceiptBlock copyLabel="Copy 1" />
//         <div className="page-divider"></div>
//         <ReceiptBlock copyLabel="Copy 2" />
//       </div>
//     </div>
//   );
// }
