import psycopg2
import time
import requests
from minio import Minio
import os

def wait_for_postgres():
    while True:
        try:
            conn = psycopg2.connect(
                host="data-layer-relational-storage",
                database=os.getenv("POSTGRES_DB"),
                user=os.getenv("POSTGRES_USER", "root"),
                password=os.getenv("POSTGRES_PASSWORD")
            )
            conn.close()
            print("PostgreSQL is ready!")
            break
        except psycopg2.OperationalError:
            print("Waiting for PostgreSQL...")
            time.sleep(5)

def wait_for_minio():
    while True:
        try:
            response = requests.get("http://data-layer-object-storage:9000/minio/health/live")
            if response.status_code == 200:
                print("MinIO is ready!")
                break
        except requests.exceptions.ConnectionError:
            print("Waiting for MinIO...")
            time.sleep(5)

def initialize_object_storage():
    client = Minio(
        "data-layer-object-storage:9000",
        access_key=os.getenv("MINIO_ROOT_USER", "root"),
        secret_key=os.getenv("MINIO_ROOT_PASSWORD"),
        secure=False
    )
    
    # Create buckets if they don't exist
    buckets = os.getenv("MINIO_BUCKETS").split(",")
    for bucket in buckets:
        if not client.bucket_exists(bucket):
            client.make_bucket(bucket)
            print(f"Created bucket: {bucket}")

def initialize_db():
    try:
        conn = psycopg2.connect(
            host="data-layer-relational-storage",
            database=os.getenv("POSTGRES_DB"),
            user=os.getenv("POSTGRES_USER", "root"),
            password=os.getenv("POSTGRES_PASSWORD")
        )
        cursor = conn.cursor()
        
        # Read and execute seed.sql
        with open('seed.sql', 'r') as file:
            sql_commands = file.read()
            cursor.execute(sql_commands)
        
        conn.commit()
        cursor.close()
        conn.close()
        print("Seed SQL executed successfully!")
    except Exception as e:
        print(f"Error executing seed SQL: {e}")
        raise

def main():
    print("Starting initialization...")
    
    # Wait for services to be ready
    wait_for_postgres()
    wait_for_minio()
    
    # Initialize MinIO
    initialize_object_storage()
    
    # Run seed SQL
    initialize_db()
    
    print("Initialization completed successfully!")

if __name__ == "__main__":
    main()
