import psycopg2
from minio import Minio
import os
import ollama
from qdrant_client import QdrantClient
from qdrant_client.models import VectorParams, Distance

def init_minio():
    # Initialize MinIO buckets
    print("Initializating MinIO")
    minio_client = Minio("localhost:9000",
                        access_key="root",
                        secret_key="fu27soma",
                        secure=False)
    minio_client.make_bucket("data")

def init_postgres():
    # Initialize PostgreSQL
    print("Initializating PostgreSQL")
    postgres_conn = psycopg2.connect(
        host="localhost",
        port="5432",
        database="postgres",
        user="root",
        password="fu27soma"
    )
    postgres_cursor = postgres_conn.cursor()

    with open('seed.sql', 'r') as file:
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
        collection_name="data",
        vectors_config=VectorParams(size=100, distance=Distance.COSINE))

def init_ollama():
    # Initialize Ollama client and pull llama2 model
    print("Initializating Ollama")
    ollama_client = ollama.Client(
        host='http://localhost:11434'  # Default Ollama API endpoint
    )
    ollama_client.pull('tinyllama')

if __name__ == "__main__":
    print("Starting initialization...")
    #init_minio()
    init_postgres()
    #init_qdrant()
    #init_ollama()

