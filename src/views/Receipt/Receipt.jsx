/* ================= RECEIPT MAIN ================= */
import React, { useRef, useState, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import "./Receipt.css";
import axios from "axios";
import { API_BASE_URL } from "config/constant";
import api from 'utils/api';

function Receipt({ data, onClose, getAllReceiveAmount }) {
  const pdfRef = useRef();
  const [printDisabled, setPrintDisabled] = useState(false);
  const plotCustomers = data?.plotCustomers || [];
  const primaryRow = plotCustomers[0] || data?.selectedRow || data;

  const handleAfterPrint = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem("users"));
      const selectedRow = primaryRow;

      const formData = new FormData();
      formData.append("user_id", userData.user_id || "");
      formData.append("user_name", userData.name || "");
      formData.append("customer_name", selectedRow.customer_name || "");
      formData.append("booking_id", selectedRow.booking_id || "");
      formData.append("project_id", selectedRow.project_id || "");
      formData.append("plot_id", selectedRow.plot_id || "");
      formData.append("role_id", userData.role_id);
      formData.append("receive_id", selectedRow.receive_id || "");

      await api.post(`/receiveamount/receiptdownload`, formData, {
        headers: {
          Authorization: userData?.user_token || "",
          "Content-Type": "multipart/form-data",
        },
      });
    } catch (error) {
      console.error("Error sending receipt data:", error);
    } finally {
      if (onClose) onClose();
      if (getAllReceiveAmount) getAllReceiveAmount();
    }
  };

  const handlePrint = useReactToPrint({
    contentRef: pdfRef,
    documentTitle: `Receipts_${new Date().toISOString().replace(/[:.]/g, '-')}`,
    onAfterPrint: handleAfterPrint,
  });

  const checkBeforePrint = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem("users"));
      const selectedRow = primaryRow;

      const res = await api.get(`/receiveamount/checkstutas`, {
        headers: { Authorization: userData.user_token || "" },
        params: {
          role_id: userData.role_id,
          receive_id: selectedRow.receive_id,
          booking_id: selectedRow.booking_id,
        },
      });

      if (res?.data?.allowed) handlePrint();
      else {
        alert(res?.data?.message || "Download not allowed");
        setPrintDisabled(true);
      }
    } catch {
      alert("Unable to check status. Please try again.");
      setPrintDisabled(true);
    }
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
      <div ref={pdfRef} className="print-area">
        <div className="receipt-wrapper screen-only">
          <RecipetContent index={1} data={data} />
        </div>

        <div className="print-only">
          {[1, 2, 3, 4].map((_, i) => (
            <div className="receipt-wrapper" key={i}>
              <RecipetContent index={i + 1} data={data} />
              {i < 3 && <hr className="copy-separator" />}
            </div>
          ))}
        </div>
      </div>

      <div className="no-print" style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
        {onClose && <button onClick={onClose} style={buttonStyle('#dc3545')}>Close</button>}
        <button onClick={checkBeforePrint} style={buttonStyle('#007bff')} disabled={printDisabled}>
          Print Receipts
        </button>
      </div>
    </div>
  );
}

const buttonStyle = (bg) => ({
  background: bg,
  color: 'white',
  border: 'none',
  padding: '8px 14px',
  borderRadius: '6px',
  cursor: 'pointer',
});

export default Receipt;


