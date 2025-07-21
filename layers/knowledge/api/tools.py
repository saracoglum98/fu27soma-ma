from dotenv import load_dotenv
import os
from connections import my_ollama, my_embeddings
from langchain_community.embeddings import OllamaEmbeddings
from langchain_community.vectorstores import Qdrant 
from langchain_text_splitters import RecursiveCharacterTextSplitter

load_dotenv()

def embed_text(text: str):
    embeddings = my_embeddings()
    return embeddings.embed_query(text)

def chunk_text(text: str):
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=int(os.getenv("EMBEDDING_CHUNK_SIZE")), chunk_overlap=int(os.getenv("EMBEDDING_CHUNK_OVERLAP")))
    chunks = text_splitter.split_text(text)
    return chunks