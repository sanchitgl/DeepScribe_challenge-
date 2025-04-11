import React from 'react';
import './SoapNote.css';

const SoapNote = ({ soapNote }) => {
  if (!soapNote) {
    return <div className="no-data">No SOAP note data available</div>;
  }

  return (
    <div className="soap-note-container">
      <h3>SOAP Note</h3>
      
      <div className="soap-section">
        <h4>Subjective</h4>
        <div className="soap-content">{soapNote.subjective}</div>
      </div>
      
      <div className="soap-section">
        <h4>Objective</h4>
        <div className="soap-content">{soapNote.objective}</div>
      </div>
      
      <div className="soap-section">
        <h4>Assessment</h4>
        <div className="soap-content">{formatList(soapNote.assessment)}</div>
      </div>
      
      <div className="soap-section">
        <h4>Plan</h4>
        <div className="soap-content">{formatList(soapNote.plan)}</div>
      </div>
    </div>
  );
};

// Helper function to format numbered lists in Assessment and Plan sections
const formatList = (text) => {
  if (!text) return '';
  
  // If the text contains numbered items (e.g., "1. Item\n2. Item"), format them as a list
  if (text.match(/^\d+\.\s/m)) {
    const items = text.split('\n');
    return (
      <ol>
        {items.map((item, index) => {
          // Extract the item text without the number prefix
          const match = item.match(/^\d+\.\s(.+)$/);
          return match ? <li key={index}>{match[1]}</li> : <li key={index}>{item}</li>;
        })}
      </ol>
    );
  }
  
  // Otherwise, just return the text
  return text;
};

export default SoapNote;