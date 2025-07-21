import psycopg2
from minio import Minio
import os
import ollama
from qdrant_client import QdrantClient
from qdrant_client.models import VectorParams, Distance, PointStruct
from dotenv import load_dotenv
import json
import uuid as uuid_pkg
import traceback
from markitdown import MarkItDown
from langchain_ollama import OllamaEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter

load_dotenv()

def chunk_text(text: str):
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=int(os.getenv("EMBEDDING_CHUNK_SIZE")), chunk_overlap=int(os.getenv("EMBEDDING_CHUNK_OVERLAP")))
    chunks = text_splitter.split_text(text)
    return chunks

def embed_text(text: str):
    embeddings = OllamaEmbeddings(
        model=os.getenv("MODEL_EMBEDDING"),
        base_url="http://localhost:11434"
    )
    return embeddings.embed_query(text)

def init_minio():
    # Initialize MinIO buckets
    print("Initializating MinIO")
    minio_client = Minio(
        "localhost:9000",
        access_key=os.getenv("MINIO_ROOT_USER"),
        secret_key=os.getenv("MINIO_ROOT_PASSWORD"),
        secure=False,
    )
    minio_client.make_bucket(os.getenv("MINIO_DEFAULT_BUCKET"))

    policy = {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Principal": {"AWS": "*"},
                "Action": ["s3:GetObject"],
                "Resource": [f"arn:aws:s3:::{os.getenv('MINIO_DEFAULT_BUCKET')}/*"],
            }
        ],
    }

    minio_client.set_bucket_policy(os.getenv("MINIO_DEFAULT_BUCKET"), json.dumps(policy))


def init_postgres():
    # Initialize PostgreSQL
    print("Initializating PostgreSQL")
    postgres_conn = psycopg2.connect(
        host="localhost",
        port="5432",
        database=os.getenv("POSTGRES_DB"),
        user=os.getenv("POSTGRES_USER"),
        password=os.getenv("POSTGRES_PASSWORD"),
    )
    postgres_cursor = postgres_conn.cursor()

    with open(f'{os.getenv("INIT_DATA_FOLDER")}/{os.getenv("INIT_SCHEMA_FILE")}', "r") as file:
        sql_commands = file.read()
        postgres_cursor.execute(sql_commands)

    postgres_conn.commit()
    postgres_cursor.close()
    postgres_conn.close()


def init_qdrant():
    # Initialize Qdrant
    print("Initializating Qdrant")
    qdrant_client = QdrantClient(host="localhost", port=6333)

    qdrant_client.create_collection(
        collection_name=os.getenv("QDRANT_DEFAULT_COLLECTION"),
        vectors_config=VectorParams(size=os.getenv("EMBEDDING_DIMENSION"), distance=Distance.COSINE),
    )
    
    qdrant_client.create_collection(
        collection_name=os.getenv("QDRANT_SYSML_COLLECTION"),
        vectors_config=VectorParams(size=os.getenv("EMBEDDING_DIMENSION"), distance=Distance.COSINE),
    )


def init_ollama():
    # Initialize Ollama client and pull llama2 model
    print("Initializating Ollama")
    ollama_client = ollama.Client(
        host="http://localhost:11434"  # Default Ollama API endpoint
    )

    ollama_client.pull(os.getenv("MODEL_EMBEDDING"))
    models = os.getenv("MODELS_THINKING").split(",")
    for model in models:
        model = model.strip()
        if model:
            ollama_client.pull(model)

def init_models():
    # Initialize models
    print("Initializating Models")
    ollama_client = ollama.Client(
        host="http://localhost:11434"  # Default Ollama API endpoint
    )
    
    # Create solver model from template
    print("Creating solver model from template...")
    script_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    system_prompt_path_solver = os.path.join(script_dir, "..", "models", "solver.j2")
    system_prompt_path_expert = os.path.join(script_dir, "..", "models", "expert.j2")
    
    try:
        with open(system_prompt_path_solver, 'r') as f:
            system_prompt_content_solver = f.read()
            
        with open(system_prompt_path_expert, 'r') as f:
            system_prompt_content_expert = f.read()
            

        ollama.create(model='solver', from_='qwen3:14b', system=system_prompt_content_solver)
        ollama.create(model='expert', from_='qwen3:14b', system=system_prompt_content_expert)
        print("Successfully created solver model")
    except Exception as e:
        print(f"Error creating solver model: {e}")

def init_sysml_knowledge():
    print("Initializing SysML Knowledge Base")
    try:
        # Get the path to raw data files
        raw_data_path = os.path.join(os.getenv("INIT_DATA_FOLDER"), "raw")
        
        # Process each PDF file in the raw data directory
        for filename in os.listdir(raw_data_path):
            if filename.endswith('.pdf'):
                print(f"Processing {filename}...")
                file_path = os.path.join(raw_data_path, filename)
                
                # Convert PDF to text using MarkItDown
                md = MarkItDown(enable_plugins=False)
                result = md.convert(file_path)
                content = result.text_content
                
                # Chunk the content
                chunks = chunk_text(content)
                
                # Generate embeddings for each chunk
                embeddings = []
                for chunk in chunks:
                    embedding = embed_text(chunk)
                    embeddings.append(embedding)
                
                # Prepare metadata
                metadata = {
                    "filename": filename,
                    "content_type": "application/pdf",
                    "total_characters": len(content)
                }
                
                # Create points for Qdrant
                points = []
                for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
                    point_id = str(uuid_pkg.uuid4())
                    
                    payload = {
                        "text": chunk,
                        "filename": filename,
                        "chunk_index": i,
                        "total_chunks": len(chunks),
                        "chunk_size": len(chunk),
                        **metadata
                    }
                    
                    points.append(PointStruct(
                        id=point_id,
                        vector=embedding,
                        payload=payload
                    ))
                
                # Insert into Qdrant
                qdrant_client = QdrantClient(host="localhost", port=6333)
                qdrant_client.upsert(
                    collection_name=os.getenv("QDRANT_SYSML_COLLECTION"),
                    points=points
                )
                print(f"Successfully processed {filename}")
                
    except Exception as e:
        print(f"Error initializing SysML knowledge: {str(e)}")
        traceback.print_exc()

if __name__ == "__main__":
    print("Starting initialization...")
    init_minio()
    init_postgres()
    init_qdrant()
    init_ollama()
    init_models()
    init_sysml_knowledge()
