import React, { useEffect } from "react";
import { Row, Col, Card, Form, Button, InputGroup } from "react-bootstrap";

function SellerBuyerSection({
  formData,
  setFormData,
  FontValue,
  placeholders,
  errors,
  isExistingMode,
  onAddDeletedBuyerId,
  onAddDeletedSellerId,
  HindiInput,
  getRelationLabel,
  getRelationPlaceholder,
}) {
  useEffect(() => {
    // ===== SELLERS INIT & NORMALIZE =====
    if (!Array.isArray(formData.sellers) || formData.sellers.length === 0) {
      setFormData((prev) => ({
        ...prev,
        seller_area: prev.seller_area || "", // SECTION LEVEL AREA
        sellers: [
          {
            id: prev.sellerId || null,
            seller_name: prev.seller_name || prev.sellerName || "",

            // ✅ NEW (Director Name – separate key)
            director_name: prev.director_name || "",

            poa_holder_name: prev.poa_holder_name || prev.poaHolder || "",
            seller_remarks: prev.reference || "",
            type: prev.seller_type || "seller", // "seller" / "holder"
            area: prev.seller_area || "",
            relation: prev.seller_relation || "S/O",
            fatherName: prev.seller_fatherName || "",
            age: prev.seller_age || "",
            aadhaar: prev.seller_aadhaar || "",
            pan: prev.seller_pan || "",
            address: prev.seller_address || "",
            mobile: prev.seller_mobile || "",
            reference: prev.seller_reference || "",
            font_name:
              typeof prev.font_name !== "undefined" && prev.font_name !== null
                ? Number(prev.font_name)
                : typeof prev.seller_font_name !== "undefined" &&
                    prev.seller_font_name !== null
                  ? Number(prev.seller_font_name)
                  : FontValue || 0,
          },
        ],
      }));
    } else {
      // ===== normalize any missing keys inside existing sellers =====
      setFormData((prev) => {
        const normalized = (prev.sellers || []).map((s) => ({
          id: s.id || null,
          seller_name: s.seller_name || s.name || "",

          // ✅ NEW (normalize director name)
          director_name: s.director_name || "",

          poa_holder_name: s.poa_holder_name || s.poaHolder || "",
          area_type: s.area_type || "",
          mutation_status: s.mutation_status || "",
          jamabandi_status: s.jamabandi_status || "",
          girdawari_status: s.girdawari_status || "",
          seller_remarks: s.reference || "",
          type: s.type || "seller",
          relation: s.relation || "S/O",
          fatherName: s.fatherName || "",
          age: s.age || "",
          aadhaar: s.aadhaar || "",
          pan: s.pan || "",
          area: s.area || "",
          address: s.address || "",
          mobile: s.mobile || "",
          reference: s.reference || "",
          font_name:
            typeof s.font_name !== "undefined" && s.font_name !== null
              ? Number(s.font_name)
              : FontValue || 0,
        }));
        return { ...prev, sellers: normalized };
      });
    }

    // ===== BUYERS INIT & NORMALIZE (UNCHANGED) =====
    if (!Array.isArray(formData.buyers) || formData.buyers.length === 0) {
      setFormData((prev) => ({
        ...prev,
        buyer_area: prev.buyer_area || "",
        buyers: [
          {
            id: null,
            type: "individual",
            name: "",
            relation: "S/O",
            fatherName: "",
            age: "",
            aadhaar: "",
            pan: "",
            address: "",
            mobile: "",
            reference: "",
          },
        ],
      }));
    } else {
      setFormData((prev) => {
        const normalized = (prev.buyers || []).map((b) => ({
          ...b,
          type: b.type || "individual",
        }));
        return { ...prev, buyers: normalized };
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const sellerErrors = Array.isArray(errors?.sellers) ? errors.sellers : [];
  const buyerErrors = Array.isArray(errors?.buyers) ? errors.buyers : [];

  // helper to return placeholder: first check provided placeholders prop, else choose by FontValue
  const ph = (key, en, hi) => {
    if (placeholders && placeholders[key]) return placeholders[key];
    return FontValue === 0 ? en : hi;
  };

  const handleBuyerChange = (index, key, value) => {
    setFormData((prev) => {
      const updated = [...(prev.buyers || [])];
      updated[index] = { ...updated[index], [key]: value };
      return { ...prev, buyers: updated };
    });
  };

  // backend-compatible seller change
  const handleSellerChange = (index, key, value) => {
    setFormData((prev) => {
      const updated = [...(prev.sellers || [])];
      updated[index] = { ...updated[index], [key]: value };
      return { ...prev, sellers: updated };
    });
  };

  const addSeller = () => {
    setFormData((prev) => ({
      ...prev,
      sellers: [
        ...(prev.sellers || []),
        {
          id: null,
          seller_name: "",

          // ✅ NEW (Director Name – required)
          director_name: "",

          poa_holder_name: "",
          seller_remarks: "",
          type: "seller", // default seller
          relation: "S/O",
          fatherName: "",
          age: "",
          aadhaar: "",
          pan: "",
          address: "",
          mobile: "",
          reference: "",
          area: "",
          area_type: "",
          mutation_status: "",
          jamabandi_status: "",
          girdawari_status: "",
          font_name: FontValue,
        },
      ],
    }));
  };

  const removeSeller = (index) => {
    const sellerToRemove = formData.sellers[index];

    // 🔴 Edit mode + DB seller
    if (isExistingMode && sellerToRemove?.id) {
      onAddDeletedSellerId(sellerToRemove.id);
    }

    setFormData((prev) => ({
      ...prev,
      sellers: prev.sellers.filter((_, i) => i !== index),
    }));
  };

  const addBuyer = () => {
    setFormData((prev) => ({
      ...prev,
      buyers: [
        ...(prev.buyers || []),
        {
          id: null,
          type: "individual",
          name: "",
          relation: "S/O",
          fatherName: "",
          age: "",
          aadhaar: "",
          pan: "",
          address: "",
          mobile: "",
          reference: "",
          area: "",
        },
      ],
    }));
  };

  const removeBuyer = (index) => {
    const buyerToRemove = formData.buyers[index];
    if (isExistingMode && buyerToRemove?.id) {
      onAddDeletedBuyerId(buyerToRemove.id);
    }
    setFormData((prev) => ({
      ...prev,
      buyers: (prev.buyers || []).filter((_, i) => i !== index),
    }));
  };

  return (
    <>
      {/* ===== Seller Heading ===== */}
      {/* ===== SELLER VALIDATION SUMMARY ===== */}
      {Array.isArray(errors?.sellers) &&
        errors.sellers.some((e) => Object.keys(e).length > 0) && (
          <Row className="mb-2">
            <Col md={12}>
              <div className="alert alert-danger py-1 px-2 small mb-0">
                {FontValue === 0
                  ? "Please fill all required seller fields marked with *"
                  : "कृपया * से चिह्नित सभी विक्रेता विवरण भरें"}
              </div>
            </Col>
          </Row>
        )}

      {/* Sellers */}
      <Row className="mb-2">
        <Col md={12}>
          {(formData.sellers || []).map((seller, sIndex) => {
            const isHolder = (seller.type || "seller") === "holder";

            return (
              <>
                <Card key={sIndex} className="mb-2 p-2 shadow-none no-gap-card">
                  {/* radio selector for Seller type */}
                  <Row className="mb-2">
                    <Col md={12} className="d-flex justify-content-end">
                      <Form.Check
                        inline
                        label={ph("sellerTypeSeller", "Individual", "व्यक्ति")}
                        name={`seller-type-${sIndex}`}
                        type="radio"
                        id={`seller-seller-${sIndex}`}
                        checked={!isHolder}
                        onChange={() =>
                          handleSellerChange(sIndex, "type", "seller")
                        }
                        className="me-2"
                      />
                      <Form.Check
                        inline
                        label={ph("sellerTypeCompany", "Company", "कंपनी")}
                        name={`seller-type-${sIndex}`}
                        type="radio"
                        id={`seller-company-${sIndex}`}
                        checked={isHolder}
                        onChange={() =>
                          handleSellerChange(sIndex, "type", "holder")
                        }
                      />
                    </Col>
                  </Row>

                  {/* ====== WHEN NORMAL SELLER SELECTED ====== */}
                  {!isHolder && (
                    <>
                      {/* Row 1: Seller Name + Relation + Father Name + Age */}
                      <Row className="mb-2">
                        {/* ===== Seller Name ===== */}
                        <Col md={3} className="d-flex flex-column  ">
                          <Form.Label className="mb-1 small">
                            {ph(
                              "sellerLabel",
                              "Seller Name*",
                              "विक्रेता का नाम*",
                            )}
                          </Form.Label>

                          <HindiInput
                            value={seller.seller_name}
                            onChange={(text) =>
                              handleSellerChange(sIndex, "seller_name", text)
                            }
                            placeholder={ph(
                              "sellerName",
                              "Enter Seller Name*",
                              "विक्रेता का नाम दर्ज करें*",
                            )}
                            fontMode={FontValue}
                            maxLength={30}
                            required
                            className="form-control-sm hindi-input-custom"
                          />

                          {/* 🔴 Seller Name Error (fixed height) */}
                          <div style={{ minHeight: "14px" }}>
                            {sellerErrors?.[sIndex]?.seller_name && (
                              <small className="text-danger">
                                {sellerErrors[sIndex].seller_name}
                              </small>
                            )}
                          </div>
                        </Col>

                        {/* ===== Relation ===== */}
                        <Col md={1}>
                          <Form.Label className="mb-1 small">
                            {ph("sellerRelationLabel", "Relation", "संबंध")}
                          </Form.Label>
                          <Form.Select
                            size="sm"
                            value={seller.relation || "S/O"}
                            onChange={(e) =>
                              handleSellerChange(
                                sIndex,
                                "relation",
                                e.target.value,
                              )
                            }
                            className="form-control-sm"
                          >
                            <option value="S/O">
                              {ph("so", "S/O", "पुत्र/पिता का")}
                            </option>
                            <option value="W/O">
                              {ph("wo", "W/O", "पत्नी / पति का")}
                            </option>
                            <option value="D/O">
                              {ph("do", "D/O", "पुत्री / पिता की")}
                            </option>
                          </Form.Select>
                        </Col>

                        {/* ===== Father / Husband Name ===== */}
                        <Col md={3}>
                          <Form.Label className="mb-1 small">
                            {getRelationLabel(
                              seller.relation || "S/O",
                              FontValue,
                            )}
                          </Form.Label>
                          <HindiInput
                            value={seller.fatherName}
                            onChange={(text) =>
                              handleSellerChange(sIndex, "fatherName", text)
                            }
                            placeholder={getRelationPlaceholder(
                              seller.relation || "S/O",
                              FontValue,
                            )}
                            fontMode={FontValue}
                            maxLength={30}
                            className="form-control-sm hindi-input-custom"
                          />
                        </Col>

                        {/* ===== Age ===== */}
                        <Col md={1}>
                          <Form.Label className="mb-1 small">
                            {ph("sellerAgeLabel", "Age", "उम्र")}
                          </Form.Label>
                          <Form.Control
                            type="text"
                            value={seller.age || ""}
                            onChange={(e) => {
                              const onlyNums = e.target.value
                                .replace(/\D/g, "")
                                .slice(0, 3);
                              handleSellerChange(sIndex, "age", onlyNums);
                            }}
                            className="form-control-sm hindi-input-custom"
                            placeholder={ph("age", "Age", "उम्र")}
                            maxLength={3}
                          />
                        </Col>

                        {/* ===== Aadhaar ===== */}
                        <Col md={2} className="d-flex flex-column">
                          <Form.Label className="mb-1 small">
                            {ph(
                              "sellerAadhaarLabel",
                              "Aadhaar Number*",
                              "आधार नंबर*",
                            )}
                          </Form.Label>

                          <Form.Control
                            type="text"
                            inputMode="numeric"
                            value={seller.aadhaar || ""}
                            onChange={(e) => {
                              const digits = e.target.value
                                .replace(/\D/g, "")
                                .slice(0, 12);
                              const formatted = digits
                                .replace(/(.{4})/g, "$1 ")
                                .trim();
                              handleSellerChange(sIndex, "aadhaar", formatted);
                            }}
                            className="form-control-sm hindi-input-custom"
                            maxLength={14}
                            placeholder={ph(
                              "sellerAadhaar",
                              "Enter Aadhaar Number*",
                              "आधार संख्या दर्ज करें*",
                            )}
                          />

                          <div style={{ minHeight: "14px" }}>
                            {sellerErrors?.[sIndex]?.aadhaar && (
                              <small className="text-danger">
                                {sellerErrors[sIndex].aadhaar}
                              </small>
                            )}
                          </div>
                        </Col>

                        {/* ===== PAN ===== */}
                        <Col md={2} className="d-flex flex-column">
                          <Form.Label className="mb-1 small">
                            {ph("sellerPanLabel", "PAN Number*", "पैन नंबर*")}
                          </Form.Label>

                          <Form.Control
                            type="text"
                            value={seller.pan || ""}
                            onChange={(e) =>
                              handleSellerChange(
                                sIndex,
                                "pan",
                                e.target.value.toUpperCase().slice(0, 10),
                              )
                            }
                            className="form-control-sm hindi-input-custom"
                            maxLength={10}
                            placeholder={ph(
                              "sellerPan",
                              "Enter PAN Number*",
                              "पैन नंबर दर्ज करें*",
                            )}
                          />

                          <div style={{ minHeight: "14px" }}>
                            {sellerErrors?.[sIndex]?.pan && (
                              <small className="text-danger">
                                {sellerErrors[sIndex].pan}
                              </small>
                            )}
                          </div>
                        </Col>
                      </Row>

                      {/* Row 2: Aadhaar, PAN, Mobile, Reference */}
                      <Row className="mb-2 ">
                        <Col md={3}>
                          <Form.Label className="mb-1 small">
                            {ph(
                              "sellerMobileLabel",
                              "Mobile Number*",
                              "मोबाइल नंबर*",
                            )}
                          </Form.Label>

                          <Form.Control
                            type="text"
                            inputMode="numeric"
                            value={seller.mobile || ""}
                            onChange={(e) => {
                              const onlyNums = e.target.value
                                .replace(/\D/g, "")
                                .slice(0, 10);
                              handleSellerChange(sIndex, "mobile", onlyNums);
                            }}
                            className="form-control-sm hindi-input-custom"
                            maxLength={10}
                            placeholder={ph(
                              "sellerMobile",
                              "Enter Mobile Number*",
                              "मोबाइल नंबर दर्ज करें*",
                            )}
                          />

                          {/* 🔴 MOBILE ERROR */}
                          {sellerErrors?.[sIndex]?.mobile && (
                            <div className="text-danger small mt-1">
                              {sellerErrors[sIndex].mobile}
                            </div>
                          )}
                        </Col>

                        <Col md={4}>
                          <Form.Label className="mb-1 small">
                            {ph(
                              "sellerAddressLabel",
                              "Seller Address",
                              "विक्रेता का पता",
                            )}
                          </Form.Label>
                          <HindiInput
                            value={seller.address || ""}
                            onChange={(text) =>
                              handleSellerChange(sIndex, "address", text)
                            }
                            placeholder={ph(
                              "sellerAddress",
                              "Enter Address",
                              "पता दर्ज करें",
                            )}
                            fontMode={FontValue}
                            maxLength={50}
                            className="form-control-sm hindi-input-custom"
                          />
                        </Col>

                        <Col md={5}>
                          <Form.Label className="mb-1 small">
                            {ph(
                              "poaHolderLabel",
                              "POA Holder Name",
                              "POA धारक का नाम",
                            )}
                          </Form.Label>
                          <HindiInput
                            value={seller.poa_holder_name || ""}
                            onChange={(text) =>
                              handleSellerChange(
                                sIndex,
                                "poa_holder_name",
                                text,
                              )
                            }
                            placeholder={ph(
                              "poaHolderPh",
                              "Enter POA Holder Name",
                              "POA धारक का नाम दर्ज करें",
                            )}
                            fontMode={FontValue}
                            maxLength={30}
                            className="form-control-sm hindi-input-custom"
                          />
                        </Col>
                        {/* <Col md={5}>
                            <Form.Label className="mb-1 small">
                              {ph(
                                'sellerReferenceLabel',
                                'Reference / Remark',
                                'संदर्भ / टिप्पणी'
                              )}
                            </Form.Label>
                            <HindiInput
                              value={seller.reference || ''}
                              onChange={(text) =>
                                handleSellerChange(sIndex, 'reference', text)
                              }
                              placeholder={ph(
                                'sellerReference',
                                'Reference / Remark',
                                'संदर्भ / टिप्पणी'
                              )}
                              fontMode={FontValue}
                              maxLength={50}
                              className="form-control-sm hindi-input-custom"
                            />
                          </Col> */}
                      </Row>

                      {/* Row 3: Address + Area (only first seller) + Remove Button */}
                      <Row className="">
                        <Col md={3}>
                          <Form.Label className="mb-1 small">
                            {ph("sellerAreaLabel", "Area", "एरिया")}
                          </Form.Label>

                          <InputGroup size="sm" className="flex-nowrap">
                            <Form.Control
                              type="text"
                              inputMode="decimal"
                              value={seller.area || ""}
                              onChange={(e) => {
                                // केवल digits और एक decimal point allow करें
                                const value = e.target.value;
                                const valid = value.match(/^\d*\.?\d*$/);
                                if (valid) {
                                  handleSellerChange(sIndex, "area", value);
                                }
                              }}
                              className="hindi-input-custom"
                              placeholder={ph(
                                "sellerAreaPh",
                                "Enter Area",
                                "एरिया दर्ज करें",
                              )}
                              maxLength={10}
                            />

                            <Form.Select
                              value={seller.area_type || "Bigha"}
                              onChange={(e) =>
                                handleSellerChange(
                                  sIndex,
                                  "area_type",
                                  e.target.value,
                                )
                              }
                              className="p-0 px-2"
                              style={{ maxWidth: 110 }}
                            >
                              <option value="Bigha">
                                {ph("unitBigha", "Bigha", "बीघा")}
                              </option>
                              <option value="SqFt">
                                {ph("unitSqft", "Sq. Feet", "वर्ग फुट")}
                              </option>
                              <option value="SqM">
                                {ph("unitSqm", "Sq. Mtr", "वर्ग मीटर")}
                              </option>
                              <option value="SqYd">
                                {ph("unitSqyd", "Sq. Yard", "वर्ग गज")}
                              </option>
                              <option value="Hectare">
                                {ph("unitHectare", "Hectare", "हेक्टेयर")}
                              </option>
                            </Form.Select>
                          </InputGroup>
                        </Col>
                        <Col md={3}>
                          <Form.Label className="mb-1 small">
                            {ph(
                              "mutationLabel",
                              "Mutation Status",
                              "म्युटेशन स्थिति",
                            )}
                          </Form.Label>
                          <HindiInput
                            value={seller.mutation_status || ""}
                            onChange={(text) =>
                              handleSellerChange(
                                sIndex,
                                "mutation_status",
                                text,
                              )
                            }
                            placeholder={ph(
                              "mutationStatus",
                              "Enter Mutation Status",
                              "म्युटेशन स्थिति दर्ज करें",
                            )}
                            fontMode={FontValue}
                            maxLength={50}
                            className="form-control-sm hindi-input-custom"
                          />
                        </Col>
                        {/* Jamabandi */}
                        <Col md={3}>
                          <Form.Label className="mb-1 small">
                            {ph(
                              "jamabandiLabel",
                              "Jamabandi Status",
                              "जमाबंदी स्थिति",
                            )}
                          </Form.Label>
                          <HindiInput
                            value={seller.jamabandi_status || ""}
                            onChange={(text) =>
                              handleSellerChange(
                                sIndex,
                                "jamabandi_status",
                                text,
                              )
                            }
                            placeholder={ph(
                              "jamabandiStatus",
                              "Enter Jamabandi Status",
                              "जमाबंदी स्थिति दर्ज करें",
                            )}
                            fontMode={FontValue}
                            maxLength={50}
                            className="form-control-sm hindi-input-custom"
                          />
                        </Col>
                        <Col md={3}>
                          <Form.Label className="mb-1 small">
                            {ph(
                              "girdawariLabel",
                              "Girdawari Status",
                              "गिरदावरी स्थिति",
                            )}
                          </Form.Label>
                          <HindiInput
                            value={seller.girdawari_status || ""}
                            onChange={(text) =>
                              handleSellerChange(
                                sIndex,
                                "girdawari_status",
                                text,
                              )
                            }
                            placeholder={ph(
                              "girdawariStatus",
                              "Enter Girdawari Status",
                              "गिरदावरी स्थिति दर्ज करें",
                            )}
                            fontMode={FontValue}
                            maxLength={50}
                            className="form-control-sm hindi-input-custom"
                          />
                        </Col>{" "}
                        {/* ===== Mutation / Jamabandi / Girdawari (Seller wise) ===== */}
                        <Row className="my-2">
                          {/* Mutation */}

                          {/* Girdawari */}
                        </Row>
                        <Col
                          md={2}
                          className="d-flex align-items-center ms-auto justify-content-end"
                        >
                          {(formData.sellers || []).length > 1 &&
                            sIndex > 0 && (
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => removeSeller(sIndex)}
                                className="remove-seller-btn"
                                style={{ minWidth: 90 }}
                              >
                                {ph("removeSeller", "Remove", "हटाएँ")}
                              </Button>
                            )}
                        </Col>
                      </Row>
                    </>
                  )}

                  {/* ====== WHEN COMPANY SELECTED (COMPANY DETAILS SAME AS BUYER COMPANY STYLE) ====== */}
                  {isHolder && (
                    <>
                      {/* Row 1: Company Name + Director Name + Age */}
                      <Row className="mb-2 ">
                        <Col md={3}>
                          <Form.Label className="mb-1 small">
                            {ph(
                              "sellerCompanyNameLabel",
                              "Company Name",
                              "कंपनी का नाम",
                            )}
                          </Form.Label>
                          <HindiInput
                            value={seller.seller_name}
                            onChange={(text) =>
                              handleSellerChange(sIndex, "seller_name", text)
                            }
                            placeholder={ph(
                              "sellerCompanyNamePh",
                              "Enter Company Name",
                              "कंपनी का नाम दर्ज करें",
                            )}
                            fontMode={FontValue}
                            maxLength={30}
                            required
                            className="form-control-sm hindi-input-custom"
                          />
                          <div style={{ minHeight: "14px" }}>
                            {sellerErrors?.[sIndex]?.seller_name && (
                              <small className="text-danger">
                                {sellerErrors[sIndex].seller_name}
                              </small>
                            )}
                          </div>
                        </Col>

                        <Col md={3}>
                          <Form.Label className="mb-1 small">
                            {ph(
                              "sellerDirectorLabel",
                              "Director Name",
                              "निदेशक का नाम",
                            )}
                          </Form.Label>
                          <HindiInput
                            value={seller.director_name || ""} // ✅ FIX
                            onChange={
                              (text) =>
                                handleSellerChange(
                                  sIndex,
                                  "director_name",
                                  text,
                                ) // ✅ FIX
                            }
                            placeholder={ph(
                              "sellerDirectorNamePh",
                              "Enter Director Name",
                              "निदेशक का नाम दर्ज करें",
                            )}
                            fontMode={FontValue}
                            maxLength={30}
                            className="form-control-sm hindi-input-custom"
                          />
                        </Col>

                        <Col md={1}>
                          <Form.Label className="mb-1 small">
                            {ph("sellerCompanyAgeLabel", "Age", "उम्र")}
                          </Form.Label>
                          <Form.Control
                            type="text"
                            value={seller.age || ""}
                            onChange={(e) => {
                              const onlyNums = e.target.value
                                .replace(/\D/g, "")
                                .slice(0, 3);
                              handleSellerChange(sIndex, "age", onlyNums);
                            }}
                            className="form-control-sm hindi-input-custom"
                            placeholder={ph(
                              "age",
                              "Enter Age",
                              "उम्र दर्ज करें",
                            )}
                            maxLength={3}
                          />
                        </Col>

                        <Col md={2}>
                          <Form.Label className="mb-1 small">
                            {ph(
                              "sellerCompanyAadhaarLabel",
                              "Aadhaar Number*",
                              "आधार नंबर*",
                            )}
                          </Form.Label>
                          <Form.Control
                            type="text"
                            inputMode="numeric"
                            value={seller.aadhaar || ""}
                            onChange={(e) => {
                              const digits = e.target.value
                                .replace(/\D/g, "")
                                .slice(0, 12);
                              const formatted = digits
                                .replace(/(.{4})/g, "$1 ")
                                .trim();
                              handleSellerChange(sIndex, "aadhaar", formatted);
                            }}
                            className="form-control-sm hindi-input-custom"
                            maxLength={14}
                            placeholder={ph(
                              "sellerCompanyAadhaarPh",
                              "Enter Aadhaar Number*",
                              "आधार संख्या दर्ज करें*",
                            )}
                          />
                          <div style={{ minHeight: "14px" }}>
                            {sellerErrors?.[sIndex]?.aadhaar && (
                              <small className="text-danger">
                                {sellerErrors[sIndex].aadhaar}
                              </small>
                            )}
                          </div>
                        </Col>
                        <Col md={3}>
                          <Form.Label className="mb-1 small">
                            {ph(
                              "sellerCompanyPanLabel",
                              "PAN Number*",
                              "पैन नंबर*",
                            )}
                          </Form.Label>
                          <Form.Control
                            type="text"
                            value={seller.pan || ""}
                            onChange={(e) =>
                              handleSellerChange(
                                sIndex,
                                "pan",
                                e.target.value.toUpperCase().slice(0, 10),
                              )
                            }
                            className="form-control-sm hindi-input-custom"
                            maxLength={10}
                            placeholder={ph(
                              "sellerCompanyPanPh",
                              "Enter PAN Number*",
                              "पैन नंबर दर्ज करें*",
                            )}
                          />
                          <div style={{ minHeight: "14px" }}>
                            {sellerErrors?.[sIndex]?.pan && (
                              <small className="text-danger">
                                {sellerErrors[sIndex].pan}
                              </small>
                            )}
                          </div>
                        </Col>
                      </Row>

                      {/* Row 2: Aadhaar, PAN, Mobile, Reference */}
                      <Row className="mb-2 align-items-center">
                        <Col md={3}>
                          <Form.Label className="mb-1 small">
                            {ph(
                              "sellerCompanyMobileLabel",
                              "Mobile Number*",
                              "मोबाइल नंबर*",
                            )}
                          </Form.Label>
                          <Form.Control
                            type="text"
                            inputMode="numeric"
                            value={seller.mobile || ""}
                            onChange={(e) => {
                              const onlyNums = e.target.value
                                .replace(/\D/g, "")
                                .slice(0, 10);
                              handleSellerChange(sIndex, "mobile", onlyNums);
                            }}
                            className="form-control-sm hindi-input-custom"
                            maxLength={10}
                            placeholder={ph(
                              "sellerCompanyMobilePh",
                              "Enter Mobile Number*",
                              "मोबाइल नंबर दर्ज करें*",
                            )}
                          />
                          {sellerErrors?.[sIndex]?.mobile && (
                            <div className="text-danger small mt-1">
                              {sellerErrors[sIndex].mobile}
                            </div>
                          )}
                        </Col>

                        <Col md={3}>
                          <Form.Label className="mb-1 small">
                            {ph(
                              "sellerCompanyAddressLabel",
                              "Company Address",
                              "कंपनी का पता",
                            )}
                          </Form.Label>
                          <HindiInput
                            value={seller.address || ""}
                            onChange={(text) =>
                              handleSellerChange(sIndex, "address", text)
                            }
                            placeholder={ph(
                              "sellerCompanyAddressPh",
                              "Enter Company Address",
                              "कंपनी का पता दर्ज करें",
                            )}
                            fontMode={FontValue}
                            maxLength={50}
                            className="form-control-sm hindi-input-custom"
                          />
                        </Col>

                        <Col md={3}>
                          <Form.Label className="mb-1 small">
                            {ph(
                              "poaHolderLabel",
                              "POA Holder Name",
                              "POA धारक का नाम",
                            )}
                          </Form.Label>
                          <HindiInput
                            value={seller.poa_holder_name || ""}
                            onChange={(text) =>
                              handleSellerChange(
                                sIndex,
                                "poa_holder_name",
                                text,
                              )
                            }
                            placeholder={ph(
                              "poaHolderPh",
                              "Enter POA Holder Name",
                              "POA धारक का नाम दर्ज करें",
                            )}
                            fontMode={FontValue}
                            maxLength={30}
                            className="form-control-sm hindi-input-custom"
                          />
                        </Col>

                        <Col md={3}>
                          <Form.Label className="mb-1 small">
                            {ph(
                              "sellerCompanyReferenceLabel",
                              "Reference / Remark",
                              "संदर्भ / टिप्पणी",
                            )}
                          </Form.Label>
                          <HindiInput
                            value={seller.reference || ""}
                            onChange={(text) =>
                              handleSellerChange(sIndex, "reference", text)
                            }
                            placeholder={ph(
                              "sellerCompanyReferencePh",
                              "Reference / Remark",
                              "संदर्भ / टिप्पणी",
                            )}
                            fontMode={FontValue}
                            maxLength={50}
                            className="form-control-sm hindi-input-custom"
                          />
                        </Col>
                      </Row>

                      {/* ===== Mutation / Jamabandi / Girdawari (Seller wise) ===== */}
                      <Row className="mb-2">
                        {/* Mutation */}
                        <Col md={4}>
                          <Form.Label className="mb-1 small">
                            {ph(
                              "mutationLabel",
                              "Mutation Status",
                              "म्युटेशन स्थिति",
                            )}
                          </Form.Label>
                          <HindiInput
                            value={seller.mutation_status || ""}
                            onChange={(text) =>
                              handleSellerChange(
                                sIndex,
                                "mutation_status",
                                text,
                              )
                            }
                            placeholder={ph(
                              "mutationStatus",
                              "Enter Mutation Status",
                              "म्युटेशन स्थिति दर्ज करें",
                            )}
                            fontMode={FontValue}
                            maxLength={50}
                            className="form-control-sm hindi-input-custom"
                          />
                        </Col>

                        {/* Jamabandi */}
                        <Col md={4}>
                          <Form.Label className="mb-1 small">
                            {ph(
                              "jamabandiLabel",
                              "Jamabandi Status",
                              "जमाबंदी स्थिति",
                            )}
                          </Form.Label>
                          <HindiInput
                            value={seller.jamabandi_status || ""}
                            onChange={(text) =>
                              handleSellerChange(
                                sIndex,
                                "jamabandi_status",
                                text,
                              )
                            }
                            placeholder={ph(
                              "jamabandiStatus",
                              "Enter Jamabandi Status",
                              "जमाबंदी स्थिति दर्ज करें",
                            )}
                            fontMode={FontValue}
                            maxLength={50}
                            className="form-control-sm hindi-input-custom"
                          />
                        </Col>

                        {/* Girdawari */}
                        <Col md={4}>
                          <Form.Label className="mb-1 small">
                            {ph(
                              "girdawariLabel",
                              "Girdawari Status",
                              "गिरदावरी स्थिति",
                            )}
                          </Form.Label>
                          <HindiInput
                            value={seller.girdawari_status || ""}
                            onChange={(text) =>
                              handleSellerChange(
                                sIndex,
                                "girdawari_status",
                                text,
                              )
                            }
                            placeholder={ph(
                              "girdawariStatus",
                              "Enter Girdawari Status",
                              "गिरदावरी स्थिति दर्ज करें",
                            )}
                            fontMode={FontValue}
                            maxLength={50}
                            className="form-control-sm hindi-input-custom"
                          />
                        </Col>
                      </Row>

                      {/* Row 3: Company Address + Area (first company) + Remove Button */}
                      <Row className="align-items-center">
                        <Col md={3}>
                          <Form.Label className="mb-1 small">
                            {ph("sellerAreaLabel", "Area", "एरिया")}
                          </Form.Label>

                          <InputGroup size="sm" className="flex-nowrap">
                            <Form.Control
                              type="text"
                              inputMode="numeric"
                              value={seller.area || ""}
                              onChange={(e) =>
                                handleSellerChange(
                                  sIndex,
                                  "area",
                                  e.target.value.replace(/\D/g, ""),
                                )
                              }
                              className="hindi-input-custom"
                              placeholder={ph(
                                "sellerAreaPh",
                                "Enter Area",
                                "एरिया दर्ज करें",
                              )}
                              maxLength={10}
                            />

                            <Form.Select
                              value={seller.area_type || "Bigha"}
                              onChange={(e) =>
                                handleSellerChange(
                                  sIndex,
                                  "area_type",
                                  e.target.value,
                                )
                              }
                              className="p-0 px-2"
                              style={{ maxWidth: 110 }}
                            >
                              <option value="Bigha">
                                {ph("unitBigha", "Bigha", "बीघा")}
                              </option>
                              <option value="SqFt">
                                {ph("unitSqft", "Sq. Feet", "वर्ग फुट")}
                              </option>
                              <option value="SqM">
                                {ph("unitSqm", "Sq. Mtr", "वर्ग मीटर")}
                              </option>
                              <option value="SqYd">
                                {ph("unitSqyd", "Sq. Yard", "वर्ग गज")}
                              </option>
                              <option value="Hectare">
                                {ph("unitHectare", "Hectare", "हेक्टेयर")}
                              </option>
                            </Form.Select>
                          </InputGroup>
                        </Col>

                        <Col
                          md={2}
                          className="d-flex align-items-center ms-auto justify-content-end"
                        >
                          {(formData.sellers || []).length > 1 &&
                            sIndex > 0 && (
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => removeSeller(sIndex)}
                                className="remove-seller-btn"
                                style={{ minWidth: 90 }}
                              >
                                {ph("removeSeller", "Remove", "हटाएँ")}
                              </Button>
                            )}
                        </Col>
                      </Row>
                    </>
                  )}
                </Card>

                {formData.sellers.length > 1 &&
                  sIndex < formData.sellers.length - 1 && (
                    <hr className="seller-divider" />
                  )}
              </>
            );
          })}

          <div className="mb-2 ">
            <Button
              variant="primary"
              size="sm"
              className="me-2 add-seller-btn"
              onClick={addSeller}
              disabled={(formData.sellers || []).length >= 5}
            >
              + {ph("addSeller", "Add Seller", "विक्रेता जोड़ें")}
            </Button>

            {(formData.sellers || []).length >= 5 && (
              <Form.Text className="text-muted">
                {ph(
                  "maxSellers",
                  "Maximum 5 sellers allowed.",
                  "अधिकतम 5 विक्रेता की अनुमति है।",
                )}
              </Form.Text>
            )}
          </div>
        </Col>
      </Row>

      <hr />

      {/* ===== Buyer Heading ===== */}
      <Row className="mb-1">
        <Col md={12}>
          <h5 className="mb-2 text-primary">
            {ph("buyerHeading", "Buyer Information", "खरीदार की जानकारी")}
          </h5>
        </Col>
      </Row>

      {/* Buyers */}
      <Row className="mb-3">
        <Col md={12}>
          {(formData.buyers || []).map((buyer, index) => {
            const isCompany = (buyer.type || "individual") === "company";

            const nameColMd = isCompany ? 3 : 3;
            const relationColMd = isCompany ? 0 : 1; // will not render if company
            const directorColMd = isCompany ? 3 : 3;
            const ageColMd = isCompany ? 1 : 1;
            const pencard = isCompany ? 3 : 2;

            return (
              <>
                <Card key={index} className="mb-3 p-2 shadow-none no-gap-card">
                  {/* radio selector */}
                  <Row className="mb-2">
                    <Col md={12} className="d-flex justify-content-end">
                      <Form.Check
                        inline
                        label={ph("individualLabel", "Individual", "व्यक्ति")}
                        name={`buyer-type-${index}`}
                        type="radio"
                        id={`buyer-individual-${index}`}
                        checked={!isCompany}
                        onChange={() =>
                          handleBuyerChange(index, "type", "individual")
                        }
                        className="me-2"
                      />
                      <Form.Check
                        inline
                        label={ph("companyLabel", "Company", "कंपनी")}
                        name={`buyer-type-${index}`}
                        type="radio"
                        id={`buyer-company-${index}`}
                        checked={isCompany}
                        onChange={() =>
                          handleBuyerChange(index, "type", "company")
                        }
                      />
                    </Col>
                  </Row>

                  {/* Row 1 */}
                  <Row className="mb-2">
                    {/* ===== Buyer / Company Name ===== */}
                    <Col md={nameColMd} className="d-flex flex-column">
                      <Form.Label className="mb-1">
                        {isCompany
                          ? ph(
                              "companyNameLabel",
                              "Company Name*",
                              "कंपनी का नाम*",
                            )
                          : ph(
                              "buyerNameLabel",
                              "Buyer Name*",
                              "खरीदार का नाम*",
                            )}
                      </Form.Label>

                      <HindiInput
                        value={buyer.name}
                        onChange={(text) =>
                          handleBuyerChange(index, "name", text)
                        }
                        placeholder={
                          isCompany
                            ? ph(
                                "companyName",
                                "Enter Company Name",
                                "कंपनी का नाम दर्ज करें",
                              )
                            : ph(
                                "buyer",
                                `Buyer ${index + 1}`,
                                `खरीदार ${index + 1}`,
                              )
                        }
                        fontMode={FontValue}
                        maxLength={50}
                        className="form-control-sm hindi-input-custom"
                      />

                      {/* 🔴 NAME ERROR (fixed space) */}
                      <div style={{ minHeight: "14px" }}>
                        {buyerErrors?.[index]?.name && (
                          <small className="text-danger">
                            {buyerErrors[index].name}
                          </small>
                        )}
                      </div>
                    </Col>

                    {/* ===== Relation (only individual) ===== */}
                    {!isCompany && (
                      <Col md={relationColMd}>
                        <Form.Label className="mb-1">
                          {ph("relationLabel", "Relation", "संबंध")}
                        </Form.Label>
                        <Form.Select
                          size="sm"
                          value={buyer.relation || "S/O"}
                          onChange={(e) =>
                            handleBuyerChange(index, "relation", e.target.value)
                          }
                          className="form-control-sm"
                        >
                          <option value="S/O">
                            {ph("so", "S/O", "पुत्र / पिता का")}
                          </option>
                          <option value="W/O">
                            {ph("wo", "W/O", "पत्नी / पति का")}
                          </option>
                          <option value="D/O">
                            {ph("do", "D/O", "पुत्री / पिता की")}
                          </option>
                        </Form.Select>
                      </Col>
                    )}

                    {/* ===== Father / Director Name ===== */}
                    <Col md={directorColMd}>
                      <Form.Label className="mb-1">
                        {isCompany
                          ? ph(
                              "directorLabel",
                              "Director Name",
                              "निदेशक का नाम",
                            )
                          : getRelationLabel(
                              buyer.relation || "S/O",
                              FontValue,
                            )}
                      </Form.Label>
                      <HindiInput
                        value={buyer.fatherName}
                        onChange={(text) =>
                          handleBuyerChange(index, "fatherName", text)
                        }
                        placeholder={
                          isCompany
                            ? ph(
                                "directorName",
                                "Enter Director Name",
                                "निदेशक का नाम दर्ज करें",
                              )
                            : getRelationPlaceholder(
                                buyer.relation || "S/O",
                                FontValue,
                              )
                        }
                        fontMode={FontValue}
                        maxLength={50}
                        className="form-control-sm hindi-input-custom"
                      />
                    </Col>

                    {/* ===== Age ===== */}
                    <Col md={ageColMd}>
                      <Form.Label className="mb-1">
                        {ph("ageLabel", "Age", "उम्र")}
                      </Form.Label>
                      <Form.Control
                        type="text"
                        value={buyer.age || ""}
                        onChange={(e) => {
                          const onlyNums = e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 3);
                          handleBuyerChange(index, "age", onlyNums);
                        }}
                        className="form-control-sm hindi-input-custom"
                        placeholder={ph("age", "Enter Age", "उम्र दर्ज करें")}
                        maxLength={3}
                      />
                    </Col>

                    {/* ===== Aadhaar ===== */}
                    <Col md={2} className="d-flex flex-column">
                      <Form.Label className="mb-1">
                        {ph("aadhaarLabel", "Aadhaar Number*", "आधार नंबर*")}
                      </Form.Label>

                      <Form.Control
                        type="text"
                        inputMode="numeric"
                        value={buyer.aadhaar || ""}
                        onChange={(e) => {
                          const digits = e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 12);
                          const formatted = digits
                            .replace(/(.{4})/g, "$1 ")
                            .trim();
                          handleBuyerChange(index, "aadhaar", formatted);
                        }}
                        className="form-control-sm hindi-input-custom"
                        maxLength={14}
                        placeholder={ph(
                          "aadhaar",
                          "Enter Aadhaar Number*",
                          "आधार संख्या दर्ज करें*",
                        )}
                      />

                      {/* 🔴 AADHAAR ERROR (fixed space) */}
                      <div style={{ minHeight: "14px" }}>
                        {buyerErrors?.[index]?.aadhaar && (
                          <small className="text-danger">
                            {buyerErrors[index].aadhaar}
                          </small>
                        )}
                      </div>
                    </Col>

                    <Col md={pencard} className="d-flex flex-column">
                      <Form.Label className="mb-1">
                        {ph("panLabel", "PAN Number*", "पैन नंबर*")}
                      </Form.Label>

                      <Form.Control
                        type="text"
                        value={buyer.pan || ""}
                        onChange={(e) =>
                          handleBuyerChange(
                            index,
                            "pan",
                            e.target.value.toUpperCase().slice(0, 10),
                          )
                        }
                        className="form-control-sm hindi-input-custom"
                        maxLength={10}
                        placeholder={ph(
                          "pan",
                          "Enter PAN Number*",
                          "पैन नंबर दर्ज करें*",
                        )}
                      />

                      {/* 🔴 PAN ERROR (fixed height) */}
                      <div style={{ minHeight: "14px" }}>
                        {buyerErrors?.[index]?.pan && (
                          <small className="text-danger">
                            {buyerErrors[index].pan}
                          </small>
                        )}
                      </div>
                    </Col>

                  </Row>

                  {/* Row 2 */}
                  <Row className="mb-2 ">
                    {/* ===== PAN ===== */}
                    

                    {/* ===== MOBILE ===== */}
                    <Col md={3} className="d-flex flex-column">
                      <Form.Label className="mb-1">
                        {ph("mobileLabel", "Mobile Number*", "मोबाइल नंबर*")}
                      </Form.Label>

                      <Form.Control
                        type="text"
                        inputMode="numeric"
                        value={buyer.mobile || ""}
                        onChange={(e) => {
                          const onlyNums = e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 10);
                          handleBuyerChange(index, "mobile", onlyNums);
                        }}
                        className="form-control-sm hindi-input-custom"
                        maxLength={10}
                        placeholder={ph(
                          "mobile",
                          "Enter Mobile Number*",
                          "मोबाइल नंबर दर्ज करें*",
                        )}
                      />

                      {/* 🔴 MOBILE ERROR (fixed height) */}
                      <div style={{ minHeight: "14px" }}>
                        {buyerErrors?.[index]?.mobile && (
                          <small className="text-danger">
                            {buyerErrors[index].mobile}
                          </small>
                        )}
                      </div>
                    </Col>

                    {/* ===== REFERENCE ===== */}
                    <Col md={4}>
                      <Form.Label className="mb-1">
                        {ph(
                          "referenceLabel",
                          "Reference / Remark",
                          "संदर्भ / टिप्पणी",
                        )}
                      </Form.Label>
                      <HindiInput
                        value={buyer.reference || ""}
                        onChange={(text) =>
                          handleBuyerChange(index, "reference", text)
                        }
                        placeholder={ph(
                          "reference",
                          "Reference / Remark",
                          "संदर्भ / टिप्पणी",
                        )}
                        fontMode={FontValue}
                        maxLength={30}
                        className="form-control-sm hindi-input-custom"
                      />
                    </Col>

                    {/* ===== ADDRESS ===== */}
                    <Col md={5}>
                      <Form.Label className="mb-1">
                        {ph("addressLabel", "Address", "पता")}
                      </Form.Label>
                      <HindiInput
                        value={buyer.address || ""}
                        onChange={(text) =>
                          handleBuyerChange(index, "address", text)
                        }
                        placeholder={ph(
                          "address",
                          "Enter Address",
                          "पता दर्ज करें",
                        )}
                        fontMode={FontValue}
                        maxLength={50}
                        className="form-control-sm hindi-input-custom"
                      />
                    </Col>
                  </Row>

                  {/* Row 3 — Address + Area (only once) + Remove Button */}
                  {/* ===== Buyer Land Record Status ===== */}
                  <Row className="mb-2">
                    {/* Mutation */}

                    <Col md={3}>
                      <Form.Label className="mb-1">
                        {ph("buyerAreaLabel", "Area", "एरिया")}
                      </Form.Label>

                      <InputGroup size="sm" className="flex-nowrap">
                        <Form.Control
                          type="text"
                          inputMode="decimal"
                          value={buyer.area || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            // केवल numbers और एक ही decimal point allow
                            const valid = value.match(/^\d*\.?\d*$/);
                            if (valid) {
                              handleBuyerChange(index, "area", value);
                            }
                          }}
                          className="hindi-input-custom"
                          placeholder={ph(
                            "buyerAreaPh",
                            "Enter Area",
                            "एरिया दर्ज करें",
                          )}
                          maxLength={10}
                        />

                        <Form.Select
                          value={buyer.area_type || "Bigha"}
                          onChange={(e) =>
                            handleBuyerChange(
                              index,
                              "area_type",
                              e.target.value,
                            )
                          }
                          className="p-0 px-2"
                          style={{ maxWidth: 110 }}
                        >
                          <option value="Bigha">
                            {ph("unitBigha", "Bigha", "बीघा")}
                          </option>
                          <option value="SqFt">
                            {ph("unitSqft", "Sq. Feet", "वर्ग फुट")}
                          </option>
                          <option value="SqM">
                            {ph("unitSqm", "Sq. Mtr", "वर्ग मीटर")}
                          </option>
                          <option value="SqYd">
                            {ph("unitSqyd", "Sq. Yard", "वर्ग गज")}
                          </option>
                          <option value="Hectare">
                            {ph("unitHectare", "Hectare", "हेक्टेयर")}
                          </option>
                        </Form.Select>
                      </InputGroup>
                    </Col>
                    <Col md={3}>
                      <Form.Label className="mb-1 small">
                        {ph(
                          "mutationLabel",
                          "Mutation Status",
                          "म्युटेशन स्थिति",
                        )}
                      </Form.Label>
                      <HindiInput
                        value={buyer.mutation_status || ""}
                        onChange={(text) =>
                          handleBuyerChange(index, "mutation_status", text)
                        }
                        placeholder={ph(
                          "mutationStatus",
                          "Enter Mutation Status",
                          "म्युटेशन स्थिति दर्ज करें",
                        )}
                        fontMode={FontValue}
                        maxLength={50}
                        className="form-control-sm hindi-input-custom"
                      />
                    </Col>

                    {/* Jamabandi */}
                    <Col md={3}>
                      <Form.Label className="mb-1 small">
                        {ph(
                          "jamabandiLabel",
                          "Jamabandi Status",
                          "जमाबंदी स्थिति",
                        )}
                      </Form.Label>
                      <HindiInput
                        value={buyer.jamabandi_status || ""}
                        onChange={(text) =>
                          handleBuyerChange(index, "jamabandi_status", text)
                        }
                        placeholder={ph(
                          "jamabandiStatus",
                          "Enter Jamabandi Status",
                          "जमाबंदी स्थिति दर्ज करें",
                        )}
                        fontMode={FontValue}
                        maxLength={50}
                        className="form-control-sm hindi-input-custom"
                      />
                    </Col>

                    {/* Girdawari */}
                    <Col md={3}>
                      <Form.Label className="mb-1 small">
                        {ph(
                          "girdawariLabel",
                          "Girdawari Status",
                          "गिरदावरी स्थिति",
                        )}
                      </Form.Label>
                      <HindiInput
                        value={buyer.girdawari_status || ""}
                        onChange={(text) =>
                          handleBuyerChange(index, "girdawari_status", text)
                        }
                        placeholder={ph(
                          "girdawariStatus",
                          "Enter Girdawari Status",
                          "गिरदावरी स्थिति दर्ज करें",
                        )}
                        fontMode={FontValue}
                        maxLength={50}
                        className="form-control-sm hindi-input-custom"
                      />
                    </Col>
                  </Row>

                  <Row className="">
                    

                    <Col
                      md={2}
                      className="d-flex align-items-center ms-auto justify-content-end"
                    >
                      {index > 0 && (
                        <Button
                          variant="danger"
                          size="sm"
                          className="remove-buyer-btn"
                          style={{ minWidth: 120 }}
                          onClick={() => removeBuyer(index)}
                        >
                          {ph("removeBuyerBtn", "Remove Buyer", "खरीदार हटाएँ")}
                        </Button>
                      )}
                    </Col>
                  </Row>
                </Card>

                {formData.buyers.length > 1 &&
                  index < formData.buyers.length - 1 && (
                    <hr className="buyer-divider" />
                  )}
              </>
            );
          })}

          <Button
            variant="primary"
            size="sm"
            className="add-buyer-btn"
            disabled={(formData.buyers || []).length >= 5}
            onClick={addBuyer}
          >
            + {ph("addBuyer", "Add Buyer", "खरीदार जोड़ें")}
          </Button>

          {(formData.buyers || []).length >= 5 && (
            <Form.Text className="text-muted">
              {ph(
                "maxBuyers",
                "Maximum 5 buyers allowed.",
                "अधिकतम 5 खरीदार की अनुमति है।",
              )}
            </Form.Text>
          )}
        </Col>
      </Row>
    </>
  );
}

export default SellerBuyerSection;
