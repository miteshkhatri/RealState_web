import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import mammoth from "mammoth";
import { Button } from "react-bootstrap";
import html2pdf from "html2pdf.js";
import { krutiToUnicode } from "../Agreement/krutidevConverter";

 



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
} from "docx";

import { saveAs } from "file-saver";
import "./style.css";
import { API_BASE_URL } from "config/constant";

function Index() {
  const location = useLocation();
  const [editorData, setEditorData] = useState("");
  const data = location.state?.data;
 const row =  location.state?.row;


   


 



useEffect(() => {
  if (data?.fileUrl && Array.isArray(data?.data)) {
    // helper: escape user-provided text for safe use in RegExp
    const escapeRegExp = (str) => {
      return String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    };

    fetch(data.fileUrl)
      .then((res) => res.blob())
      .then((blob) => {
        const reader = new FileReader();
        reader.onload = () => {
          mammoth
            .convertToHtml({ arrayBuffer: reader.result })
            .then((result) => {
              let html = result.value;

              // Replace placeholders
              html = html.replace(
                /#mohit/g,
                '<span style="opacity:0; display:none; height:20px">#mohit</span><br/>'
              );

              html = html.replace(
                /#kumar/g,
                `<div style="height: 120px; opacity:0;"></div>`
              );

              // Parse HTML
              const parser = new DOMParser();
              const doc = parser.parseFromString(html, "text/html");
              const tables = doc.querySelectorAll("table");

              if (tables.length > 0) {
                const lastTable = tables[tables.length - 1];
                lastTable.style.border = "none";
                lastTable.style.borderCollapse = "collapse";

                const cells = lastTable.querySelectorAll("td");
                cells.forEach((td) => {
                  td.style.height = "80px";
                  td.style.width = "150px";
                  td.style.textAlign = "center";
                  td.style.verticalAlign = "middle";
                  td.style.border = "none";
                });

                lastTable.style.height = "400px";
                lastTable.style.minHeight = "400px";
              }

              // Back to HTML string
              html = doc.body.innerHTML;

              // Format keywords
              let firstTitleHandled = false;
              const keywords = [
                "Plot Buyer's Agreement",
                "Arbitration and conciliation Act",
                "PLOT.NO.-",
                "Sagar Setu Enclave D BLOCK",
                "RTGS/NEFT/NET BANKING",
                "Assign",
              ];
              // escape keywords before building RegExp
              const escapedKeywords = keywords.map(escapeRegExp);
              html = html.replace(
                new RegExp(`(${escapedKeywords.join("|")})`, "g"),
                (match) => {
                  if (match === "Plot Buyer's Agreement") {
                    if (!firstTitleHandled) {
                      firstTitleHandled = true;
                      return `<div style="
                        text-align: center;
                        font-weight: bold;
                        font-size: 22px;
                        text-decoration: underline;
                        margin: 30px 0;
                        font-family: Arial;
                      ">${match}</div>`;
                    } else {
                      return `<span style="font-family: Arial;">${match}</span>`;
                    }
                  } else {
                    return `<span style="font-family: Arial;">${match}</span>`;
                  }
                }
              );

              // ✅ Loop through each row in data.data
              data.data.forEach((row) => {

                // 💠 function to apply font for customer fields
                const applyFont = (text) => {
                  if (!text) return "";

                  if (row.krutiDev_font == 1) {
                    return `<span style="font-family: 'Kruti Dev 010'; font-size:16px;">${text}</span>`;
                  } else {
                    return `<span class="normal-font">${text}</span>`;
                  }
                };

                // Customer fields as before
                const fields = [
                  "customer_name",
                  "customer_father_name",
                  "customer_address",
                  "custom_field",
                  "branch_name",
                  "bank_name",
                  "additional_comment",
                ];

                fields.forEach((key) => {
                  const value = row?.[key];
                  if (value) {
                    const safe = escapeRegExp(value);
                    const regex = new RegExp(safe, "g");
                    html = html.replace(regex, applyFont(value));
                  }
                });

                // ⭐ UPDATED: Only apply Kruti Dev for direction fields when row.plot_font == 1
                const directionFields = ["north", "east", "south", "west"];

                directionFields.forEach((key) => {
                  const value = row?.[key];
                  if (!value) return;

                  // only proceed when plot_font === 1 (apply Kruti Dev). Otherwise leave text unchanged.
                  if (row.plot_font == 1) {
                    const safe = escapeRegExp(value);
                    const regex = new RegExp(safe, "g");

                    // Apply Kruti Dev font (per your request: only Kruti when plot_font == 1)
                    const krutiSpan = `<span style="font-family: 'Kruti Dev 010'; font-size:16px;">${value}</span>`;
                    html = html.replace(regex, krutiSpan);
                  }
                  // else: do nothing (keep original text)
                });
              });

              setEditorData(html);
            })
            .catch((err) => console.error(err));
        };
        reader.readAsArrayBuffer(blob);
      })
      .catch((err) => console.error(err));
  }    
}, [data]);






 const downloadPDF = async () => {
    const userData = JSON.parse(localStorage.getItem("users"));
  try {
    // 1️⃣ API CALL FIRST
    const response = await fetch(`${API_BASE_URL}/booking/downloadBooking`, {
      method: "POST",
      headers: { "Content-Type": "application/json", 
          Authorization: userData?.user_token
      },
      body: JSON.stringify({
        plot_id: row.plot_id,
        user_id: userData.user_id,
        role_id:  userData.role_id
      })
    });

    const result = await response.json();

   
    if (!result.status) {
      alert(result.message || "You cannot download this PDF again.");
      return; // ❌ STOP — no pdf download
    }

    // 3️⃣ If backend says OK → generate PDF only now
    const editorElement = document.querySelector(".pdf-container");
    if (!editorElement) return console.error("Editor element not found!");

    const originalFontSize = editorElement.style.fontSize;
    editorElement.style.fontSize = "16px";

    html2pdf()
      .from(editorElement)
      .set({
        margin: 0.5,
        filename: `Sagar Setu Enclave D BLOCK ${row.booking_id}.pdf`,
        html2canvas: {
          scale: 2,
          letterRendering: true,
          useCORS: true,
        },
        jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
        pagebreak: { mode: ["avoid-all", "css", "legacy"] },
      })
      .save()
      .then(() => {
        editorElement.style.fontSize = originalFontSize;
      });

  } catch (err) {
    console.error("PDF download error:", err);
  }
};





const englishKeywords = [
  "Plot Buyer's Agreement",
  "Arbitration and conciliation Act",
  "PLOT.NO.-",
  "Sagar Setu Enclave D BLOCK",
  "RTGS/NEFT/NET BANKING",
  "Assign",
];





const downloadDocx = async () => {
  const editorElement = document.querySelector(".ql-editor");
  if (!editorElement) return console.error("Editor element not found!");

  // get user
  const userData = JSON.parse(localStorage.getItem("users") || "{}");
  const payload = {
    plot_id: row.plot_id,
    user_id: userData.user_id,
    role_id: userData.role_id
  };

  try {
    // 1) ASK backend first (same as PDF flow)
    const resp = await fetch(`${API_BASE_URL}/booking/downloadBooking`, {
      method: "POST",
      headers: { "Content-Type": "application/json",
          Authorization: userData?.user_token
       },
      body: JSON.stringify(payload)
    });
    const result = await resp.json();

    if (!result.status) {
      alert(result.message || "You cannot download this DOCX.");
      return;
    }

    // 2) Work on a copy of HTML so we don't mutate editor
    let html = editorElement.innerHTML;

    // helper - escape regex
    const escapeRegExp = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // Apply same field replacements as you do in useEffect, but on the copy
    const fields = [
      "customer_name",
      "customer_father_name",
      "customer_address",
      "custom_field",
      "branch_name",
      "bank_name",
      "additional_comment",
    ];
    // if row.krutiDev_font == 1 convert those specific fields using krutiToUnicode
    fields.forEach((key) => {
      const value = row?.[key];
      if (value) {
        const safe = escapeRegExp(value);
        const regex = new RegExp(safe, "g");
        const replacement = (row.krutiDev_font == 1) ? krutiToUnicode(value) : value;
        html = html.replace(regex, replacement);
      }
    });

    // Also convert direction fields if plot_font == 1 (like useEffect)
    const directionFields = ["north", "east", "south", "west"];
    directionFields.forEach((key) => {
      const value = row?.[key];
      if (!value) return;
      if (row.plot_font == 1) {
        const safe = escapeRegExp(value);
        const regex = new RegExp(safe, "g");
        const replacement = krutiToUnicode(value);
        html = html.replace(regex, replacement);
      }
    });

    // Parse the prepared HTML
    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(html, "text/html");

    // small helpers (keywords and splitting) — kept similar to your earlier logic
    const englishKeywords = [
      "Plot Buyer's Agreement",
      "Arbitration and conciliation Act",
      "PLOT.NO.-",
      "Sagar Setu Enclave D BLOCK",
      "RTGS/NEFT/NET BANKING",
      "Assign",
    ];

    const splitTextByKeywords = (text) => {
      if (!text) return [{ text: "", font: "Arial" }];
      let out = [];
      let remaining = text;
      while (remaining.length > 0) {
        const found = englishKeywords.find((kw) => remaining.includes(kw));
        if (!found) {
          out.push({ text: remaining, font: "Arial" });
          break;
        }
        const idx = remaining.indexOf(found);
        if (idx > 0) out.push({ text: remaining.slice(0, idx), font: "Arial" });
        out.push({ text: found, font: "Arial" });
        remaining = remaining.slice(idx + found.length);
      }
      return out;
    };

    const splitParagraphs = (text) => {
      const mohitCount = (text.match(/#mohit/g) || []).length;
      let mohitSeen = 0;
      const result = [];
      const kumarParts = text.split("#kumar");
      kumarParts.forEach((kumarPart, kumarIdx) => {
        const mohitParts = kumarPart.split("#mohit");
        mohitParts.forEach((p, idx) => {
          const trimmed = p.trim();
          if (!trimmed) return;
          mohitSeen++;
          const isLastMohit = mohitSeen === mohitCount;
          result.push({ text: trimmed, pageBreak: false });
          if (idx < mohitParts.length - 1 && isLastMohit) {
            result.push({ text: "", pageBreak: true });
          }
        });
        if (kumarIdx < kumarParts.length - 1) {
          result.push({ text: "", pageBreak: true });
        }
      });
      return result.filter((p) => p.text.length > 0 || p.pageBreak);
    };

    // Build docx children
    const children = [];
    let firstTitleHandled = false;

    htmlDoc.body.childNodes.forEach((node) => {
      if (node.nodeName === "TABLE") {
        const rows = Array.from(node.rows).map((r) => {
          const cells = Array.from(r.cells).map((cell) => {
            const cellText = cell.textContent || "";
            const paras = splitParagraphs(cellText).map((para) => {
              const parts = splitTextByKeywords(para.text);
              const runs = parts.map((p) => new TextRun({ text: p.text, font: p.font || "Arial" }));
              return new Paragraph({
                spacing: { before: 0, after: 0, line: 276 },
                children: runs.length ? runs : [new TextRun({ text: "" })],
                pageBreakBefore: para.pageBreak,
                alignment: AlignmentType.CENTER,
              });
            });
            return new TableCell({
              children: paras.length ? paras : [new Paragraph({ children: [new TextRun({ text: "" })] })],
              width: { size: 5000, type: WidthType.DXA },
              margins: { top: 0, bottom: 0, left: 100, right: 100 },
              verticalAlign: "center",
            });
          });
          return new TableRow({ children: cells, height: { value: 800 } });
        });

        const allTables = htmlDoc.querySelectorAll("table");
        const isLastTable = node === allTables[allTables.length - 1];
        const tableBorders = isLastTable
          ? {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
              insideHorizontal: { style: BorderStyle.NONE },
              insideVertical: { style: BorderStyle.NONE },
            }
          : {
              top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
            };

        children.push(new Table({ rows, width: { size: 100, type: WidthType.PERCENTAGE }, borders: tableBorders }));
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const textContent = node.textContent || "";
        splitParagraphs(textContent).forEach((para) => {
          const parts = splitTextByKeywords(para.text);
          const runs = parts.map((p) => new TextRun({ text: p.text, font: p.font || "Arial" }));

          if (para.text.includes("Plot Buyer's Agreement") && !firstTitleHandled) {
            firstTitleHandled = true;
            children.push(
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 8000, after: 1000 },
                children: [new TextRun({ text: para.text, bold: true, font: "Arial", size: 28 })],
              })
            );
          } else {
            children.push(
              new Paragraph({
                alignment: AlignmentType.JUSTIFY,
                spacing: { before: 120, after: 120, line: 276 },
                children: runs,
                pageBreakBefore: para.pageBreak,
              })
            );
          }
        });
      }
    });

    // Create doc and download
    const doc = new Document({ sections: [{ children }] });
    Packer.toBlob(doc)
      .then((blob) => saveAs(blob, `Sagar Setu Enclave D BLOCK ${row.booking_id}.docx`))
      .catch((e) => console.error("DOCX pack error:", e));
  } catch (err) {
    console.error("downloadDocx error:", err);
    alert("Something went wrong while preparing DOCX.");
  }
};


  





  return (
    <div>
      <div className="pdf-container" style={{ background: "white", padding: "20px" }}>
        <div
          className="ql-editor"
          contentEditable={true}
          dangerouslySetInnerHTML={{ __html: editorData }}
          style={{
            minHeight: "400px",
            fontFamily: "Kruti Dev 010, Arial",
          }}
        />
      </div>

      <div style={{ marginTop: "20px" }}>
        <Button onClick={downloadPDF} className="me-2">
          Download as PDF
        </Button>
        <Button onClick={downloadDocx}>Download as DOCX</Button>
      </div>
    </div>
  );
}

export default Index;
