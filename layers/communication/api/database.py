import os
from dotenv import load_dotenv
import psycopg2
from psycopg2.extras import RealDictCursor

load_dotenv()

def get_db_connection():
    try:
        conn = psycopg2.connect(
            host="data-relational",
            database="postgres",
            user="root",
            password="fu27soma",
            port=5432,
            cursor_factory=RealDictCursor
        )
        return conn
    except Exception as e:
        print(f"Error connecting to database: {e}")
        raise e 