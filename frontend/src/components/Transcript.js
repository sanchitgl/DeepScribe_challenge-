import React, { useState } from 'react';
import { Form } from 'react-bootstrap';
import './Transcript.css';

const Transcript = ({ transcript }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter transcript entries based on search term
  const filteredTranscript = transcript?.transcript.filter(entry => {
    return entry.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
           entry.speaker.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="transcript-container">
      <div className="transcript-header">
        <h3>Patient-Provider Transcript</h3>
        <div className="patient-info">
          <p><strong>Patient:</strong> {transcript?.metadata.patientName} (ID: {transcript?.metadata.patientID})</p>
          <p><strong>Provider:</strong> {transcript?.metadata.providerName}</p>
          <p><strong>Date:</strong> {transcript?.metadata.date}</p>
          <p><strong>Duration:</strong> {transcript?.metadata.duration}</p>
        </div>
        <Form.Group className="transcript-search">
          <Form.Control
            type="text"
            placeholder="Search transcript..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Form.Group>
      </div>
      
      <div className="transcript-body">
        {filteredTranscript?.length > 0 ? (
          filteredTranscript.map((entry, index) => (
            <div 
              key={index} 
              className={`transcript-entry ${entry.speaker === 'Dr. Johnson' ? 'provider-entry' : 'patient-entry'}`}
            >
              <div className="transcript-timestamp">{entry.timestamp}</div>
              <div className="transcript-speaker">{entry.speaker}</div>
              <div className="transcript-text">
                {searchTerm && entry.text.toLowerCase().includes(searchTerm.toLowerCase()) ? (
                  highlightText(entry.text, searchTerm)
                ) : (
                  entry.text
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="no-results">
            {searchTerm ? "No matching entries found" : "No transcript data available"}
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to highlight search term in text
const highlightText = (text, searchTerm) => {
  if (!searchTerm) return text;
  
  const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
  
  return (
    <>
      {parts.map((part, index) => (
        part.toLowerCase() === searchTerm.toLowerCase() ? (
          <span key={index} className="highlight">{part}</span>
        ) : (
          part
        )
      ))}
    </>
  );
};

export default Transcript;