from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import openai
from transcript import get_transcript_data, get_soap_note
from llm import process_query, generate_suggested_questions

# Load environment variables
load_dotenv()

# Set up OpenAI API key
openai.api_key = os.getenv("OPENAI_API_KEY")

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Store conversation history
conversation_history = []

@app.route('/', methods=['GET'])
def hello():
    """Test endpoint"""
    return jsonify({"message": "Hello from DeepScribe API!"})

@app.route('/api/suggested-questions', methods=['GET'])
def get_suggested_questions():
    """Get suggested follow-up questions based on conversation history"""
    if not conversation_history:
        # Return default questions if no conversation yet
        default_questions = [
            "How long have the headaches been going on?",
            "What medications were prescribed?",
            "Are there any triggers for the headaches?",
            "When is the follow-up appointment?"
        ]
        return jsonify({"questions": default_questions})
    
    # Generate suggested questions based on conversation history
    questions = generate_suggested_questions(conversation_history)
    
    return jsonify({"questions": questions})


@app.route('/api/transcript', methods=['GET'])
def get_transcript():
    """Return the transcript data"""
    return jsonify(get_transcript_data())

@app.route('/api/soap', methods=['GET'])
def get_soap():
    """Return the SOAP note"""
    return jsonify(get_soap_note())

@app.route('/api/chat', methods=['POST'])
def chat():
    """Process a query about the transcript"""
    data = request.json
    query = data.get('query', '')
    
    if not query:
        return jsonify({"error": "No query provided"}), 400
    
    # Add the query to conversation history
    conversation_history.append({"role": "user", "content": query})
    
    # Process the query with LLM
    response, chunks, metadata = process_query(query, conversation_history)
    
    # Add the response to conversation history
    conversation_history.append({"role": "assistant", "content": response})
    
    # Prepare chunks for return
    formatted_chunks = []
    for i, (chunk, meta) in enumerate(zip(chunks, metadata)):
        formatted_chunks.append({
            "text": chunk,
            "type": meta["type"],
            "metadata": meta
        })
    
    return jsonify({
        "response": response,
        "conversation": conversation_history,
        "relevantChunks": formatted_chunks
    })

@app.route('/api/reset', methods=['POST'])
def reset_conversation():
    """Reset the conversation history"""
    global conversation_history
    conversation_history = []
    return jsonify({"status": "Conversation reset successfully"})

if __name__ == '__main__':
    app.run(debug=True, port=5001)