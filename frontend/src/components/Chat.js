import React, { useState, useRef, useEffect } from 'react';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import './Chat.css';

const Chat = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I can help answer questions about the patient transcript. What would you like to know?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [suggestedQuestions, setSuggestedQuestions] = useState([
    "How long have the headaches been going on?",
    "What medications were prescribed?",
    "Are there any triggers for the headaches?",
    "When is the follow-up appointment?"
  ]);
  const [relevantChunks, setRelevantChunks] = useState([]);
  const [showChunks, setShowChunks] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to the bottom when new messages are added
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch suggested questions after each new message
  useEffect(() => {
    if (messages.length > 1) {  // Only fetch suggestions once there's been some conversation
      fetchSuggestedQuestions();
    }
  }, [messages]);

  // Function to fetch suggested questions
  const fetchSuggestedQuestions = async () => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || '';
      const response = await fetch(`${API_URL}/api/suggested-questions`);
      if (!response.ok) {
        throw new Error('Failed to fetch suggested questions');
      }
      const data = await response.json();
      setSuggestedQuestions(data.questions);
    } catch (err) {
      console.error('Error fetching suggested questions:', err);
      // Keep existing questions if there's an error
    }
  };

  // Handle the submission of a new message
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    // Add the user's message
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    setLoading(true);
    setError(null);
    setRelevantChunks([]);
    
    try {
      // Call the backend API
      const API_URL = process.env.REACT_APP_API_URL || '';
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: input }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get response from server');
      }
      
      const data = await response.json();
      
      // Add the assistant's response
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      setInput('');
      
      // Store relevant chunks
      if (data.relevantChunks && data.relevantChunks.length > 0) {
        setRelevantChunks(data.relevantChunks);
        setShowChunks(false); 
      }
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle resetting the conversation
  const handleReset = async () => {
    try {
      // Call the reset API endpoint
      const API_URL = process.env.REACT_APP_API_URL || '';
      await fetch(`${API_URL}/api/reset`, {
        method: 'POST',
      });
      
      // Reset the local messages
      setMessages([
        {
          role: 'assistant',
          content: 'Hello! I can help answer questions about the patient transcript. What would you like to know?'
        }
      ]);
      setError(null);
      setRelevantChunks([]);
      setShowChunks(false);

      // Reset to default suggested questions
      setSuggestedQuestions([
        "How long have the headaches been going on?",
        "What medications were prescribed?",
        "Are there any triggers for the headaches?",
        "When is the follow-up appointment?"
      ]);

    } catch (err) {
      setError('Failed to reset conversation');
    }
  };

  // Format chunk for display
  const formatChunkDisplay = (chunk) => {
    if (chunk.type === "transcript") {
      return (
        <div className="chunk-transcript">
          <div className="chunk-header">
            <span className="chunk-type">Transcript</span>
            <span className="chunk-time">{chunk.metadata.start_time} - {chunk.metadata.end_time}</span>
          </div>
          <div className="chunk-content">
            {chunk.text.split('\n').map((line, i) => (
              line.trim() ? <p key={i}>{line}</p> : null
            ))}
          </div>
        </div>
      );
    } else {
      return (
        <div className="chunk-soap">
          <div className="chunk-header">
            <span className="chunk-type">SOAP {chunk.metadata.section.toUpperCase()}</span>
          </div>
          <div className="chunk-content">
            {chunk.text}
          </div>
        </div>
      );
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h3>Medical Assistant</h3>
        <Button 
          variant="outline-secondary" 
          size="sm" 
          onClick={handleReset}
        >
          New Conversation
        </Button>
      </div>
      
      <div className="messages-container">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`message ${message.role === 'user' ? 'user-message' : 'assistant-message'}`}
          >
            <div className="message-content">
              {message.content}
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="message assistant-message">
            <div className="message-content">
              <Spinner animation="border" size="sm" /> Thinking...
            </div>
          </div>
        )}
        
        {error && (
          <Alert variant="danger" className="message-error">
            {error}
          </Alert>
        )}
        
        {relevantChunks.length > 0 && (
          <div className="relevant-chunks-container">
            <Button
              variant="link"
              size= "sm"
              onClick={() => setShowChunks(!showChunks)}
              className="chunks-toggle"
            >
              {showChunks ? "Hide" : "Show"} Relevant Context
            </Button>
            
            {showChunks && (
              <div className="chunks-list">
                <h6>Context used to answer this question:</h6>
                {relevantChunks.map((chunk, idx) => (
                  <div key={idx} className="context-chunk">
                    {formatChunkDisplay(chunk)}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <Form onSubmit={handleSubmit} className="message-form">
        <Form.Group className="message-input-group">
          <Form.Control
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about the patient transcript..."
            disabled={loading}
          />
          <Button 
            type="submit" 
            variant="primary" 
            disabled={loading || !input.trim()}
          >
            {loading ? <Spinner animation="border" size="sm" /> : 'Ask'}
          </Button>
        </Form.Group>
      </Form>
      
      <div className="suggested-questions">
        <p>Suggested questions:</p>
        <ul>
          {suggestedQuestions.map((question, index) => (
            <li key={index} onClick={() => setInput(question)}>
              {question}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Chat;