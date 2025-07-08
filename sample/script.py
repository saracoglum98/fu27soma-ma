import psycopg2
from dotenv import load_dotenv
import os
import requests

load_dotenv()

def seed_knowledge_items():
    postgres_conn = psycopg2.connect(
        host="localhost",
        port="5432",
        database=os.getenv("POSTGRES_DB"),
        user=os.getenv("POSTGRES_USER"),
        password=os.getenv("POSTGRES_PASSWORD"),
    )
    postgres_cursor = postgres_conn.cursor()

    with open('sample_knowledge_items.sql', "r") as file:
        sql_commands = file.read()
        postgres_cursor.execute(sql_commands)

    postgres_conn.commit()
    postgres_cursor.close()
    postgres_conn.close()

def upload_knowledge_items(uuid: str, file_path: str):
    """
    Upload a file to the knowledge items API.
    
    Args:
        uuid (str): The UUID of the knowledge item
        file_path (str): Path to the file to upload
    
    Returns:
        dict: The response from the API containing the knowledge item details
    """
    try:
        # Check if file exists
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")
        
        # Prepare the file for upload
        with open(file_path, 'rb') as file:
            files = {'file': (os.path.basename(file_path), file)}
            
            # Make the request to the API
            response = requests.put(
                f"http://localhost:8000/knowledge_items/upload/{uuid}",
                files=files
            )
            
            # Check if request was successful
            response.raise_for_status()
            
            return response.json()
            
    except FileNotFoundError as e:
        print(f"Error: {str(e)}")
        raise
    except requests.exceptions.RequestException as e:
        print(f"API request failed: {str(e)}")
        raise
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        raise

def seed_options():
    pass

def seed_functions():
    pass

def seed_solution_spaces():
    pass

if __name__ == "__main__":
    seed_knowledge_items()
    upload_knowledge_items("fd6727fa-d7fa-4e6a-b4b3-52c7e2824887", "raw/test.pdf")
    #seed_options()
    #seed_functions()
    #seed_solution_spaces()
