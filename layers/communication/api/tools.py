from dotenv import load_dotenv
import os
from connections import my_ollama

load_dotenv()

def embed_text(text: str):
    model = os.getenv("MODEL_EMBEDDING")
    client = my_ollama()

    response = client.embeddings(model=model, prompt=text)
    return response['embedding']

def chunk_text(text: str):
    chunk_size = int(os.getenv("EMBEDDING_CHUNK_SIZE"))
    overlap = int(os.getenv("EMBEDDING_CHUNK_OVERLAP"))
    if not text or len(text.strip()) == 0:
        return []
    
    chunks = []
    start = 0
    
    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]
        
        # Try to break at sentence or paragraph boundary
        if end < len(text):
            # Look for sentence endings
            sentence_endings = ['.', '!', '?', '\n\n']
            best_break = -1
            
            for ending in sentence_endings:
                last_occurrence = chunk.rfind(ending)
                if last_occurrence > start + chunk_size // 2:  # Don't break too early
                    best_break = max(best_break, last_occurrence)
            
            if best_break > -1:
                chunk = text[start:start + best_break + 1]
                start = start + best_break + 1 - overlap
            else:
                start = end - overlap
        else:
            start = end
        
        # Clean and add chunk
        chunk = chunk.strip()
        if chunk:
            chunks.append(chunk)
    
    return chunks