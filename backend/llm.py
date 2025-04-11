import openai
from transcript import get_relevant_context_for_query, get_context_for_llm, get_soap_note
import os 
from transcript import rag_system
def process_query(query, conversation_history):
    """
    Process a query using the OpenAI GPT model with context from the transcript
    
    Args:
        query (str): The user's query
        conversation_history (list): List of conversation messages
    
    Returns:
        str: The LLM's response
    """
    # Get the transcript and SOAP note context
    context = get_relevant_context_for_query(query, conversation_history)

    relevant_chunks, metadata = rag_system.get_relevant_chunks(query)

    # Create system message with context and instructions
    system_message = f"""
You are an AI assistant helping a healthcare provider review a patient-provider conversation transcript.
Answer the provider's questions based ONLY on the information in the transcript and SOAP note below.
If the information is not in the transcript or SOAP note, say you don't have that information.
Be concise but thorough in your responses. 

{context}
"""
    
    # Prepare messages for the API call
    messages = [
        {"role": "system", "content": system_message}
    ]
    
    # Add conversation history (limited to last 10 messages to manage context length)
    # Skip the first system message if it exists
    start_idx = 1 if len(conversation_history) > 0 and conversation_history[0]["role"] == "system" else 0
    
    # Add the last 10 messages from conversation history
    for msg in conversation_history[-4:]:
        messages.append(msg)
    
    try:
        # Call the OpenAI API
        client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        response = client.chat.completions.create(
            model="gpt-4o",  # Use an appropriate model
            messages=messages,
            max_tokens=500,
            temperature=0.5,  # Lower temperature for more factual responses
        )
        
        # Extract and return the generated response
        return response.choices[0].message.content, relevant_chunks, metadata

    
    except Exception as e:
        print(f"Error calling OpenAI API: {e}")
        return f"I'm sorry, I encountered an error while processing your query. Please try again."

def search_transcript(query, transcript_text):
    """
    Perform a basic search for relevant sections of the transcript
    This is a simple implementation - could be enhanced with embeddings for better results
    
    Args:
        query (str): The search query
        transcript_text (str): The full transcript text
    
    Returns:
        list: Matching sections of the transcript
    """
    # Convert to lowercase for case-insensitive matching
    query_lower = query.lower()
    lines = transcript_text.split('\n')
    
    matches = []
    for line in lines:
        if query_lower in line.lower():
            matches.append(line)
    
    return matches


def generate_suggested_questions(conversation_history):
    """
    Generate suggested follow-up questions based on conversation history and SOAP note
    
    Args:
        conversation_history (list): List of conversation messages
    
    Returns:
        list: List of suggested follow-up questions
    """
    # Get the SOAP note for context
    soap_note = get_soap_note()
    
    # Create a concise summary of what's covered in the SOAP note
    soap_context = f"""
    SOAP NOTE CONTENT:
    Subjective: {soap_note.get('subjective', '')}
    Objective: {soap_note.get('objective', '')}
    Assessment: {soap_note.get('assessment', '')}
    Plan: {soap_note.get('plan', '')}
    """
    
    # If there's no conversation yet, return default questions
    if len(conversation_history) < 2:  # We need at least one Q&A pair
        return [
            "How long have the headaches been going on?",
            "What medications were prescribed?",
            "Are there any triggers for the headaches mentioned?",
            "When is the follow-up appointment scheduled for?"
        ]
    
    # Create prompt for the LLM
    prompt = f"""
    You are assisting a healthcare provider who is analyzing a patient's medical encounter documented in a SOAP note. 
    
    Here's the content of the SOAP note:
    {soap_context}
    
    Important guidelines for generating suggested questions:
    1. Only suggest questions that can be answered based on information in the SOAP note
    2. Phrase questions to ask about what's documented in 3rd person
    3. Avoid suggesting questions that have already been answered in the conversation
    4. Questions should be short, general and succinct
    
    Based on the conversation and patient's SOAP so far, suggest 3 follow-up succinct questions.
    
    Only return the questions, one per line (have \n as separation), with no numbering or additional text.
    """
    
    # Prepare messages for the API call
    messages = [
        {"role": "system", "content": prompt}
    ]
    
    # Add the last few messages from conversation history (up to 2 exchanges)
    for msg in conversation_history[-4:]:  # Last 4 messages = 2 exchanges
        messages.append(msg)
    
    try:
        # Call the OpenAI API
        client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        response = client.chat.completions.create(
            model="gpt-4o",  # Using a faster, cheaper model for suggestions
            messages=messages,
            max_tokens=150,
            temperature=0.5  # Slightly more creative for question variety
        )
        
        # Extract the suggested questions
        suggestion_text = response.choices[0].message.content
        # print(suggestion_text)
        # Parse the questions (one per line)
        questions = [q.strip() for q in suggestion_text.split('\n') if q.strip()]
        
        # Return up to 4 questions
        return questions[:4]
    
    except Exception as e:
        print(f"Error generating suggested questions: {e}")
        # Return fallback questions if there's an error
        return [
            "What treatments were recommended in the plan?",
            "What were the key findings in the objective assessment?",
            "What symptoms were documented in the subjective section?",
            "What follow-up was scheduled according to the plan?"
        ]