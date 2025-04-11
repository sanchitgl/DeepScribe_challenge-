import React, { useState } from 'react';
import './TimestampFilter.css';
import { Form, Button, Row, Col } from 'react-bootstrap';


const TimestampFilter = ({ onApplyFilter, onClearFilter }) => {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isFilterActive, setIsFilterActive] = useState(false);
  
  const handleApplyFilter = (e) => {
    e.preventDefault();
    if (startTime || endTime) {
      onApplyFilter(startTime, endTime);
      setIsFilterActive(true);
    }
  };
  
  const handleClearFilter = () => {
    setStartTime('');
    setEndTime('');
    setIsFilterActive(false);
    onClearFilter();
  };
  
  return (
    <div className="timestamp-filter">
      <h6>Filter by timestamp (hh:mm:ss):</h6>
      <Form onSubmit={handleApplyFilter}>
        <Row className="align-items-center">
          <Col xs="auto">
            <Form.Control
              type="text"
              placeholder="00:00:00"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              pattern="[0-9]{2}:[0-9]{2}:[0-9]{2}"
              title="Format: hh:mm:ss"
              className="timestamp-input"
            />
          </Col>
          <Col xs="auto" className="text-center px-0">
            to
          </Col>
          <Col xs="auto">
            <Form.Control
              type="text"
              placeholder="99:99:99"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              pattern="[0-9]{2}:[0-9]{2}:[0-9]{2}"
              title="Format: hh:mm:ss"
              className="timestamp-input"
            />
          </Col>
          <Col xs="auto">
            <Button 
              type="submit" 
              size="sm" 
              variant="outline-primary"
              className="timestamp-btn"
            >
              Apply
            </Button>
            {isFilterActive && (
              <Button 
                size="sm" 
                variant="outline-secondary"
                className="timestamp-btn ms-2"
                onClick={handleClearFilter}
              >
                Clear
              </Button>
            )}
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default TimestampFilter;