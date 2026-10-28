import React from "react";
import { Row, Col, Card, Form, Button } from "react-bootstrap";

import CommonHindiInput from "views/common/CommonHindiInput";
import SearchableHindiInput from "views/common/SearchableHindiInput";
import CommonDateInput from "views/common/CommonDateInput";
import CommonSelect from "views/common/CommonSelect";

function OwnershipPaymentSection({
  formData,
  setFormData,
  FontValue,
  placeholders,
  LANGUAGE,
  suggestions = {},
  handleSearchableChange,
  handleSelectSuggestion,
  dropdownStyle,
  dropdownItemStyle,
  HindiInput,
  isExistingMode,
  extraPayments = [],
  onAddDeletedPaymentId,
  addPaymentRow,
  handleExtraPaymentChange,
  removeExtraPayment,
  paymentType
}) {
  const ph = (key, en, hi) => {
    if (placeholders && placeholders[key]) return placeholders[key];
    return FontValue === 0 ? en : hi;
  };
  const handle7DigitAmount = (value, cb) => {
  const onlyNumber = value.replace(/\D/g, "");
  if (onlyNumber.length <= 7) {
    cb(onlyNumber);
  }
};


  return (
    <>
      {/* ================= PRIMARY PAYMENT ================= */}
      <Row className="mb-3">
        <SearchableHindiInput
          md={4}
          label={ph("physicalPossessionLabel", "Physical Possession Status", "भौतिक कब्जा स्थिति")}
          value={formData.physicalPossession || ""}
          onChange={(v) => handleSearchableChange("physicalPossession", v)}
          placeholder={ph("physicalPossession", "Enter Physical Possession", "भौतिक कब्जा दर्ज करें")}
          fontMode={FontValue}
          HindiInput={HindiInput}
          suggestions={suggestions.physicalPossession || []}
          dropdownStyle={dropdownStyle}
          dropdownItemStyle={dropdownItemStyle}
          showDropdown={!!formData.physicalPossession && FontValue !== LANGUAGE.HI}
          onSelect={(item) =>
            handleSelectSuggestion("physicalPossession", item.physical_possession_status)
          }
        />

        <CommonHindiInput
          md={4}
          label={ph("paymentLabel", "Payment", "संपादित भुगतान")}
          value={formData.paymentA}
          onChange={(v) => setFormData(p => ({ ...p, paymentA: v }))}
          placeholder={ph("payment", "Enter Payment", "संपादित भुगतान दर्ज करें")}
          fontMode={FontValue}
          HindiInput={HindiInput}
          maxLength={15}
          disableHindi={true}
        />

        <CommonHindiInput
          md={4}
          label={ph("consideration amount ", "Consideration amount", "प्रतिफल राशि")}
          value={formData.considerationAmount}
          onChange={(v) => setFormData(p => ({ ...p, considerationAmount: v }))}
          placeholder={ph("considerationamountPh", "Enter consideration amount ", "प्रतिफल राशि दर्ज करें")}
          fontMode={FontValue}
          HindiInput={HindiInput}
          maxLength={15}
          disableHindi={true}
        />
      </Row>

      <Row className="mb-3">
        <CommonHindiInput
          md={4}
          label={ph("compensationLabel", "Compensation Payment (if any)", "मुआवजा भुगतान (यदि कोई हो)")}
          value={formData.compensationPayment}
          onChange={(v) => setFormData(p => ({ ...p, compensationPayment: v }))}
          placeholder={ph("compensationPayment", "Enter Compensation Payment", "मुआवजा भुगतान दर्ज करें")}
          fontMode={FontValue}
          HindiInput={HindiInput}
          maxLength={7}
        />

        <CommonSelect
          md={4}
          label={ph("categoryLabel", "Category of Land", "भूमि की श्रेणी")}
          value={formData.category || ""}
          onChange={(v) => setFormData(p => ({ ...p, category: v }))}
          placeholder={ph("selectCategory", "Select Category", "श्रेणी चुनें")}
          options={[
            { value: "Agricultural", label: "कृषि" },
            { value: "Residential", label: "आवासीय" },
            { value: "Commercial", label: "व्यावसायिक" },
            { value: "Industrial", label: "औद्योगिक" },
            { value: "NA", label: "गैर-कृषि" },
            { value: "Institutional", label: "संस्थागत" },
            { value: "Other", label: "अन्य" }
          ]}
        />

        {/* ✅ CommonDateInput */}
        <CommonDateInput
          md={4}
          label={ph("dateLabel", "Date", "तारीख")}
          value={formData.paymentDate}
          onChange={(v) =>
            setFormData(p => ({ ...p, paymentDate: v }))
          }
        />
      </Row>

      {/* ===== MODE + BANK + BRANCH + CHEQUE (PRIMARY) ===== */}
      <Row className="mb-3">
        {/* ✅ CommonSelect */}
        <CommonSelect
          md={3}
          label={ph("modeLabel", "Mode of Payment", "भुगतान का तरीका")}
          value={formData.paymentMode}
          onChange={(v) =>
            setFormData(p => ({ ...p, paymentMode: v }))
          }
          placeholder={ph("selectMode", "Select Mode", "तरीका चुनें")}
          options={paymentType?.map(m => ({
            value: m.id,
            label: m.payment_mode || m.name
          }))}
        />

        <CommonHindiInput
          md={3}
          label={ph("bankLabel", "Bank Name", "बैंक का नाम")}
          value={formData.bankName}
          onChange={(v) => setFormData(p => ({ ...p, bankName: v }))}
          placeholder={ph("bankName", "Enter Bank Name", "बैंक का नाम दर्ज करें")}
          fontMode={FontValue}
          HindiInput={HindiInput}
          maxLength={30}
        />

        <CommonHindiInput
          md={3}
          label={ph("branchLabel", "Branch Name", "शाखा का नाम")}
          value={formData.branchName}
          onChange={(v) => setFormData(p => ({ ...p, branchName: v }))}
          placeholder={ph("branchName", "Enter Branch Name", "शाखा का नाम दर्ज करें")}
          fontMode={FontValue}
          HindiInput={HindiInput}
          maxLength={50}

        />

        <CommonHindiInput
          md={3}
          label={ph("chequeLabel", "Cheque No.", "चेक नंबर")}
          value={formData.chequeNo}
          onChange={(v) => setFormData(p => ({ ...p, chequeNo: v }))}
          placeholder={ph("chequePlaceholder", "Enter Cheque No.", "चेक नंबर दर्ज करें")}
          fontMode={FontValue}
          HindiInput={HindiInput}
          maxLength={12}
        />
      </Row>

      {/* ================= EXTRA PAYMENTS ================= */}
      <div className="d-flex justify-content-between align-items-center mt-3 mb-2 pt-2 border-top">
        <h6 className="mb-0 fw-bold text-dark">{ph("addPaymentExtraTitle", "Add Payment (Extra)", "अतिरिक्त भुगतान")}</h6>
        <Button size="sm" className="btn-add-payment" onClick={addPaymentRow}>
          + {ph("addPaymentBtn", "Add Payment", "+ भुगतान जोड़ें")}
        </Button>
      </div>

      {extraPayments.map((p, idx) => (
        <div key={idx} className="extra-payment-box mt-3">
          {/* ROW 1 */}
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="text-primary fw-bold mb-0" style={{ fontSize: "13px" }}>
              {ph("extraPaymentTitle", "Extra Payment", "अतिरिक्त भुगतान")} #{idx + 1}
            </h6>

            <Button
              size="sm"
              variant="outline-danger"
              style={{ fontSize: "11px", padding: "2px 10px" }}
              onClick={() => {
                // 🔥 EXISTING payment → mark for delete
                if (isExistingMode && p.id && onAddDeletedPaymentId) {
                  onAddDeletedPaymentId(p.id);
                }
                removeExtraPayment(idx);
              }}
            >
              {ph("removeBtn", "Remove", "हटाएं")}
            </Button>
          </div>

          
          <Row className="mb-3">
            <SearchableHindiInput
              md={4}
              label={ph("physicalPossessionLabel", "Physical Possession Status", "भौतिक कब्जा स्थिति")}
              value={p.physicalPossession || ""}
              onChange={(v) => handleExtraPaymentChange(idx, "physicalPossession", v)}
              placeholder={ph("physicalPossession", "Enter Physical Possession", "भौतिक कब्जा दर्ज करें")}
              fontMode={FontValue}
              HindiInput={HindiInput}
              suggestions={suggestions.physicalPossession || []}
              dropdownStyle={dropdownStyle}
              dropdownItemStyle={dropdownItemStyle}
              showDropdown={!!p.physicalPossession && FontValue !== LANGUAGE.HI}
              onSelect={(item) =>
                handleExtraPaymentChange(idx, "physicalPossession", item.physical_possession_status)
              }
            />

            <CommonHindiInput
              md={4}
              label={ph("paymentLabel", "Payment", "संपादित भुगतान")}
              value={p.paymentA || ""}
              onChange={(v) => handleExtraPaymentChange(idx, "paymentA", v)}
              placeholder={ph("payment", "Enter Payment", "संपादित भुगतान दर्ज करें")}
              fontMode={FontValue}
              HindiInput={HindiInput}
              maxLength={15}
              disableHindi={true}
            />

            <CommonHindiInput
              md={4}
              label={ph("considerationamountLabel", "considerationAmount ", "प्रतिफल राशि")}
              value={p.considerationAmount || ""}
              onChange={(v) => handleExtraPaymentChange(idx, "considerationAmount", v)
}
              placeholder={ph("considerationamountPh", "Enter consideration amount ", "प्रतिफल राशि दर्ज करें")}
              fontMode={FontValue}
              HindiInput={HindiInput}
              maxLength={15}
              disableHindi={true}
            />
          </Row>

          {/* ROW 2 */}
          <Row className="mb-3">
            <CommonHindiInput
              md={4}
              label={ph("compensationLabel", "Compensation Payment (if any)", "मुआवजा भुगतान (यदि कोई हो)")}
              value={p.compensationPayment || ""}
              onChange={(v) => handleExtraPaymentChange(idx, "compensationPayment", v)}
              placeholder={ph("compensationPayment", "Enter Compensation Payment", "मुआवजा भुगतान दर्ज करें")}
              fontMode={FontValue}
              HindiInput={HindiInput}
            />

            <CommonSelect
              md={4}
              label={ph("categoryLabel", "Category of Land", "भूमि की श्रेणी")}
              value={p.category || ""}
              onChange={(v) => handleExtraPaymentChange(idx, "category", v)}
              placeholder={ph("selectCategory", "Select Category", "श्रेणी चुनें")}
              options={[
                { value: "Agricultural", label: "कृषि" },
                { value: "Residential", label: "आवासीय" },
                { value: "Commercial", label: "व्यावसायिक" },
                { value: "Industrial", label: "औद्योगिक" },
                { value: "NA", label: "गैर-कृषि" },
                { value: "Institutional", label: "संस्थागत" },
                { value: "Other", label: "अन्य" }
              ]}
            />

            {/* ✅ CommonDateInput */}
            <CommonDateInput
              md={4}
              label={ph("dateLabel", "Date", "तारीख")}
              value={p.paymentDate}
              onChange={(v) =>
                handleExtraPaymentChange(idx, "paymentDate", v)
              }
            />
          </Row>

          {/* ROW 3 */}
          <Row className="mb-3">
            <CommonSelect
              md={3}
              label={ph("modeLabel", "Mode of Payment", "भुगतान का तरीका")}
              value={p.paymentMode}
              onChange={(v) =>
                handleExtraPaymentChange(idx, "paymentMode", v)
              }
              placeholder={ph("selectMode", "Select Mode", "तरीका चुनें")}
              options={paymentType?.map(m => ({
                value: m.id,
                label: m.payment_mode || m.name
              }))}
            />

            <CommonHindiInput
              md={3}
              label={ph("bankLabel", "Bank Name", "बैंक का नाम")}
              value={p.bankName || ""}
              onChange={(v) => handleExtraPaymentChange(idx, "bankName", v)}
              placeholder={ph("bankName", "Enter Bank Name", "बैंक का नाम दर्ज करें")}
              fontMode={FontValue}
              HindiInput={HindiInput}
              maxLength={30}
            />

            <CommonHindiInput
              md={3}
              label={ph("branchLabel", "Branch Name", "शाखा का नाम")}
              value={p.branchName || ""}
              onChange={(v) => handleExtraPaymentChange(idx, "branchName", v)}
              placeholder={ph("branchName", "Enter Branch Name", "शाखा का नाम दर्ज करें")}
              fontMode={FontValue}
              HindiInput={HindiInput}
               maxLength={50}
            />

            <CommonHindiInput
              md={3}
              label={ph("chequeLabel", "Cheque No.", "चेक नंबर")}
              value={p.chequeNo || ""}
              onChange={(v) => handleExtraPaymentChange(idx, "chequeNo", v)}
              placeholder={ph("chequePlaceholder", "Enter Cheque No.", "चेक नंबर दर्ज करें")}
              fontMode={FontValue}
              HindiInput={HindiInput}
              maxLength={12}
            />
          </Row>
        </div>
      ))}
    </>
  );
}

export default OwnershipPaymentSection;
