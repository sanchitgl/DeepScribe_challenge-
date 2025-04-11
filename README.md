# DeepScribe Coding Challenge

This project is a solution for DeepScribe's coding challenge, creating an interactive chat interface that allows healthcare providers to query patient transcripts and receive context-aware responses using an LLM.

## Demo

[Link to deployed demo](#) - *Add your deployment link once available*

## Features

- **Transcript Management**:
  - View and search through a medical transcript
  - Highlighted search results
  - Clear separation of provider and patient dialogue

- **SOAP Note Integration**:
  - Structured display of Subjective, Objective, Assessment, and Plan notes
  - Formatted for readability with proper sectioning

- **Intelligent Chat Interface**:
  - Ask questions about the patient encounter
  - Get context-aware responses from the AI
  - Follow-up questions maintain conversation context
  - Suggested questions for quick access
  - New conversation option to reset context

- **Innovative Elements**:
  - Search functionality for quickly finding information in the transcript
  - Visual distinction between patient and provider dialogue
  - Clean, medical-themed UI designed for clinical use
  - Tab-based interface to switch between transcript and SOAP note

## Technical Architecture

### Backend
- Python with Flask API
- OpenAI GPT integration for natural language processing
- Context management for follow-up questions

### Frontend
- React for UI components
- Bootstrap for responsive design
- Clean and intuitive interface for healthcare providers

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- Python (v3.8 or higher)
- OpenAI API key

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-username/deepscribe-challenge.git
   cd deepscribe-challenge
   ```

2. Set up the backend:
   ```
   cd backend
   pip install -r requirements.txt
   
   # Create a .env file with your OpenAI API key
   echo "OPENAI_API_KEY=your-api-key-here" > .env
   
   # Start the Flask server
   python app.py
   ```

3. Set up the frontend:
   ```
   cd ../frontend
   npm install
   
   # Start the React development server
   npm start
   ```

4. Open your browser and navigate to `http://localhost:3000`

## Approach and Design Decisions

### LLM Integration
I integrated OpenAI's GPT model to process queries with specific prompt engineering to:
- Keep responses focused on transcript content
- Maintain conversation context for follow-ups
- Provide concise but informative answers

### Handling Long Transcripts
While this demo uses a relatively short transcript, the approach scales to longer conversations by:
- Implementing efficient search functionality
- Using a scrollable interface with clear timestamps
- Providing helpful UI for navigating through content

### Edge Cases Handled
- No matching results for searches
- Loading states for API calls
- Error handling for failed requests
- Context management for multi-turn conversations

## Future Enhancements

With more time, I would implement:
- **Semantic Search**: Using embeddings to find relevant transcript sections beyond keyword matching
- **Visual Timeline**: Interactive timeline of the patient encounter
- **Automatic Highlighting**: Highlight relevant transcript sections when answering questions
- **Voice Input**: Allow providers to ask questions verbally
- **Expanded Analytics**: Provide insights about the encounter (duration of topics, sentiment analysis)
- **Export Functionality**: Allow providers to export key findings

## License
This project is created as part of a coding challenge for DeepScribe.