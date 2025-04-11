import json
import os
from rag import TranscriptRAG

# Path to the data file
DATA_FILE = os.path.join(os.path.dirname(__file__), 'data', 'patient_transcript.json')

def load_transcript_data():
    """Load transcript data from JSON file"""
    try:
        with open(DATA_FILE, 'r') as file:
            return json.load(file)
    except Exception as e:
        print(f"Error loading transcript data: {e}")
        # Return a minimal fallback structure in case of errors
        return {
            "metadata": {
                "patientName": "Error loading data",
                "patientID": "Error",
                "providerName": "Error",
                "date": "Error",
                "duration": "Error"
            },
            "transcript": [],
            "soapNote": {
                "subjective": "Error loading data",
                "objective": "Error loading data",
                "assessment": "Error loading data",
                "plan": "Error loading data"
            }
        }

# Load the transcript data once when the module is imported
transcript_data = load_transcript_data()

rag_system = TranscriptRAG(transcript_data)

def get_transcript_data():
    """Return the full transcript data"""
    return transcript_data

def get_soap_note():
    """Return just the SOAP note"""
    return transcript_data.get("soapNote", {})

def get_transcript_text():
    """Return just the text content of the transcript for processing"""
    full_text = ""
    for entry in transcript_data.get("transcript", []):
        full_text += f"{entry['speaker']}: {entry['text']}\n"
    return full_text

def get_context_for_llm():
    """Return formatted transcript and SOAP note for LLM context"""
    transcript_text = get_transcript_text()
    soap = get_soap_note()
    
    context = f"""
TRANSCRIPT:
{transcript_text}

SOAP NOTE:
Subjective: {soap.get('subjective', '')}

Objective: {soap.get('objective', '')}

Assessment: {soap.get('assessment', '')}

Plan: {soap.get('plan', '')}
"""
    return context


def get_relevant_context_for_query(query, conversation_history=None):
    """Get relevant context for a specific query using RAG"""
    return rag_system.get_context_for_query(query, conversation_history)