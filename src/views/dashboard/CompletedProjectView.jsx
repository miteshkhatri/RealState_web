import React, { useEffect, useState } from "react";
import {
  Row, Col, Card, Table, Form, Badge, Dropdown, ListGroup,
} from "react-bootstrap";
import { useParams, useNavigate, Link } from "react-router-dom";
import ModernPagination from "components/Pagination";
import "../style.css";
import api from "utils/api";
import BackButton from "components/Loader/BackButton";

const CompletedProjectView = () => {
  const { project_id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [sortCols, setSortCols] = useState([]); 

  const userData = JSON.parse(localStorage.getItem("users")) || {};
  const [totalCount, setTotalCount] = useState(0);

  // ✅ Stats state for Header
  const [stats, setStats] = useState({
    total: 0,
    received: 0,
    pending: 0
  });

  const fetchData = async (pageNo = 1, currentSortCols = sortCols) => {
    setLoading(true);
    try {
      const sortParam = currentSortCols.length > 0
        ? encodeURIComponent(JSON.stringify(currentSortCols))
        : "";

      const res = await api.get(
        `/dashboard/completedAmountAUsers?project_id=${project_id}&page=${pageNo}&limit=${limit}&sort=${sortParam}`,
        { headers: { Authorization: userData.user_token || "" } }
      );

      const resData = res.data;
      setData(resData?.data || []);
      
      const total = resData?.count || resData?.total_records || 0;
      setTotalCount(total);

      // ✅ Setting Grand Totals from API
      setStats({
        total: resData?.grand_total_amount || 0,
        received: resData?.grand_received_amount || 0,
        pending: resData?.grand_pending_amount || 0
      });

      setTotalPages(Math.ceil(total / limit));
      setPage(pageNo);
    } catch (error) {
      console.error("API Error:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (project_id) { setPage(1); fetchData(1, sortCols); }
  }, [project_id, limit]);

  useEffect(() => {
    if (project_id) { setPage(1); fetchData(1, sortCols); }
  }, [sortCols]);

  const formatAmount = (value) => {
    if (value === null || value === undefined || value === "" || Number(value) === 0) return "0";
    // ✅ Math.floor use kiya hai points hatane ke liye
    const num = Math.floor(Number(value));
    if (isNaN(num)) return value;
    return num.toLocaleString("en-IN");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-GB");
  };

  const getDocDate = (docs = [], type) => {
    const doc = docs.find((d) => d.type === type);
    return doc ? formatDate(doc.document_date) : "—";
  };

  const normalizeText = (text = "") =>
    text.toString().trim().normalize("NFKD").toLowerCase();

  const columns = [
    { key: "plot_no",        label: "Plot No",        type: "string" },
    { key: "customer_name",  label: "Owner Name",     type: "string" },
    { key: "plot_size",      label: "Size(sq.ft)",    type: "number" },
    { key: "agreement_date", label: "Agreement Date", type: "date"   },
    { key: "registry_date",  label: "Registry Date",  type: "date"   },
    { key: "total_amount",   label: "Amount Details", type: "number" },
  ];

  const handleArrowClick = (key, dir, e) => {
    e.stopPropagation();
    setSortCols((prev) => {
      const existing = prev.find((s) => s.key === key);
      if (existing) {
        if (existing.dir === dir) return prev.filter((s) => s.key !== key);
        return prev.map((s) => s.key === key ? { ...s, dir } : s);
      }
      return [...prev, { key, dir }];
    });
  };

  const getSortInfo = (key) => {
    const idx = sortCols.findIndex((s) => s.key === key);
    if (idx === -1) return { dir: null, badge: null, active: false };
    return {
      dir: sortCols[idx].dir,
      badge: sortCols.length > 1 ? idx + 1 : null,
      active: true,
    };
  };

  const getFilteredData = () => {
    return data.filter((row) => {
      const search = normalizeText(searchTerm);
      return (
        !search ||
        normalizeText(row.customer_name).includes(search) ||
        normalizeText(row.plot_no).includes(search)
      );
    });
  };

  const visibleRows = getFilteredData();

  const SortTh = ({ colKey }) => {
    const col = columns.find((c) => c.key === colKey);
    const { dir, badge, active } = getSortInfo(colKey);

    return (
      <th
        style={{
          userSelect: "none",
          whiteSpace: "nowrap",
          background: active ? "#f0f5ff" : "inherit",
          color: active ? "#0d6efd" : "#000000",
        }}
      >
        <div className="d-flex align-items-center justify-content-center gap-1">
          <span>{col.label}</span>
          {badge && (
            <sup style={{
              fontSize: 9, background: "#0d6efd", color: "#fff",
              borderRadius: "50%", padding: "1px 4px",
            }}>
              {badge}
            </sup>
          )}
          <span style={{ display: "flex", flexDirection: "column", lineHeight: 1, marginLeft: 2 }}>
            <span
              onClick={(e) => handleArrowClick(colKey, "asc", e)}
              style={{
                fontSize: 10, cursor: "pointer",
                color: (active && dir === "asc") ? "#0d6efd" : "#bbb",
              }}
            >▲</span>
            <span
              onClick={(e) => handleArrowClick(colKey, "desc", e)}
              style={{
                fontSize: 10, cursor: "pointer",
                color: (active && dir === "desc") ? "#0d6efd" : "#bbb",
              }}
            >▼</span>
          </span>
        </div>
      </th>
    );
  };

  if (loading)
    return <p className="text-center mt-4">Loading completed bookings...</p>;

  return (
    <>
      <Row>
        <Col>
          <Card className="shadow-sm">
            <Card.Header className="d-flex flex-wrap justify-content-between align-items-center gap-2">
              <div>
                <Card.Title as="h5" className="mb-1">
                  Completed Bookings <Badge bg="primary" className="ms-2">{totalCount}</Badge>
                </Card.Title>
                
                {/* ✅ Grand Totals in Header */}
                <div className="d-flex gap-3 mt-2" style={{ fontSize: '12px' }}>
                  <div className="text-muted">Total: <span className="fw-bold text-dark">₹{formatAmount(stats.total)}</span></div>
                  <div className="text-success">Received: <span className="fw-bold">₹{formatAmount(stats.received)}</span></div>
                  <div className="text-danger">Pending: <span className="fw-bold">₹{formatAmount(stats.pending)}</span></div>
                </div>
              </div>

              <div className="d-flex align-items-center gap-2">
                <Dropdown>
                  <Dropdown.Toggle style={{ height: "38px", minWidth: "60px", textAlign: "center" }}>
                    {limit}
                  </Dropdown.Toggle>
                  <Dropdown.Menu style={{ minWidth: "80px", textAlign: "center", padding: 0 }}>
                    {[10, 25, 50, 100].map((n, i, arr) => (
                      <React.Fragment key={n}>
                        <Dropdown.Item onClick={() => { setLimit(n); setPage(1); }}>{n}</Dropdown.Item>
                        {i < arr.length - 1 && <Dropdown.Divider className="m-0" />}
                      </React.Fragment>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>

                {/* <Form.Control
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ height: "38px", maxWidth: "180px" }}
                /> */}
              </div>
            </Card.Header>

            <Card.Body className="p-0">
              <Table responsive hover className="d-none d-md-table text-center align-middle mb-0">
                <thead>
                  <tr>
                    <th>#</th>
                    <SortTh colKey="plot_no" />
                    <SortTh colKey="customer_name" />
                    <SortTh colKey="plot_size" />
                    <SortTh colKey="agreement_date" />
                    <SortTh colKey="registry_date" />
                    <th>Handover Date</th>
                    <SortTh colKey="total_amount" />
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.length > 0 ? (
                    visibleRows.map((row, index) => (
                      <tr key={row.booking_id}>
                        <td>{(page - 1) * limit + index + 1}</td>
                        <td><strong>{row.plot_no || "—"}</strong></td>
                        <td className={Number(row.booked_krutiDev_font) == 1 ? 'kruti-dev' : ''}>
  {row.customer_name || "—"}
</td>
                        <td>{row.plot_size ? `${Math.floor(row.plot_size)}` : "—"}</td>
                        <td>{formatDate(row.agreement_date)}</td>
                        <td>
                          {row.registry_date ? (
                            <span className="text-success fw-bold">{formatDate(row.registry_date)}</span>
                          ) : "__"}
                        </td>
                        <td>{getDocDate(row.documents_date, "organization_document_handed_over_to_party")}</td>
                        <td className="text-start" style={{ minWidth: "150px" }}>
                          <div style={{ fontSize: "11px" }}>
                            <div className="d-flex justify-content-between">
                              <span className="text-muted">Total:</span>
                              <span>₹{formatAmount(row.total_amount)}</span>
                            </div>
                            <div className="d-flex justify-content-between">
                              <span className="text-primary">Paid:</span>
                              <span className="text-primary">₹{formatAmount(row.received_amount)}</span>
                            </div>
                            <div className="d-flex justify-content-between border-top mt-1 pt-1 fw-bold">
                              <span>Due:</span>
                              <span className={Number(row.remaining_amount) > 0 ? "text-danger" : "text-success"}>
                                ₹{formatAmount(row.remaining_amount)}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <Dropdown
                            align={"start"}
                            show={openDropdown === row.booking_id}
                            onToggle={() => setOpenDropdown(openDropdown === row.booking_id ? null : row.booking_id)}
                          >
                            <Dropdown.Toggle as={Link} variant="link" className="no-arrow">
                              <i className="feather icon-more-vertical text-dark" />
                            </Dropdown.Toggle>
                            <Dropdown.Menu align="center" className="profile-notification p-0">
                              <ListGroup variant="flush">
                                <ListGroup.Item action onClick={() => navigate(`/MoreInfo`, { state: { row } })}>
                                  <span className="dropdown-item p-0 small">
                                    <i className="feather icon-info me-2 text-info" /> More Info
                                  </span>
                                </ListGroup.Item>
                                <Dropdown.Divider className="m-0" />
                                <ListGroup.Item action onClick={() => navigate(`/project/remarks/${row.project_id}`, { state: { row } })}>
                                  <span className="dropdown-item p-0 small">
                                    <i className="feather icon-message-square me-2 text-success" /> Remark
                                  </span>
                                </ListGroup.Item>
                              </ListGroup>
                            </Dropdown.Menu>
                          </Dropdown>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="py-4">No records found.</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>

            <div className="px-3 py-3 border-top">
              <Row className="align-items-center">
                <Col xs={4} className="text-start"><BackButton /></Col>
                <Col xs={4} className="d-flex justify-content-center">
                  <ModernPagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={(p) => fetchData(p, sortCols)}
                  />
                </Col>
                <Col xs={4}></Col>
              </Row>
            </div>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default CompletedProjectView;