import psycopg2
from minio import Minio
import os
import ollama
from qdrant_client import QdrantClient
from qdrant_client.models import VectorParams, Distance
from dotenv import load_dotenv

load_dotenv()


def init_minio():
    # Initialize MinIO buckets
    print("Initializating MinIO")
    minio_client = Minio("localhost:9000",
                        access_key=os.getenv("MINIO_ROOT_USER"),
                        secret_key=os.getenv("MINIO_ROOT_PASSWORD"),
                        secure=False)
    minio_client.make_bucket(os.getenv("MINIO_DEFAULT_BUCKET"))

def init_postgres():
    # Initialize PostgreSQL
    print("Initializating PostgreSQL")
    postgres_conn = psycopg2.connect(
        host="localhost",
        port="5432",
        database=os.getenv("POSTGRES_DB"),
        user=os.getenv("POSTGRES_USER"),
        password=os.getenv("POSTGRES_PASSWORD")
    )
    postgres_cursor = postgres_conn.cursor()

    with open(os.getenv("INIT_SCHEMA_FILE"), 'r') as file:
        sql_commands = file.read()
        postgres_cursor.execute(sql_commands)

    postgres_conn.commit()
    postgres_cursor.close()
    postgres_conn.close()

def init_qdrant():
    # Initialize Qdrant
    print("Initializating Qdrant")
    qdrant_client = QdrantClient(host='localhost',port=6333)

    qdrant_client.create_collection(
        collection_name=os.getenv("QDRANT_DEFAULT_COLLECTION"),
        vectors_config=VectorParams(size=100, distance=Distance.COSINE))

def init_ollama():
    # Initialize Ollama client and pull llama2 model
    print("Initializating Ollama")
    ollama_client = ollama.Client(
        host='http://localhost:11434'  # Default Ollama API endpoint
    )
    ollama_client.pull('tinyllama')
    ollama_client.pull('nomic-embed-text')

if __name__ == "__main__":
    print("Starting initialization...")
    init_minio()
    init_postgres()
    init_qdrant()
    init_ollama()

