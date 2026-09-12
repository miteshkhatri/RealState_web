import React from 'react';
import { Row, Col, Image, Button, Card } from 'react-bootstrap'; // ⭐ Card import from react-bootstrap
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from 'config/constant';
import avatar2 from '../../assets/images/user/avatar-2.jpg';

function index() {
    const navigate = useNavigate();
    const userData = JSON.parse(localStorage.getItem('users'));

    return (
        <React.Fragment>
            <div className="add-project-card">
                <Row>
                    <Col md={12} lg={12}>
                        {/* ⭐ React-Bootstrap Card with proper header classes */}
                        <Card>
                            <Card.Header className="project-header">
                                <Card.Title as="h5" className="project-title">
                                    Profile
                                </Card.Title>
                            </Card.Header>

                            <Card.Body>
                                <div className="d-flex align-items-center gap-5">
                                    <div>
                                        {userData?.image ? (
                                            <Image
                                                src={`${API_BASE_URL}/uploads/${userData.image}`}
                                                roundedCircle
                                                className="mb-3"
                                                style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <Image
                                                src={avatar2}
                                                roundedCircle
                                                className="mb-3"
                                                style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                                            />
                                        )}
                                    </div>
                                    <div>
                                        <h4>{userData.name}</h4>
                                        <p>{userData.role}</p>
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <div className="mb-2">
                                        <strong>Email:</strong> {userData.email}
                                    </div>
                                    <div className="mb-2">
                                        <strong>Phone:</strong> {userData.mobile_no}
                                    </div>

                                    <div className="text-start mt-3">
                                        <Button
                                            className="submit-btn"
                                            onClick={() => navigate('/profile/update')}
                                        >
                                            Edit Profile
                                        </Button>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </div>
        </React.Fragment>
    );
}

export default index;