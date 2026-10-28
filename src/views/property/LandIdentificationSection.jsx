import React, { useEffect, useRef } from "react";
import { Row } from "react-bootstrap";

import CommonHindiInput from "views/common/CommonHindiInput";
import SearchableHindiInput from "views/common/SearchableHindiInput";
import LandAreaWithUnit from "views/common/LandAreaWithUnit";
import RadioWithTextInput from "views/common/RadioWithTextInput";

function LandIdentificationSection({
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
   radioGroupId = "default"
}) {
  const ph = (key, en, hi) => {
    if (placeholders && placeholders[key]) return placeholders[key];
    return FontValue === 0 ? en : hi;
  };

  /* ===== helper ===== */
  const renderHindiField = (field) => (
    <CommonHindiInput
      key={field.key}
      md={field.md}
      label={ph(field.labelKey, field.enLabel, field.hiLabel)}
      value={formData[field.key] || ""}
      onChange={(v) =>
        setFormData((p) => ({ ...p, [field.key]: v }))
      }
      placeholder={ph(field.key, field.enPh, field.hiPh)}
      fontMode={FontValue}
      maxLength={field.maxLength}
      HindiInput={HindiInput}
    />
  );

  const landUnits = [
    { value: "Bigha", en: "Bigha", hi: "बीघा" },
    { value: "SqFt", en: "Sq. Feet", hi: "वर्ग फुट" },
    { value: "SqM", en: "Sq. Mtr", hi: "वर्ग मीटर" },
    { value: "SqYd", en: "Sq. Yard", hi: "वर्ग गज" },
    { value: "Hectare", en: "Hectare", hi: "हेक्टेयर" }
  ];

  /* ===== SIMPLE INPUTS (KEY FIX ONLY) ===== */
  const simpleHindiFields = [
    {
      key: "rajaswaKhasra",
      labelKey: "rajaswaLabel",
      enLabel: "Upniveshan Khasra / Chak No.",
      hiLabel: "उपनिवेशन खसरा / चक संख्या",
      enPh: "Enter Upniveshan Khasra / Chak No.",
      hiPh: "उपनिवेशन खसरा / चक संख्या दर्ज करें",
      md: 4,
      maxLength: 15
    },
    {
      key: "murbbaNo",
      labelKey: "murbaLabel",
      enLabel: "Murba No.",
      hiLabel: "मुरबा संख्या",
      enPh: "Enter Murba No.",
      hiPh: "मुरबा संख्या दर्ज करें",
      md: 3,
      maxLength: 10
    },
    {
      key: "kilaNo",
      labelKey: "kilaLabel",
      enLabel: "Kila No.",
      hiLabel: "किला संख्या",
      enPh: "Enter Kila No.",
      hiPh: "किला संख्या दर्ज करें",
      md: 3,
      maxLength: 10
    },
    {
      key: "remarks",
      labelKey: "remarksLabel",
      enLabel: "Remarks (Dispute, if any)",
      hiLabel: "टिप्पणी (यदि कोई विवाद हो)",
      enPh: "Enter Remarks",
      hiPh: "टिप्पणी दर्ज करें",
      md: 6,
      maxLength: 100
    }
  ];


  const isUserEditingLand = useRef(false);

  useEffect(() => {
  if (!formData.upniveshanType) {
    setFormData((prev) => ({
      ...prev,
      upniveshanType: "Khasra" // ✅ DEFAULT SELECT
    }));
  }
}, []);

useEffect(() => {
  if (!Array.isArray(formData.buyers)) return;

  // अगर user ने manually land बदला है → auto बंद
  if (isUserEditingLand.current) return;

  const totalBuyerArea = formData.buyers.reduce((sum, b) => {
    const area = parseFloat(b.area);
    return sum + (isNaN(area) ? 0 : area);
  }, 0);

  if (totalBuyerArea > 0) {
    setFormData((prev) => ({
      ...prev,
      landArea: totalBuyerArea.toFixed(2)
    }));
  }
}, [
  formData.buyers.map(b => b.area).join("|")   // 🔥 REAL FIX
]);

useEffect(() => {
  if (!formData.upniveshanType) {
    setFormData((prev) => ({
      ...prev,
      upniveshanType: "Khasra"   // ✅ DEFAULT
    }));
  }
}, []);



  return (
    <>
      {/* ===== ROW 1 ===== */}
      <Row className="mb-3">
        {formData.is_married !== 1 && (
        <LandAreaWithUnit
          md={4}
          label={ph("landAreaLabel", "Land Area", "भूमि क्षेत्र")}
          value={formData.landArea} 
          
          unit={formData.landUnit}
          onChangeValue={(v) => {
    isUserEditingLand.current = true;   // 🔥 user touched land
    setFormData((p) => ({ ...p, landArea: v }));
  }}
          onChangeUnit={(u) =>
            setFormData((p) => ({ ...p, landUnit: u }))
          }
          units={landUnits}
          placeholder={ph(
            "landArea",
            "Enter Land Area",
            "भूमि क्षेत्र दर्ज करें"
          )}
          fontMode={FontValue}
          HindiInput={HindiInput}

          maxLength={7}
        />
)}
        {/* ✅ RADIO INPUT (UPNIVESHAN) */}
        <RadioWithTextInput
          label={ph(
            "upniveshanLabel",
            "Rajaswa Khasra No.",
            "राजस्व खसरा संख्या"
          )}
          // radioName="upniveshanType"
           radioName={`upniveshanType_${radioGroupId}`}
          options={[
            { value: "Khasra", label: ph("khasra", "Khasra", "खसरा") },
            { value: "Chak", label: ph("chak", "Chak", "चक") }
          ]}
          selected={formData.upniveshanType}
          onChangeRadio={(v) =>
            setFormData((p) => ({ ...p, upniveshanType: v }))
          }
          value={formData.upniveshanKhasra}
          onChangeValue={(v) =>
            setFormData((p) => ({ ...p, upniveshanKhasra: v }))
          }
          placeholder={ph(
            "upniveshanKhasra",
            "Enter Khasra / Chak No.",
            "खसरा / चक संख्या दर्ज करें"
          )}
          fontMode={FontValue}
          HindiInput={HindiInput}
          
        />

        {/* ❗ SAME UI BUT DIFFERENT KEY */}
        {simpleHindiFields.slice(0, 1).map(renderHindiField)}
      </Row>

      {/* ===== ROW 2 ===== */}
      <Row className="mb-3">
        {simpleHindiFields.slice(1).map(renderHindiField)}
      </Row>

      {/* ===== ROW 3 : STATUS & PAYABLE AMOUNT ===== */}
      <Row className="mb-2">
        <SearchableHindiInput
          md={3}
          label={ph("mutationLabel", "Mutation Status", "म्युटेशन स्थिति")}
          value={formData.mutationStatus || ""}
          onChange={(v) =>
            setFormData((p) => ({ ...p, mutationStatus: v }))
          }
          placeholder={ph(
            "mutationStatus",
            "Enter Mutation Status",
            "म्युटेशन स्थिति दर्ज करें"
          )}
          fontMode={FontValue}
          HindiInput={HindiInput}
          suggestions={suggestions.mutationStatus || []}
          dropdownStyle={dropdownStyle}
          dropdownItemStyle={dropdownItemStyle}
          showDropdown={false}
        />

        <CommonHindiInput
          md={3}
          label={ph("jamabandiLabel", "Jamabandi Status", "जमाबंदी स्थिति")}
          value={formData.jamabandiStatus || ""}
          onChange={(v) =>
            setFormData((p) => ({ ...p, jamabandiStatus: v }))
          }
          placeholder={ph(
            "jamabandiStatus",
            "Enter Jamabandi Status",
            "जमाबंदी स्थिति दर्ज करें"
          )}
          fontMode={FontValue}
          HindiInput={HindiInput}
        />

        <CommonHindiInput
          md={3}
          label={ph("girdawariLabel", "Girdawari Status", "गिरदावरी स्थिति")}
          value={formData.girdawariStatus || ""}
          onChange={(v) =>
            setFormData((p) => ({ ...p, girdawariStatus: v }))
          }
          placeholder={ph(
            "girdawariStatus",
            "Enter Girdawari Status",
            "गिरदावरी स्थिति दर्ज करें"
          )}
          fontMode={FontValue}
          HindiInput={HindiInput}
        />

        <CommonHindiInput
          md={3}
          label={ph("payableAmountLabel", "Payable Amount", "देय राशि")}
          value={formData.payableAmount || ""}
          onChange={(v) => {
            const onlyNumber = v.replace(/\D/g, "");
            if (onlyNumber.length <= 15) {
              setFormData((p) => ({
                ...p,
                payableAmount: onlyNumber
              }));
            }
          }}
          placeholder={ph(
            "payableAmount",
            "Enter Payable Amount",
            "देय राशि दर्ज करें"
          )}
          disableHindi={true}
          maxLength={15}
        />
      </Row>

    </>
  );
}

export default LandIdentificationSection;
