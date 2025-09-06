import os
from dotenv import load_dotenv
import psycopg2
from psycopg2.extras import RealDictCursor
from minio import Minio
import ollama
from qdrant_client import QdrantClient
from langchain_ollama import OllamaEmbeddings
load_dotenv()

def my_db():
    try:
        conn = psycopg2.connect(
            host="knowledge-relational",
            database=os.getenv("POSTGRES_DB"),
            user=os.getenv("POSTGRES_USER"),
            password=os.getenv("POSTGRES_PASSWORD"),
            port=5432,
            cursor_factory=RealDictCursor
        )
        return conn
    except Exception as e:
        print(f"Error connecting to database: {e}")
        raise e 
    
def my_minio():
    try:
        minio_client = Minio("knowledge-object:9000",
                            access_key=os.getenv("MINIO_ROOT_USER"),
                            secret_key=os.getenv("MINIO_ROOT_PASSWORD"),
                            secure=False)
        return minio_client
    except Exception as e:
        print(f"Error connecting to minio: {e}")
        raise e 

def my_ollama():
    try:
        ollama_client = ollama.Client(host='http://llm-inference:11434')
        return ollama_client
    except Exception as e:
        print(f"Error connecting to ollama: {e}")
        raise e 

def my_embeddings():
    try:
        embeddings = OllamaEmbeddings(model=os.getenv("MODEL_EMBEDDING"), base_url='http://llm-inference:11434')
        return embeddings
    except Exception as e:
        print(f"Error connecting to embeddings: {e}")
        raise e 

def my_qdrant():
    try:
        qdrant_client = QdrantClient(url='http://knowledge-vector:6333')
        return qdrant_client
    except Exception as e:
        print(f"Error connecting to qdrant: {e}")
        raise e 