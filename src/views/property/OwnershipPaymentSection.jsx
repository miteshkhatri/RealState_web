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
          placeholder={ph("payment", "Enter Payment", "संपादित भुगतान")}
          fontMode={FontValue}
          HindiInput={HindiInput}
          maxLength={15}
            disableHindi={true}
        />

        <CommonHindiInput
          md={4}
          label={ph("consideration amount ", "Consideration amount", "भुगतान की प्रतिफल राशि")}
          value={formData.considerationAmount }
          onChange={(v) => setFormData(p => ({ ...p, considerationAmount : v }))}


          
          placeholder={ph("considerationamountPh", "Enter consideration amount ", "भुगतान की प्रतिफल राशि")}
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

        <Col md={4}>
          <Form.Label>{ph("categoryLabel", "Category of Land", "भूमि की श्रेणी")}</Form.Label>
          <Form.Select
            size="sm"
            value={formData.category || ""}
            onChange={(e) => setFormData(p => ({ ...p, category: e.target.value }))}
          >
            <option value="">{ph("selectCategory", "Select Category", "श्रेणी चुनें")}</option>
            <option value="Agricultural">कृषि</option>
            <option value="Residential">आवासीय</option>
            <option value="Commercial">व्यावसायिक</option>
            <option value="Industrial">औद्योगिक</option>
            <option value="NA">गैर-कृषि</option>
            <option value="Institutional">संस्थागत</option>
            <option value="Other">अन्य</option>
          </Form.Select>
        </Col>

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
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h6>{ph("addPaymentExtraTitle", "Add Payment (Extra)", "भुगतान जोड़ें (एक्स्ट्रा)")}</h6>
        <Button size="sm" onClick={addPaymentRow}>
          + {ph("addPaymentBtn", "Add Payment", "भुगतान जोड़ें")}
        </Button>
      </div>

      {extraPayments.map((p, idx) => (
        <React.Fragment key={idx}>

          <hr></hr>
          {/* ROW 1 */}<div className="d-flex justify-content-between align-items-center mb-2">
            
  <h6 className="text-muted">
    {ph("extraPaymentTitle", "Extra Payment", "अतिरिक्त भुगतान")} #{idx + 1}
  </h6>

  <Button
    size="sm"
    variant="danger"
    onClick={() => {
      // 🔥 EXISTING payment → mark for delete
      if (isExistingMode && p.id && onAddDeletedPaymentId) {
        onAddDeletedPaymentId(p.id);
      }
      removeExtraPayment(idx);
    }}
  >
 {ph("removeBtn", "Remove", "हटाएँ")}
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
              placeholder={ph("payment", "Enter Payment", "संपादित भुगतान")}
              fontMode={FontValue}
              HindiInput={HindiInput}
              maxLength={15}
              disableHindi={true}
            />

            <CommonHindiInput
              md={4}
              label={ph("considerationamountLabel", "considerationAmount ", "भुगतान की प्रतिफल राशि")}
              value={p.considerationAmount || ""}
              onChange={(v) => handleExtraPaymentChange(idx, "considerationAmount", v)
}
              placeholder={ph("considerationamountPh", "Enter consideration amount ", "भुगतान की प्रतिफल राशि")}
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

            <Col md={4}>
              <Form.Label>{ph("categoryLabel", "Category of Land", "भूमि की श्रेणी")}</Form.Label>
              <Form.Select
                size="sm"
                value={p.category || ""}
                onChange={(e) => handleExtraPaymentChange(idx, "category", e.target.value)}
              >
                <option value="">{ph("selectCategory", "Select Category", "श्रेणी चुनें")}</option>
                <option value="Agricultural">कृषि</option>
                <option value="Residential">आवासीय</option>
                <option value="Commercial">व्यावसायिक</option>
                <option value="Industrial">औद्योगिक</option>
                <option value="NA">गैर-कृषि</option>
                <option value="Institutional">संस्थागत</option>
                <option value="Other">अन्य</option>
              </Form.Select>
            </Col>

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
        </React.Fragment>
      ))}
    </>
  );
}

export default OwnershipPaymentSection;