function RecipetContent({ index, data }) {
  const plotCustomers = data?.plotCustomers || [];
  const selectedRow = plotCustomers[0] || data?.selectedRow || data;

  // ✅ NEW: customer_list se data lena
  const customerList = data?.selectedRow?.customer_list || [];

  

  // 🔹 Sabhi names (priority: customer_list → plotCustomers → selectedRow)
  const allNames = customerList.length
    ? customerList.map(c => c.customer_name).filter(Boolean)
    : (plotCustomers.length
        ? plotCustomers.map(c => c.customer_name).filter(Boolean)
        : (selectedRow?.customer_name ? [selectedRow.customer_name] : [])
      );

  const fullName = allNames.join(",") || "-";

  // 🔹 Sabhi mobile numbers (multi-customer) – yahi logic as-it-is
  const allNumbers = plotCustomers.length
    ? plotCustomers.map(c => c.mobile_no).filter(Boolean)
    : (selectedRow?.mobile_no ? [selectedRow.mobile_no] : []);

  // ✅ Sirf first mobile number dikhana hai
  const primaryMobileNo = allNumbers[0] || selectedRow?.mobile_no || "-";

  // 🔹 Sabhi PAN numbers (priority: customer_list → plotCustomers → selectedRow)
  const allPans = customerList.length
    ? customerList.map(c => c.pan_number).filter(Boolean)
    : (plotCustomers.length
        ? plotCustomers.map(c => c.pan_number).filter(Boolean)
        : (selectedRow?.pan_number ? [selectedRow.pan_number] : [])
      );

  const fullPanNo = allPans.join(",") || "-";

  // ✅ 5 fixed variables for names
  const name1 = allNames[0] || "";
  const name2 = allNames[1] || "";
  const name3 = allNames[2] || "";
  const name4 = allNames[3] || "";
  const name5 = allNames[4] || "";

  // ✅ First row → 3 names
  const firstRowNames = [name1, name2, name3].filter(Boolean).join(",");

  // ✅ Second row → baaki (4th + 5th)
  const secondRowNames = [name4, name5].filter(Boolean).join(",");

  const copyLabels = ["First", "Second", "Third", "Fourth"];

  const numberToWords = (num) => {
    if (!num) return '-';
    num = parseFloat(num);
    const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight',
      'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen',
      'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const inWords = (n) => {
      if (n < 20) return a[n];
      if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? (' ' + a[n % 10]) : '');
      if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? (' ' + inWords(n % 100)) : '');
      if (n < 100000) return inWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? (' ' + inWords(n % 1000)) : '');
      if (n < 10000000) return inWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? (' ' + inWords(n % 100000)) : '');
      return inWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? (' ' + inWords(n % 10000000)) : '');
    };
    const [rupees, paise] = num.toString().split('.');
    let words = inWords(parseInt(rupees)) + ' Rupees';
    if (paise && parseInt(paise) > 0) words += ' and ' + inWords(parseInt(paise)) + ' Paise';
    return words + ' Only';
  };
   const formatAmount = (val) => {
    if (val === null || val === undefined || val === "") return "";
    const num = Number(val);
    if (Number.isNaN(num)) return val; // Agar number na ho to original text hi dikhao
    return num.toLocaleString("en-IN"); // 1234567 -> 12,34,567
  };

  const formatDate = (d) => {
    if (!d) return '-';
    const dt = new Date(d);
    return `${String(dt.getDate()).padStart(2, '0')}/${String(dt.getMonth() + 1).padStart(2, '0')}/${dt.getFullYear()}`;
  };

  return (
    <div className="receipt-card">
      <div className="copy-label">
        {selectedRow?.is_downloaded == 1
          ? `Duplicate (${copyLabels[index - 1]} Copy)`
          : `${copyLabels[index - 1]} Copy`}
      </div>

      <div className="receipt-header">
        <div className="cin">CIN : U51100RJ2008SPTC055536</div>
        <div className="gstin">GSTIN : 08AAFCA6481R1ZB</div>
      </div>

      <div className="top-section">
        <div>
          <h3 className="company-name">Amar Pratap Developers Pvt. Ltd.</h3>
          <p className="company-address">
            Room No. 2 &amp; 4, Ground Floor, A-21, Sadulganj, BIKANER (Raj.)<br />
            Mobile : 09001997459, 09929091171
          </p>
        </div>
        <div className="receipt-info">
          <div>No. <span className="fill-text">{selectedRow?.booking_id || selectedRow?.receive_id}</span></div>
          <span className="fill-text">{formatDate(selectedRow?.receive_date || selectedRow?.create_at)}</span>
        </div>
      </div>

      <div className="receipt-title">RECEIPT BOOK</div>

      <div className="section paragraph-style">
        {/* 🔹 First line: first 3 names */}
        <div className="line">
          Received with thanks from Mr./Mrs./Ms.
          <span className="dots-line name-line">
            <span className={`data ${selectedRow.krutiDev_font == 1 ? 'kruti-dev' : ''}`}>
              {firstRowNames || "-"}
            </span>
          </span>
        </div>

        {/* 🔹 Second line: remaining names + Mobile No. (sirf first) */}
        <div className="line">
          <span className="dots-line wideses ">
            {secondRowNames && (
              <span className={`data ${selectedRow.krutiDev_font == 1 ? 'kruti-dev' : ''}`}>
                {secondRowNames}
              </span>
            )}
          </span>
          Mobile No.
          <span className="dots-line widess ">
            <span className="data">{primaryMobileNo}</span>
          </span>
          &nbsp;
        </div>

        <div className="line">
          a sum of Rupees
          <span className="dots-line wide">
            <span className="data">{numberToWords(selectedRow?.booking_amount || selectedRow?.amount)}</span>
          </span>
        </div>

        <div className="line">
          by Cheque / DD / Online Transfer No.
          <span className="dots-line small">
            <span className="data">{selectedRow?.payment_mode || selectedRow?.amount_a_type || '-'}   {selectedRow.check_no
   }</span>
          </span>
          &nbsp;Dated
          <span className="dots-line small">
            <span className="data">{formatDate(selectedRow?.check_date)}</span>
          </span>
        </div>

        <div className="line">
          Drawn on Bank
          <span className="dots-line medium">
            <span
              className={`data ${
                'kruti_font_booking' in selectedRow
                  ? selectedRow.kruti_font_booking == 1
                    ? 'kruti-dev'
                    : ''
                  : selectedRow.krutiDev_font == 1
                  ? 'kruti-dev'
                  : ''
              }`}
            >
              {selectedRow?.bank_name || '-'}
            </span>
          </span>
        </div>

        <div className="line">
          Towards
          <span className="dots-line">
            <span className="data">{selectedRow.towords}</span>
          </span>
          &nbsp;PAN No.
          <span className="dots-line wides">
            <span className="data">{fullPanNo}</span>
          </span>
        </div>

        <div className="line">
          Project
          <span className="dots-line wide">
            <span className={`data ${selectedRow.project_font == 1 ? 'kruti-dev' : ''}`}>
              {selectedRow?.project_name || '-'}
            </span>
          </span>
          &nbsp;Plot No.
          <span className="dots-line small">
            <span className="data">{selectedRow?.plot_no || '-'}</span>
          </span>
        </div>
      </div>

      <div className="amount-signature-row">
        <div className="amount">
          ₹ <span className="fill-text">{formatAmount(selectedRow?.booking_amount || selectedRow?.amount || '-')}</span>
          <div className="footer-text">Cheque Subject to Realization PAN is Mandatory.</div>
        </div>
        <div className="sign-section">
          <div className="sign-line"></div>
          <div className="sign-text">Authorised Signatory</div>
        </div>
      </div>
    </div>
  );
}
