import React, { useState } from "react";
import axios from "axios";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import { API_BASE_URL } from "config/constant";

const RemarkPopup = ({ projectId, referenceType, referenceId }) => {
  const [show, setShow] = useState(false);
  const [remark, setRemark] = useState("");
  const [loading, setLoading] = useState(false);

  const userData = JSON.parse(localStorage.getItem("users") || "{}");

  const handleClose = () => {
    setShow(false);
    setRemark("");
  };

  const handleSubmit = async () => {
    if (!remark.trim()) return alert("Please enter a remark");

    try {
      setLoading(true);
      await axios.post(
        `${API_BASE_URL}/project/add-remark`,
        {
          project_id: projectId,
          reference_type: referenceType,
          reference_id: referenceId,
          remark: remark,
        },
        {
          headers: {
            Authorization: userData?.user_token,
          },
        }
      );

      // Notification (Success)
      handleClose();
    } catch (err) {
      console.error(err);
      alert("❌ Error adding remark");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>

    <span
  className="d-flex align-items-center gap-1 ms-2"
  onClick={() => setShow(true)}
  style={{ cursor: "pointer" }}
>
  <i
    className="feather icon-message-square"
    style={{ fontSize: "12px" }}
  ></i>
  <span>Remark</span>
</span>

      {/* 🪟 Clean Modal */}
      <Modal 
        show={show} 
        onHide={handleClose} 
        centered 
        backdrop="static"
        className="fade"
      >
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="h3 mb-0">Add  Remark</Modal.Title>
        </Modal.Header>

        <Modal.Body className="py-4">
          <Form.Group className="mb-0">
            <Form.Label className="font-weight-bold small text-muted">
              YOUR REMARK
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="Write your observation here..."
              className="form-control-alternative border-primary-subtle"
              style={{ resize: 'none', borderRadius: '8px' }}
              autoFocus
            />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer className="border-0 pt-0">
          <Button 
            variant="link" 
            className="text-muted text-decoration-none" 
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          
          <Button 
            variant="primary" 
            className="px-4 shadow-sm"
            onClick={handleSubmit}
            disabled={loading || !remark.trim()}
          >
            {loading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="mr-2"
                />
                Saving...
              </>
            ) : (
              "Save Remark"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default RemarkPopup;