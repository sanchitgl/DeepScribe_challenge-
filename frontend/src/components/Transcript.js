import React, { useState, useRef } from 'react';
import { Form } from 'react-bootstrap';
import TimestampFilter from './TimestampFilter';
import './Transcript.css';

// Helper function to compare timestamps
const isTimestampInRange = (timestamp, start, end) => {
  // Convert all timestamps to seconds for comparison
  const convertToSeconds = (time) => {
    if (!time) return null;
    const [hours, minutes, seconds] = time.split(':').map(Number);
    return hours * 3600 + minutes * 60 + seconds;
  };
  
  const timestampSeconds = convertToSeconds(timestamp);
  const startSeconds = convertToSeconds(start);
  const endSeconds = convertToSeconds(end);
  
  // Check if timestamp is in range
  if (startSeconds !== null && endSeconds !== null) {
    return timestampSeconds >= startSeconds && timestampSeconds <= endSeconds;
  } else if (startSeconds !== null) {
    return timestampSeconds >= startSeconds;
  } else if (endSeconds !== null) {
    return timestampSeconds <= endSeconds;
  }
  
  return true; // No filter applied
};

const Transcript = ({ transcript }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [timeRange, setTimeRange] = useState({ start: '', end: '' });
  const [isTimeFiltered, setIsTimeFiltered] = useState(false);
  const transcriptBodyRef = useRef(null);
  
  // Filter transcript entries based on search term and time range
  const filteredTranscript = transcript?.transcript.filter(entry => {
    const matchesSearch = entry.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        entry.speaker.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Also filter by time range if active
    const matchesTimeRange = !isTimeFiltered || 
      isTimestampInRange(entry.timestamp, timeRange.start, timeRange.end);
    
    return matchesSearch && matchesTimeRange;
  });

  // Handle timestamp filter application
  const handleApplyTimeFilter = (start, end) => {
    setTimeRange({ start, end });
    setIsTimeFiltered(true);
    
    // Scroll to the first matching entry
    if (transcriptBodyRef.current) {
      setTimeout(() => {
        const firstEntry = transcriptBodyRef.current.querySelector('.transcript-entry');
        if (firstEntry) {
          firstEntry.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  // Clear time range filter
  const handleClearTimeFilter = () => {
    setTimeRange({ start: '', end: '' });
    setIsTimeFiltered(false);
  };

  return (
    <div className="transcript-container">
      <div className="transcript-header">
        <h3>Patient-Provider Transcript</h3>
        <div className="patient-info">
          <p><strong>Patient:</strong> {transcript?.metadata.patientName} </p>
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
      
      <TimestampFilter 
        onApplyFilter={handleApplyTimeFilter} 
        onClearFilter={handleClearTimeFilter}
      />
      
      {/* {isTimeFiltered && (
        <div className="active-filter-badge">
          Filtered by time: {timeRange.start || "start"} - {timeRange.end || "end"}
        </div>
      )} */}
      
      <div className="transcript-body" ref={transcriptBodyRef}>
        {filteredTranscript?.length > 0 ? (
          filteredTranscript.map((entry, index) => (
            <div 
              key={index} 
              className={`transcript-entry ${entry.speaker === 'Dr. Johnson' ? 'provider-entry' : 'patient-entry'}`}
              data-timestamp={entry.timestamp}
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
            {searchTerm || isTimeFiltered ? "No matching entries found" : "No transcript data available"}
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