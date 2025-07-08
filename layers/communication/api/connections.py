import os
from dotenv import load_dotenv
import psycopg2
from psycopg2.extras import RealDictCursor
from minio import Minio
load_dotenv()

def db():
    try:
        conn = psycopg2.connect(
            host="data-relational",
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
    
def minio():
    try:
        minio_client = Minio("data-object:9000",
                            access_key=os.getenv("MINIO_ROOT_USER"),
                            secret_key=os.getenv("MINIO_ROOT_PASSWORD"),
                            secure=False)
        return minio_client
    except Exception as e:
        print(f"Error connecting to minio: {e}")
        raise e 