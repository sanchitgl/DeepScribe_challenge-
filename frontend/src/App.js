import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import Chat from './components/Chat';
import Transcript from './components/Transcript';
import SoapNote from './components/SoapNote';
import { Tabs, Tab } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  const [transcript, setTranscript] = useState(null);
  const [soapNote, setSoapNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch transcript and SOAP note data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch transcript data
        const API_URL = process.env.REACT_APP_API_URL || '';
        const transcriptResponse = await fetch(`${API_URL}/api/transcript`);
        if (!transcriptResponse.ok) {
          throw new Error('Failed to fetch transcript data');
        }
        const transcriptData = await transcriptResponse.json();
        setTranscript(transcriptData);
        
        // Fetch SOAP note data
        const soapResponse = await fetch(`${API_URL}/api/soap`);
        if (!soapResponse.ok) {
          throw new Error('Failed to fetch SOAP note data');
        }
        const soapData = await soapResponse.json();
        setSoapNote(soapData);
        
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (loading) {
    return <div className="loading">Loading medical data...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>DeepScribe Medical Assistant</h1>
        <p>Ask questions about the patient transcript and medical notes</p>
      </header>
      
      <Container fluid>
        <Row>
          {/* Left panel: Transcript and SOAP note */}
          <Col md={6} className="transcript-panel">
            <Tabs defaultActiveKey="transcript" id="medical-data-tabs">
              <Tab eventKey="transcript" title="Transcript">
                <Transcript transcript={transcript} />
              </Tab>
              <Tab eventKey="soap" title="SOAP Note">
                <SoapNote soapNote={soapNote} />
              </Tab>
            </Tabs>
          </Col>
          
          {/* Right panel: Chat interface */}
          <Col md={6} className="chat-panel">
            <Chat transcript={transcript} soapNote={soapNote} />
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default App;