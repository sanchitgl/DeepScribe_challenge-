# DeepScribe Medical Transcript Assistant

## Demo

[https://deepscribe-med-assistant.onrender.com/](https://deepscribe-med-assistant.onrender.com/)

## Features

- **Transcript and SOAP Note Viewer**: Easily browse, search, and navigate through the patient-provider conversation and structured medical notes
- **AI-Powered Chat Interface**: Ask natural language questions about the transcript and receive contextually relevant answers
- **Dynamic Suggested Questions**: Contextually relevant follow-up questions are suggested based on the conversation
- **Retrieval-Augmented Generation (RAG)**: Smart chunking and retrieval of relevant transcript portions for more accurate and efficient responses
- **Timestamp Filtering**: Filter transcript by specific time ranges to quickly find relevant information
- **Relevant Context Display**: See exactly which portions of the transcript were used to generate each answer

## Demo Recording 



https://github.com/user-attachments/assets/f714412e-74e0-4c47-9179-93327d6ec2cf.mp4



## Technical Implementation

### Architecture

- **Frontend**: React with Bootstrap for responsive design
- **Backend**: Python Flask API
- **LLM Integration**: OpenAI's GPT models with context management
- **RAG Implementation**: Custom vector search with transcript chunking

### Intelligent Retrieval System

The system uses sophisticated text chunking and embedding-based retrieval to:

1. Break the transcript into meaningful chunks preserving conversation context
2. Create vector embeddings of both questions and transcript chunks
3. Retrieve the most relevant portions for each query
4. Build contextual prompts for the LLM using only the most relevant information

This approach allows for:
- More accurate answers by focusing on relevant context
- Support for longer transcripts without hitting token limits
- Faster response times and reduced API costs

## How to Use

1. **Browse the Transcript**: View the full patient-provider conversation with search functionality
2. **Consult the SOAP Note**: Review the structured medical documentation
3. **Ask Questions**: Use the chat interface to ask about symptoms, treatments, follow-ups, etc.
4. **Follow Suggestions**: Click on suggested follow-up questions for common inquiries
5. **Filter by Time**: Use timestamp filtering to focus on specific parts of the conversation
6. **View Context**: See which parts of the transcript were used to generate answers

## Getting Started

### Prerequisites
- Python 3.9+
- Node.js 14+
- OpenAI API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/sanchitgl/DeepScribe_challenge-.git
   cd DeepScribe_challenge-
   ```

2. Set up the backend:
   ```bash
   cd backend
   pip install -r requirements.txt
   
   # Create a .env file with your OpenAI API key
   echo "OPENAI_API_KEY=your-api-key-here" > .env
   
   # Start the Flask server
   python app.py
   ```

3. Set up the frontend:
   ```bash
   cd ../frontend
   npm install

   # Create a .env file with your OpenAI API key
   echo "REACT_APP_API_URL=http://localhost:5001" > .env
   
   # Start the React development server
   npm start
   ```

4. Open your browser and navigate to `http://localhost:3000`

## Deployment

The application is deployed on Render with separate services for the backend API and frontend interface.
URL - https://deepscribe-med-assistant.onrender.com/

## Technical Challenges and Solutions

**Efficient Handling of Long Transcripts**: Implemented a chunking strategy that preserves conversation context while enabling efficient retrieval.

**Maintaining Context in Follow-up Questions** : Created a conversation history management system that maintains relevant context while avoiding token limitations.

**Accurate Information Retrieval**: Developed a custom RAG implementation using vector similarity search to find the most relevant transcript sections.

---

*This project was created as part of the DeepScribe coding challenge.*
