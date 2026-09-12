import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import mammoth from "mammoth";
import { Button } from "react-bootstrap";
import html2pdf from "html2pdf.js";
import "./style.css";

import PizZip from "pizzip";
import { DOMParser as XMLDOMParser } from "@xmldom/xmldom";

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  ImageRun,       // added
  VerticalAlign, 
} from "docx";

import { saveAs } from "file-saver";
// NOTE: API_BASE_URL kept if you still want server checks elsewhere
import { API_BASE_URL } from "config/constant";

function Index() {
  const location = useLocation();
  const [editorData, setEditorData] = useState("");
  const row = location.state?.row;
  const data = location.state?.data;

   console.log(data,'data.....')

  const escapeRegExp = (string) => {
    return String(string).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  };
  const fetchImageAsUint8 = async (url) => {
  const res = await fetch(url);
  const blob = await res.blob();
  const buffer = await blob.arrayBuffer();
  return new Uint8Array(buffer);
};

 

  useEffect(() => {
    if (!data?.fileUrl) return;

    fetch(data.fileUrl)
      .then((res) => res.blob())
      .then((blob) => {
        const reader = new FileReader();

        reader.onload = async () => {
          const arrayBuffer = reader.result;
          let headerHTML = "";

          try {
            const zip = new PizZip(arrayBuffer);

            // 1️⃣ HEADER TEXT + IMAGE (your existing header extraction)
            const headerFile = zip.file("word/header1.xml");
            if (headerFile) {
              const headerXML = headerFile.asText();
              const parser = new XMLDOMParser();
              const xmlDoc = parser.parseFromString(headerXML, "text/xml");

              const texts = xmlDoc.getElementsByTagName("w:t");
              const lines = [];
              for (let i = 0; i < texts.length; i++) {
                const txt = (texts[i].textContent || "").trim();
                if (txt) lines.push(txt);
              }
              const headerTextHtml = lines.join("<br />");

              // ----- CHANGED: prefer data.company_logo (or data.data.company_logo) over extracted image -----
              let headerImageHTML = "";

              const companyLogo =
                (data && data.data && data.data.company_logo) ||
                (data && data.company_logo) ||
                null;

              if (companyLogo) {
                // use provided company_logo (can be data URL or absolute URL)
                headerImageHTML = `<img src="${API_BASE_URL}/uploads/${companyLogo}" class="patta-logo" />`;

              } else {
                // fallback to extracting image from header1.xml (existing behaviour)
                const blip = xmlDoc.getElementsByTagName("a:blip")[0];
                const rId = blip ? blip.getAttribute("r:embed") : null;

                if (rId) {
                  const relsXML =
                    zip.file("word/_rels/header1.xml.rels")?.asText() || "";
                  if (relsXML) {
                    const relsDoc = parser.parseFromString(relsXML, "text/xml");
                    const rels = relsDoc.getElementsByTagName("Relationship");
                    let imagePath = "";

                    for (let i = 0; i < rels.length; i++) {
                      if (rels[i].getAttribute("Id") === rId) {
                        imagePath = "word/" + rels[i].getAttribute("Target");
                        break;
                      }
                    }

                    if (imagePath) {
                      const imgFile = zip.file(imagePath);
                      if (imgFile) {
                        const base64 = imgFile.asBinary();
                        const mime = imagePath.endsWith(".png")
                          ? "image/png"
                          : imagePath.endsWith(".jpg") ||
                            imagePath.endsWith(".jpeg")
                          ? "image/jpeg"
                          : "image/png";

                        headerImageHTML = `<img src="data:${mime};base64,${btoa(
                          base64
                        )}" class="patta-logo" />`;
                      }
                    }
                  }
                }
              }

              if (headerTextHtml || headerImageHTML) {
                headerHTML = `
  <div class="word-header-wrapper" style="position:relative; margin-bottom:8px; padding-top:4px; padding-bottom:4px;">
    <div style="position:absolute; left:0; top:0;">
      ${headerImageHTML}
    </div>

    <div style="width:100%; display:block; text-align:center;">
      <div class="word-header-text" style="display:inline-block; max-width:85%; vertical-align:middle;">
        ${headerTextHtml}
      </div>
    </div>
  </div>
  <div style="border-bottom:1px solid #000; margin-bottom:10px;"></div>
  `;
              }
            }
          } catch (err) {
            console.error("HEADER READ ERROR:", err);
          }

          // 2️⃣ BODY READ USING MAMMOTH (structure same)
          mammoth
            .convertToHtml(
              { arrayBuffer },
              {
                includeDefaultStyleMap: true,
                styleMap: ["table => table.m-table", "tr => tr", "td => td", "th => th"],
              }
            )
            .then((result) => {
              const parser = new DOMParser();
              const doc = parser.parseFromString(result.value || "", "text/html");

              // ensure all tables have m-table class
              const allTables = doc.querySelectorAll("table");
              allTables.forEach((t) => t.classList.add("m-table"));

              // remove 'sprate' if present
              doc.body.innerHTML = doc.body.innerHTML.replace(/\bsprate\b/gi, "");

              // keep only first 3 tables
              const tablesArray = Array.from(doc.querySelectorAll("table"));
              tablesArray.forEach((t, idx) => {
                if (idx > 2) {
                  t.remove();
                }
              });

              // normalize tables
              const keptTables = doc.querySelectorAll("table.m-table");
              keptTables.forEach((t) => {
                t.style.width = "100%";
                t.style.borderCollapse = "collapse";
                t.style.tableLayout = "fixed";
                t.style.margin = "12px 0";

                const cells = t.querySelectorAll("td, th");
                const firstRow = t.rows && t.rows[0];
                let colsCount = 4;
                if (firstRow) colsCount = Math.max(1, firstRow.cells.length);
                const percent = Math.floor(100 / colsCount);

                cells.forEach((cell) => {
                  cell.style.width = `${percent}%`;
                  cell.style.wordBreak = "break-word";
                  cell.style.textAlign = "center";
                  cell.style.padding = "6px 8px";
                  if (!cell.style.border) cell.style.border = "1px solid #000";
                });
              });

              let bodyHTML = doc.body.innerHTML || "";

              // project name / company / tagline / khasra / recipient injections (unchanged)
              try {
                const projectName =
                  (data && data.data && data.data.project_name) || (data && data.project_name) || "";
                if (projectName && projectName.trim()) {
                  const escaped = escapeRegExp(projectName.trim());
                  const regex = new RegExp(escaped);
                  if (regex.test(bodyHTML)) {
                    bodyHTML = bodyHTML.replace(regex, `<h2 class="project-name">${projectName.trim()}</h2>`);
                  } else if (headerHTML && regex.test(headerHTML)) {
                    headerHTML = headerHTML.replace(regex, `<h2 class="project-name">${projectName.trim()}</h2>`);
                  }
                }
              } catch (e) {
                console.warn("project name wrap error", e);
              }

              try {
                let companyName =
                  (data && data.data && data.data.company_name) || (data && data.company_name) || "";
                if (companyName && companyName.trim()) {
                  const escapedCompany = escapeRegExp(companyName.trim());
                  const compRegex = new RegExp(escapedCompany);
                  if (compRegex.test(bodyHTML)) {
                    bodyHTML = bodyHTML.replace(compRegex, `<h3 class="company-name">${companyName.trim()}</h3>`);
                  } else if (headerHTML && compRegex.test(headerHTML)) {
                    headerHTML = headerHTML.replace(compRegex, `<h3 class="company-name">${companyName.trim()}</h3>`);
                  }
                }
              } catch (e) {
                console.warn("company name wrap error", e);
              }

              try {
                const explicitTagline =
                  (data && data.data && (data.data.tagline || data.data.project_tagline)) ||
                  (data && (data.tagline || data.project_tagline)) ||
                  null;

                const defaultTagline = "(RESIDENTIAL TOWNSHIP)";
                const taglineToUse = explicitTagline ? String(explicitTagline).trim() : defaultTagline;

                if (taglineToUse) {
                  const escapedTag = escapeRegExp(taglineToUse);
                  const taglineRegex = new RegExp(escapedTag);
                  if (taglineRegex.test(bodyHTML)) {
                    bodyHTML = bodyHTML.replace(taglineRegex, `<div class="project-tagline">${taglineToUse}</div>`);
                  } else if (headerHTML && taglineRegex.test(headerHTML)) {
                    headerHTML = headerHTML.replace(taglineRegex, `<div class="project-tagline">${taglineToUse}</div>`);
                  } else {
                    if (projectName && projectName.trim()) {
                      const projectWrapped = `<h2 class="project-name">${projectName.trim()}</h2>`;
                      if (bodyHTML.includes(projectWrapped)) {
                        bodyHTML = bodyHTML.replace(projectWrapped, `${projectWrapped}<div class="project-tagline">${taglineToUse}</div>`);
                      }
                    }
                  }
                }
              } catch (e) {
                console.warn("tagline wrap error", e);
              }

              try {
                const khasraVal =
                  (data && data.data && (data.data.khasra_no || data.data.khasraNumber)) ||
                  (data && (data.khasra_no || data.khasraNumber)) ||
                  (row && row.khasra_no) ||
                  "";

                const displayKhasra = `Khasra Number ${khasraVal} (Min) Village Nathusar, Bikaner`;
                const khasraRegex = /Khasra\s+Number[\s\S]*?(?=<|$|\n)/i;

                if (khasraRegex.test(bodyHTML)) {
                  bodyHTML = bodyHTML.replace(khasraRegex, `<div class="khasra-line">${displayKhasra}</div>`);
                } else if (headerHTML && khasraRegex.test(headerHTML)) {
                  headerHTML = headerHTML.replace(khasraRegex, `<div class="khasra-line">${displayKhasra}</div>`);
                } else {
                  if (bodyHTML.includes('<div class="project-tagline">')) {
                    bodyHTML = bodyHTML.replace(
                      /(\u003Cdiv class=\\"project-tagline\\">[\s\S]*?\u003C\/div>)/,
                      `$1<div class=\"khasra-line\">${displayKhasra}</div>`
                    );
                  } else if (bodyHTML.includes(`<h2 class=\"project-name\">`)) {
                    bodyHTML = bodyHTML.replace(
                      /(<h2 class=\"project-name\">[\s\S]*?<\/h2>)/,
                      `$1<div class=\"khasra-line\">${displayKhasra}</div>`
                    );
                  } else {
                    bodyHTML = `<div class="khasra-line">${displayKhasra}</div>` + bodyHTML;
                  }
                }
              } catch (e) {
                console.warn("khasra center inject error", e);
              }

              // Allotment formatting
              try {
                bodyHTML = bodyHTML.replace(
                  /(Allotment\s*No\.[\s\S]*?)(Date[:\s\-–—]*[^\n<]*)/i,
                  (match, left, right) => {
                    const leftTrim = left ? left.trim() : "";
                    const rightTrim = right ? right.trim() : "";
                    return `<div class="allotment-line"><div class="allot-left">${leftTrim}</div><div class="allot-right">${rightTrim}</div></div>`;
                  }
                );

                headerHTML = headerHTML.replace(
                  /(Allotment\s*No\.[\s\S]*?)(Date[:\s\-–—]*[^\n<]*)/i,
                  (match, left, right) => {
                    const leftTrim = left ? left.trim() : "";
                    const rightTrim = right ? right.trim() : "";
                    return `<div class="allotment-line"><div class="allot-left">${leftTrim}</div><div class="allot-right">${rightTrim}</div></div>`;
                  }
                );
              } catch (e) {
                console.warn("allotment left/right error", e);
              }

              // recipient injection
              try {
                const custName = row?.customer_name ? String(row.customer_name).trim() : "";
                const relation = row?.relation_prefix ? String(row.relation_prefix).trim() : "S/O";
                const father = row?.customer_father_name ? String(row.customer_father_name).trim() : "";
                const addr = row?.customer_address ? String(row.customer_address).trim() : "";

                const relationLine =
                  relation && father ? `${relation} ${father}` : father ? `${father}` : relation ? `${relation}` : "";

                const recipientHTML = `
                  <div class="recipient-block">
                    ${custName ? `<div class="rec-name">${custName}</div>` : ""}
                    ${relationLine ? `<div class="rec-relation">${relationLine}</div>` : ""}
                    ${addr ? `<div class="rec-address">${addr}</div>` : ""}
                  </div>
                `;

                const dearIndex = bodyHTML.search(/Dear\s+Sir(?:\/Madam)?/i);
                if (dearIndex >= 0) {
                  let before = bodyHTML.slice(0, dearIndex);
                  const after = bodyHTML.slice(dearIndex);
                  before = before.replace(/(?:\s*<(?:p|div)[^>]*>[\s\S]*?<\/(?:p|div)>){1,6}\s*$/i, "");
                  bodyHTML = before + recipientHTML + after;
                } else {
                  bodyHTML = bodyHTML.replace(
                    /((?:\s*<(?:p|div)[^>]*>[\s\S]*?<\/(?:p|div)>){2,4})/,
                    (m) => {
                      return recipientHTML;
                    }
                  );
                }
              } catch (e) {
                console.warn("recipient inject error", e);
              }

              // ---------- ADD BUYER BLOCK IMMEDIATELY AFTER LAST TABLE ----------
              try {
                const buyerName = (row && (row.buyer_name || row.customer_name)) || "";
                const buyerRelation = (row && (row.buyer_relation || row.relation_prefix)) || "S/O";

                 

                  console.log(buyerRelation )
                const buyerFather = (row && row.buyer_father_name) || (row && row.customer_father_name) || "";
                const buyerAddr = (row && (row.buyer_address || row.customer_address)) || "";

                // *** FIX: add kruti-dev class to buyer-block-wrapper when krutiDev_font === "1" ***
                const isKruti = (
                  ((data && data.data && data.data.krutiDev_font) || (data && data.krutiDev_font) || "")
                    .toString() === "1"
                );

                const buyerHTML = `
                  <div class="buyer-block-wrapper${isKruti ? " kruti-dev" : ""}" style="overflow:auto; margin-top:10px; padding-top:6px;">
                    <div style="width:48%; float:left; text-align:left;  margin-bottom:30px">

                      ${buyerName ? `<div class="buyer-name" style="font-weight:700; margin-bottom:4px;">${buyerName}</div>` : "---"}
                      ${buyerRelation || buyerFather ? `<div class="buyer-relation" style="margin-bottom:4px;">${buyerRelation} ${buyerFather}</div>` : "----"}
                      ${buyerAddr ? `<div class="buyer-address" style="margin-bottom:px; max-width:100%;">${buyerAddr}</div>` : "---"}
                    </div>
                    <div style="width:52%; float:right; text-align:right;"></div>
                    <div style="clear:both;"></div>
                  </div>
                `;

                const lastTable = bodyHTML.lastIndexOf("</table>");
                if (lastTable !== -1) {
                  bodyHTML = bodyHTML.slice(0, lastTable + 8) + buyerHTML + bodyHTML.slice(lastTable + 8);
                } else {
                  bodyHTML = bodyHTML + buyerHTML;
                }
              } catch (e) {
                console.warn("buyer inject error", e);
              }
              // ---------- END BUYER BLOCK ----------

              setEditorData(headerHTML + bodyHTML);
            })
            .catch((err) => console.error("mammoth convert error:", err));
        };

        reader.readAsArrayBuffer(blob);
      })
      .catch((err) => console.error("fetch file error:", err));
  }, [data, row]);

  // PDF: use html2pdf on the visible pdf-container so PDF looks same as UI
  const downloadPDF = async () => {
    if (!row) return;

    // If you still need to call server to validate permission, you can do it here.
    // For now we skip server-check and directly create PDF from UI.
    try {
      const editorElement = document.querySelector(".pdf-container");
      if (!editorElement) return;

      const originalFontSize = editorElement.style.fontSize;
      editorElement.style.fontSize = "14px";

      await html2pdf()
        .from(editorElement)
        .set({
          
          filename: `Allotments${row?.booking_id || "doc"}.pdf`,
          html2canvas: { scale: 1, letterRendering: true, useCORS: true },
          jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
        })
        .save();

      editorElement.style.fontSize = originalFontSize || "";
    } catch (err) {
      console.error("PDF error:", err);
      alert("PDF generation failed. Open console for details.");
    }
  };


const downloadDocx = async () => {
  try {
    const editor = document.querySelector(".ql-editor");
    if (!editor) return;

    const htmlDoc = new DOMParser().parseFromString(
      editor.innerHTML || "",
      "text/html"
    );

    const children = [];

    /* ================= HEADER ================= */
    const header = htmlDoc.querySelector(".word-header-wrapper");

    if (header) {
      const img = header.querySelector("img");
      const headerText = header.querySelector(".word-header-text");

      let logoPara = new Paragraph("");

      if (img?.src) {
        let buffer;
        if (img.src.startsWith("data:")) {
          const b64 = img.src.split(",")[1];
          buffer = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
        } else {
          const res = await fetch(img.src);
          buffer = new Uint8Array(await res.arrayBuffer());
        }

        logoPara = new Paragraph({
          children: [
            new ImageRun({
              data: buffer,
              transformation: { width: 60, height: 60 },
            }),
          ],
          alignment: AlignmentType.LEFT,
        });
      }

      const lines = headerText
        ? headerText.innerHTML
            .split("<br>")
            .map(t => t.replace(/<[^>]*>/g, "").trim())
            .filter(Boolean)
        : [];

      const textParas = lines.map((l, i) =>
        new Paragraph({
          children: [
            new TextRun({
              text: l,
              bold: true,
              size: i === 0 ? 28 : 20,
            }),
          ],
          alignment: AlignmentType.CENTER,
        })
      );

      children.push(
  new Table({
     width: { size: 10000, type: WidthType.DXA },
    borders: {
      top: { style: BorderStyle.NONE },
      bottom: { style: BorderStyle.NONE },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.NONE },
      insideVertical: { style: BorderStyle.NONE },
    },

    rows: [
      new TableRow({
        children: [
          // LOGO – LEFT (same)
          new TableCell({
            width: { size: 20, type: WidthType.PERCENTAGE },
            children: [logoPara],
          }),

          // COMPANY NAME + ADDRESS – TRUE CENTER
          new TableCell({
            width: { size: 80, type: WidthType.PERCENTAGE },
            children: textParas, // already center aligned
          }),

          // EMPTY RIGHT – balance
          
        ],
      }),
    ],
  })
);

      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: "────────────────────────────────────────────────────────────────────────" }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 240 },
        })
      );
    }

    /* ================= BODY ================= */
   Array.from(htmlDoc.body.children).forEach(node => {
  if (node.classList?.contains("word-header-wrapper")) return;

  /* ===== RECIPIENT (FIRST BUYER) – FIXED PLACE ===== */
  if (node.classList.contains("recipient-block")) {
    ["rec-name", "rec-relation", "rec-address"].forEach(cls => {
      const v = node.querySelector("." + cls)?.textContent?.trim();
      if (v) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: v, size: 20 })],
            alignment: AlignmentType.LEFT,
          })
        );
      }
    });

    // Dear Sir/Madam – FIRST BUYER KE NICHE
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "Dear Sir/Madam,",
            size: 20,
            bold: true,
          }),
        ],
        alignment: AlignmentType.LEFT,
        spacing: { before: 120, after: 200 },
      })
    );

    return;
  }

  /* ===== TEXT (AB BAAD ME) ===== */
  var text = node.textContent?.replace(/\s+/g, " ").trim();
  if (!text) return;

  // skip footer duplicate text
  if (
    /SHREE\s+GANESH/i.test(text) ||
    /Authorized\s+Signatory/i.test(text)
  ) {
    return;
  }

  /* ===== TABLE ===== */
 if (node.nodeName === "TABLE") {
  const TOTAL_WIDTH = 9700;
  const colCount = node.rows[0]?.cells.length || 1;
  const colWidth = Math.floor(TOTAL_WIDTH / colCount);

  const rows = Array.from(node.rows).map(r =>
    new TableRow({
      children: Array.from(r.cells).map((cell, idx) => {
        const t = cell.innerText.replace(/\s+/g, " ").trim();
        return new TableCell({
          width: { size: colWidth, type: WidthType.DXA },
          verticalAlign: VerticalAlign.CENTER,
          margins: { top: 120, bottom: 120, left: 200, right: 200 },
          children: [
            new Paragraph({
              children: [new TextRun({ text: t || " ", size: 20 })],
              alignment:
                idx === 0 ? AlignmentType.LEFT : AlignmentType.CENTER,
              spacing: { line: 360 },
            }),
          ],
        });
      }),
    })
  );

  // ===== TABLE (LEFT MARGIN FIXED) =====
  children.push(
    new Table({
      alignment: AlignmentType.LEFT,
      indent: {
        size: 240,              // ⭐ LEFT MARGIN (adjust 240–720)
        type: WidthType.DXA,
      },
      rows,
      layout: "fixed",
      width: { size: TOTAL_WIDTH, type: WidthType.DXA },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 2 },
        bottom: { style: BorderStyle.SINGLE, size: 2 },
        left: { style: BorderStyle.SINGLE, size: 2 },
        right: { style: BorderStyle.SINGLE, size: 2 },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 2 },
        insideVertical: { style: BorderStyle.SINGLE, size: 2 },
      },
    })
  );

  // ===== GAP AFTER TABLE (SAME AS BEFORE) =====
  children.push(
    new Paragraph({
      children: [new TextRun({ text: "" })],
      spacing: { after: 160 },
    })
  );

  return;
}

  /* ===== FIX: buyer merged line below table ===== */
  const buyerMatch = text.match(/(.+?)\s+(S\/O\s+.+?)\s+(बीकानेर)/);
  if (buyerMatch) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: buyerMatch[1], size: 20 })],
        alignment: AlignmentType.LEFT,
      }),
      new Paragraph({
        children: [new TextRun({ text: buyerMatch[2], size: 20 })],
        alignment: AlignmentType.LEFT,
      }),
      new Paragraph({
        children: [new TextRun({ text: buyerMatch[3], size: 20 })],
        alignment: AlignmentType.LEFT,
        spacing: { after: 120 },
      })
    );
    return;
  }

  /* ===== ALLOTMENT LETTER ===== */
  if (/^Allotment\s+Letter$/i.test(text)) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text, bold: true, size: 32 })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 200 },
      })
    );
    return;
  }

  if (node.classList.contains("allotment-line")) {
    const left = node.querySelector(".allot-left")?.textContent || "";
    const right = node.querySelector(".allot-right")?.textContent || "";

    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: left, size: 20 }),
          new TextRun({ text: "\t" }),
          new TextRun({ text: right, size: 20 }),
        ],
        tabStops: [{ type: AlignmentType.RIGHT, position: 10000 }],
        spacing: { after: 140 },
      })
    );
    return;
  }

  /* ===== PROJECT NAME ===== */
  if (node.classList.contains("project-name")) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text, bold: true, underline: {}, size: 26 }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
      })
    );
    return;
  }

  /* ===== TAGLINE ===== */
  if (node.classList.contains("project-tagline")) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text, bold: true, underline: {}, size: 22 }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 160 },
      })
    );
    return;
  }

  /* ===== NORMAL PARAGRAPH ===== */
  // children.push(
  //   new Paragraph({
  //     children: [new TextRun({ text, size: 20 })],
  //     alignment: AlignmentType.LEFT,
  //     spacing: { after: 80 },
  //   })
  // );
  children.push(
  new Paragraph({
    children: [
      new TextRun({
        text: text.replace(/\s+/g, " "), // ⭐ space normalize
        size: 20,
      }),
    ],
    alignment: AlignmentType.LEFT,
    spacing: {
      // line: 360,     // ⭐ line height (MOST IMPORTANT)
      before: 120,   // ⭐ gap before paragraph
      after: 120,    // ⭐ gap after paragraph
    },
  })
);

});


    /* ================= FOOTER (PAGE BOTTOM) ================= */
    children.push(
      new Paragraph({
        children: [new TextRun({ text: "SHREE GANESH", size: 20 })],
        alignment: AlignmentType.LEFT,
         spacing: { before: 1000 } 
      })
    );

    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: "Authorized Signatory/Partner", size: 20 }),
        ],
        alignment: AlignmentType.LEFT,
      })
    );

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: { top: 720, bottom: 720, left: 720, right: 720 },
            },
          },
          children,
        },
      ],
    });

    saveAs(
      await Packer.toBlob(doc),
      `Allotment${row?.booking_id || "doc"}.docx`
    );
  } catch (err) {
    console.error(err);
    alert("DOCX generation failed");
  }
};







  return (
    <div
      style={{
        background: "#f3f3f3",
        padding: "20px 0",
      }}
    >
      <div
        className="pdf-container"
        style={{
          background: "white",
          padding: "20px 40px",
          maxWidth: "800px",
          margin: "0 auto",
        }}
      >
        <style>
          {`
            .pdf-container .ql-editor h1,
            .pdf-container .ql-editor .allotment-title {
              text-align: center !important;
              font-size: 25px !important;
              margin: 0px 0 !important;
              line-height: 1 !important;
            }

            .pdf-container .ql-editor .allotment-line {
              display: flex !important;
              justify-content: space-between !important;
              align-items: center !important;
              width: 100% !important;
              margin: 0px 0 !important;
              padding: 4px 8px !important;
              background: transparent !important;
            }
            .pdf-container .ql-editor .allot-left,
            .pdf-container .ql-editor .allot-right {
              // display: inline-block !important;
              font-size: 14px !important;
                  margin-left: -7px !important;
              color: #000 !important;
            }
            .pdf-container .ql-editor .allot-right {
              text-align: right !important;
            }

            .pdf-container .ql-editor .recipient-block { margin: 10px 0 !important; }
            .pdf-container .ql-editor .recipient-block .rec-name,
            .pdf-container .ql-editor .recipient-block .rec-relation,
            .pdf-container .ql-editor .recipient-block .rec-address {
              display: block !important;
              font-size: 14px !important;
              font-weight: 700 !important;
              margin: 2px 0 !important;
              line-height: 1.1 !important;
            }

            .pdf-container .ql-editor .project-name {
              text-align: center !important;
              font-size: 18px !important;
              font-weight: 600 !important;
              margin: 3px 0 3px 0 !important;
           
              text-decoration: underline !important;
              text-underline-offset: 3px !important;
            }

            .pdf-container .ql-editor .company-name {
              text-align: center !important;
              font-size: 20px !important;
              font-weight: 700 !important;
              margin: 4px 0 6px 0 !important;
              line-height: 1.2 !important;
            }

            .pdf-container .ql-editor .company-info {
              text-align: center !important;
              font-size: 13px !important;
              margin: 2px 0 10px 0 !important;
              line-height: 1.25 !important;
            }

            .pdf-container .ql-editor .project-tagline {
              text-align: center !important;
              font-size: 17px !important;
              font-weight: 600 !important;
             
              text-decoration: underline !important;
              text-underline-offset: 3px !important;
              color: #000 !important;
            }

            .pdf-container .ql-editor .khasra-line {
              text-align: center !important;
              font-size: 18px !important;
              font-weight: 900 !important;
              margin: 3px 0 10px 0 !important;
              
              text-decoration: underline !important;
              text-underline-offset: 3px !important;
              color: #000 !important;
            }

            .pdf-container .ql-editor .patta-logo {
              width: 60px !important;
              height: auto !important;
              display: block !important;
            }

            .pdf-container .ql-editor .word-header-wrapper {
              padding-left: 0px;
            }

            /* ========== NEW: table normalization rules ========== */
         /* ========== table normalization + vertical center (minimal) ========== */
.pdf-container .ql-editor table.m-table {
  width: 100% !important;
  border-collapse: collapse !important;
  table-layout: fixed !important;
  margin: 0px 0 !important;
}

/* keep cell visuals same + enable vertical centering */
.pdf-container .ql-editor table.m-table td,
.pdf-container .ql-editor table.m-table th {

  padding:2px 0px !important;
  text-align: center !important;
  vertical-align: middle !important; /* cell baseline centering */
  word-break: break-word !important;
}

/* --- IMPORTANT: center the actual inner block (p/div) that mammoth produces --- */
/* This is minimal: resets margins only on those inner elements and uses flex to center text vertically */
.pdf-container .ql-editor table.m-table td > *,
.pdf-container .ql-editor table.m-table th > * {
  margin: 0 !important;            /* remove default p margins that break vertical centering */
  display: flex !important;        /* treat inner element as flex container */
  align-items: center !important;  /* vertical center inside the cell */
  justify-content: center !important; /* keep horizontal center */
  width: 100% !important;
  height: 100% !important;         /* let it stretch to cell height so align-items works */
}




            /* Buyer block styles (keeps other styles unchanged) */
            .pdf-container .ql-editor .buyer-block-wrapper { margin-top: 8px !important; }
            .pdf-container .ql-editor .buyer-title { font-size: 14px !important; }
            .pdf-container .ql-editor .buyer-name { font-size: 13px !important; font-weight: 700 !important; }
            .pdf-container .ql-editor .buyer-relation,
            .pdf-container .ql-editor .buyer-address { font-size: 12px !important; line-height: 1.4 !important; }

            /* If an element still contains the text 'sprate' as standalone word */
            .pdf-container .ql-editor * {
              /* nothing global here; we've removed sprate via JS already */
            }
          `}
        </style>

        <div
          className="ql-editor"
          contentEditable={true}
          dangerouslySetInnerHTML={{ __html: editorData }}
          style={{ minHeight: "400px", fontFamily: "Arial, sans-serif" }}
        />
      </div>

      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <Button onClick={downloadPDF} className="me-2">
          Download as PDF
        </Button>
         <Button onClick={downloadDocx}>Download as DOCX</Button> 
      </div>
    </div>
  );
}

export default Index;
