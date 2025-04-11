import os
import numpy as np
import openai
from sklearn.metrics.pairwise import cosine_similarity

class TranscriptRAG:
    def __init__(self, transcript_data, chunk_size=3):
        """
        Initialize the RAG system with transcript data
        
        Args:
            transcript_data (dict): The transcript data dictionary
            chunk_size (int): Number of conversation turns to include in each chunk
        """
        self.transcript_data = transcript_data
        self.chunk_size = chunk_size
        self.chunks = self._create_chunks()
        self.chunk_embeddings = self._generate_embeddings()
        
    def _create_chunks(self):
        """
        Create chunks from the transcript data
        
        Returns:
            list: List of chunk dictionaries with text and metadata
        """
        transcript = self.transcript_data.get("transcript", [])
        soap_note = self.transcript_data.get("soapNote", {})
        
        chunks = []
        
        # Create chunks from conversation transcript
        # Using sliding window of chunk_size conversation turns
        for i in range(0, len(transcript), self.chunk_size):
            end_idx = min(i + self.chunk_size, len(transcript))
            chunk_entries = transcript[i:end_idx]
            
            # Format the chunk text
            chunk_text = ""
            for entry in chunk_entries:
                chunk_text += f"{entry['speaker']}: {entry['text']}\n"
            
            # Create metadata
            start_time = chunk_entries[0]['timestamp']
            end_time = chunk_entries[-1]['timestamp']
            speakers = set(entry['speaker'] for entry in chunk_entries)
            
            # Create the chunk
            chunks.append({
                "text": chunk_text,
                "metadata": {
                    "type": "transcript",
                    "start_time": start_time,
                    "end_time": end_time,
                    "speakers": list(speakers),
                    "index_range": (i, end_idx - 1)
                }
            })
        
        # Create chunks from SOAP note (one chunk per section)
        for section, content in soap_note.items():
            if content:
                chunks.append({
                    "text": f"{section.upper()}: {content}",
                    "metadata": {
                        "type": "soap",
                        "section": section
                    }
                })
        
        return chunks
    
    def _generate_embeddings(self):
        """
        Generate embeddings for all chunks
        
        Returns:
            list: List of embeddings for each chunk
        """

        embeddings = []
        
        for chunk in self.chunks:
            try:
                client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
                response = client.embeddings.create(
                    input=chunk["text"],
                    model="text-embedding-ada-002"
                )
                embeddings.append(response.data[0].embedding)
            except Exception as e:
                print(f"Error generating embedding: {e}")
                # Create a zero embedding as fallback
                embeddings.append([0] * 1536)  # Ada embeddings are 1536 dimensions
        
        return embeddings
    
    

    def get_relevant_chunks(self, query, top_k=3):
        """
        Get the most relevant chunks for a query
        
        Args:
            query (str): The user's query
            top_k (int): Number of top chunks to return
        
        Returns:
            list: List of relevant chunk texts
        """
        
        try:
            # Generate query embedding
            client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
            query_response = client.embeddings.create(
                input=query,
                model="text-embedding-ada-002"
            )
            query_embedding = query_response.data[0].embedding
            
            # Calculate similarities
            similarities = []
            for chunk_embedding in self.chunk_embeddings:
                # Calculate cosine similarity
                similarity = cosine_similarity(
                    [query_embedding], 
                    [chunk_embedding]
                )[0][0]
                similarities.append(similarity)
            
            # Get indices of top-k chunks
            top_indices = np.argsort(similarities)[-top_k:][::-1]
            
            # Return the relevant chunks
            relevant_chunks = [self.chunks[i]["text"] for i in top_indices]
            relevant_metadata = [self.chunks[i]["metadata"] for i in top_indices]
            
            return relevant_chunks, relevant_metadata
            
        except Exception as e:
            print(f"Error retrieving relevant chunks: {e}")
            # If retrieval fails, return the first chunks as fallback
            return [chunk["text"] for chunk in self.chunks[:top_k]], [chunk["metadata"] for chunk in self.chunks[:top_k]]

    def get_context_for_query(self, query, conversation_history=None):
        """
        Get the context for a query, combining relevant chunks and conversation history
        
        Args:
            query (str): The user's query
            conversation_history (list): List of previous messages
        
        Returns:
            str: The formatted context for the LLM
        """
        # Get relevant chunks
        relevant_chunks, metadata = self.get_relevant_chunks(query)
        
        # Format the context
        context = "RELEVANT TRANSCRIPT AND SOAP NOTE SECTIONS:\n\n"
        
        for i, (chunk, meta) in enumerate(zip(relevant_chunks, metadata)):
            if meta["type"] == "transcript":
                context += f"TRANSCRIPT SECTION ({meta['start_time']} - {meta['end_time']}):\n{chunk}\n\n"
            else:
                context += f"SOAP {meta['section'].upper()} SECTION:\n{chunk}\n\n"
        
        return context