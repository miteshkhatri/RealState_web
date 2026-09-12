import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";

export default function PasswordModal({ show, onClose, onSubmit, errors }) {
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState(errors || "");

  useEffect(() => {
    setLocalError(errors || "");
  }, [errors]);

  const handleSubmit = () => {
    if (password) {
      onSubmit(password);
      setPassword("");
    }
  };

  const handleChange = (e) => {
    setPassword(e.target.value);
    if (localError) setLocalError(""); // 🧹 Clear error on typing
  };

  return (
    <Modal
      show={show}
      onHide={onClose}
      centered
      style={{
        fontFamily: "Segoe UI, sans-serif",
        borderRadius: "14px",
        boxShadow: "0 12px 28px rgba(0,0,0,0.25)",
      }}
    >
      {/* Header */}
      <Modal.Header
        closeButton
        style={{
          borderBottom: "1px solid #ddd",
          padding: "14px 20px",
          background: "#f7f9fc",
        }}
      >
        <Modal.Title style={{ fontWeight: 700, fontSize: "20px", color: "#333" }}>
          Enter Password
        </Modal.Title>
      </Modal.Header>

      {/* Body */}
      <Modal.Body style={{ padding: "24px 20px" }}>
        <Form>
          <Form.Group>
            <Form.Label
              style={{
                fontWeight: 600,
                marginBottom: "10px",
                fontSize: "14px",
                color: "#555",
              }}
            >
              Password
            </Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={handleChange}
              style={{
                borderRadius: "8px",
                height: "44px",
                boxShadow: "inset 0 2px 6px rgba(0,0,0,0.08)",
                fontSize: "14px",
                padding: "0 14px",
                border: localError ? "1px solid red" : "1px solid #ced4da",
              }}
            />

            {/* 🔴 Error message (only if exists) */}
            {localError && (
              <div
                style={{
                  color: "red",
                  marginTop: "8px",
                  fontSize: "13px",
                  fontWeight: 500,
                }}
              >
                {localError}
              </div>
            )}
          </Form.Group>
        </Form>
      </Modal.Body>

      {/* Footer */}
      <Modal.Footer
        style={{
          borderTop: "1px solid #ddd",
          justifyContent: "flex-end",
          gap: "12px",
          padding: "14px 20px",
          background: "#f7f9fc",
        }}
      >
        <Button
          variant="secondary"
          onClick={onClose}
          style={{
            borderRadius: "8px",
            padding: "8px 18px",
            fontWeight: 600,
            background: "#f5f5f5",
            borderColor: "#ccc",
            color: "#333",
            transition: "all 0.2s",
          }}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={!password}
          style={{
            borderRadius: "8px",
            padding: "8px 18px",
            fontWeight: 600,
            fontSize: "14px",
            background: "linear-gradient(135deg, #6a11cb, #2575fc)",
            border: "none",
            color: "#fff",
            transition: "all 0.2s",
            opacity: password ? 1 : 0.6,
            boxShadow: password ? "0 4px 12px rgba(0,0,0,0.15)" : "none",
          }}
        >
          Submit
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
