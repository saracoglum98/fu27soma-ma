import psycopg2
from minio import Minio
import os

print("Starting initialization...")

# Initialize MinIO buckets
minio_client = Minio("localhost:9000",
                     access_key="root",
                     secret_key="fu27soma",
                     secure=False)
minio_client.make_bucket("data")


# Initialize PostgreSQL
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

print("Initialization completed successfully!")


"""
# Initialize PostgreSQL with seed data


# Read and execute seed.sql

print("Seed SQL executed successfully!")


"""
