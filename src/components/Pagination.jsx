import React from "react";
import "../components/style.css";

const ModernPagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  maxVisible = 5,
}) => {
  if (totalPages <= 1) return null;

  const pages = [];

  const half = Math.floor(maxVisible / 2);
  let start = Math.max(2, currentPage - half);
  let end = Math.min(totalPages - 1, currentPage + half);

  if (end - start + 1 < maxVisible) {
    if (start === 2) {
      end = Math.min(totalPages - 1, start + maxVisible - 1);
    } else if (end === totalPages - 1) {
      start = Math.max(2, end - maxVisible + 1);
    }
  }

  // 🔹 First page
  pages.push({ type: "page", id: 1 });

  if (start > 2) {
    pages.push({ type: "ellipsis", id: "start" });
  }

  for (let i = start; i <= end; i++) {
    pages.push({ type: "page", id: i });
  }

  if (end < totalPages - 1) {
    pages.push({ type: "ellipsis", id: "end" });
  }

  // 🔹 Last page
  if (totalPages > 1) {
    pages.push({ type: "page", id: totalPages });
  }

  return (
    <div className="pagination-wrapper">
      {/* ─── CSS Styles ─── */}
      <style>{`
        /* ============================================================
           🌑 MODERN PAGINATION — Midnight Trust Theme
           Deep Navy + Gold | Light + Dark Mode | Center Aligned
           ============================================================ */

        .pagination-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 16px 0;
          font-family: 'Inter', sans-serif;
          width: 100%;
        }

        /* ─── Desktop Pagination ─── */
        .pagination-desktop {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          flex-wrap: wrap;
        }

        .pagination-desktop .page-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 36px;
          height: 36px;
          padding: 0 10px;
          border-radius: 8px;
          border: 1.5px solid #E8ECF0;
          background: #FFFFFF;
          color: #0D1B2A;
          font-size: 13px;
          font-weight: 500;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          transition: all 0.2s ease;
          user-select: none;
        }

        .pagination-desktop .page-btn:hover:not(:disabled):not(.active) {
          border-color: #C9A84C;
          color: #C9A84C;
          background: rgba(201, 168, 76, 0.06);
          transform: translateY(-1px);
        }

        .pagination-desktop .page-btn:active:not(:disabled):not(.active) {
          transform: scale(0.95);
        }

        .pagination-desktop .page-btn.active {
          background: #C9A84C;
          border-color: #C9A84C;
          color: #0D1B2A;
          font-weight: 700;
          box-shadow: 0 2px 8px rgba(201, 168, 76, 0.25);
        }

        .pagination-desktop .page-btn:disabled {
          opacity: 0.35;
          cursor: not-allowed;
          transform: none !important;
        }

        .pagination-desktop .ellipsis {
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 36px;
          height: 36px;
          color: #94A3B8;
          font-size: 14px;
          font-weight: 500;
          letter-spacing: 1px;
          user-select: none;
        }

        /* ─── Dark Mode Desktop ─── */
        body.dark-theme .pagination-desktop .page-btn {
          background: #1E3A5F;
          border-color: rgba(201, 168, 76, 0.12);
          color: #F4F4F4;
        }

        body.dark-theme .pagination-desktop .page-btn:hover:not(:disabled):not(.active) {
          border-color: #E8C56A;
          color: #E8C56A;
          background: rgba(232, 197, 106, 0.08);
        }

        body.dark-theme .pagination-desktop .page-btn.active {
          background: #C9A84C;
          border-color: #C9A84C;
          color: #0D1B2A;
          box-shadow: 0 2px 12px rgba(201, 168, 76, 0.30);
        }

        body.dark-theme .pagination-desktop .page-btn:disabled {
          opacity: 0.30;
        }

        body.dark-theme .pagination-desktop .ellipsis {
          color: rgba(244, 244, 244, 0.30);
        }

        /* ─── Mobile Pagination ─── */
        .pagination-mobile {
          display: none;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
        }

        .pagination-mobile .page-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 6px 16px;
          height: 34px;
          border-radius: 8px;
          border: 1.5px solid #E8ECF0;
          background: #FFFFFF;
          color: #0D1B2A;
          font-size: 12px;
          font-weight: 600;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          transition: all 0.2s ease;
          user-select: none;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .pagination-mobile .page-btn:hover:not(:disabled) {
          border-color: #C9A84C;
          color: #C9A84C;
          background: rgba(201, 168, 76, 0.06);
        }

        .pagination-mobile .page-btn:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }

        .pagination-mobile .page-info {
          font-size: 13px;
          font-weight: 600;
          color: #0D1B2A;
          font-family: 'Inter', sans-serif;
          padding: 0 4px;
          min-width: 50px;
          text-align: center;
        }

        /* ─── Dark Mode Mobile ─── */
        body.dark-theme .pagination-mobile .page-btn {
          background: #1E3A5F;
          border-color: rgba(201, 168, 76, 0.12);
          color: #F4F4F4;
        }

        body.dark-theme .pagination-mobile .page-btn:hover:not(:disabled) {
          border-color: #E8C56A;
          color: #E8C56A;
          background: rgba(232, 197, 106, 0.08);
        }

        body.dark-theme .pagination-mobile .page-btn:disabled {
          opacity: 0.30;
        }

        body.dark-theme .pagination-mobile .page-info {
          color: #F4F4F4;
        }

        /* ─── Responsive ─── */
        @media (max-width: 768px) {
          .pagination-desktop {
            display: none !important;
          }

          .pagination-mobile {
            display: flex !important;
          }

          .pagination-wrapper {
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .pagination-mobile .page-btn {
            padding: 4px 12px;
            font-size: 11px;
            height: 30px;
          }

          .pagination-mobile .page-info {
            font-size: 12px;
            min-width: 40px;
          }
        }
      `}</style>

      {/* ===== Desktop Pagination ===== */}
      <div className="pagination-desktop">
        <button
          className="page-btn"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          ‹
        </button>

        {pages.map((item) =>
          item.type === "page" ? (
            <button
              key={`page-${item.id}`}
              onClick={() => onPageChange(item.id)}
              className={`page-btn ${
                item.id === currentPage ? "active" : ""
              }`}
            >
              {item.id}
            </button>
          ) : (
            <span key={`ellipsis-${item.id}`} className="ellipsis">
              …
            </span>
          )
        )}

        <button
          className="page-btn"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          ›
        </button>
      </div>

      {/* ===== Mobile Pagination ===== */}
      <div className="pagination-mobile">
        <button
          className="page-btn"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          Prev
        </button>

        <span className="page-info">
          {currentPage} / {totalPages}
        </span>

        <button
          className="page-btn"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ModernPagination;