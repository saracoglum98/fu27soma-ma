import psycopg2
from dotenv import load_dotenv
import os
import requests
import time

load_dotenv()

def process_sql_file(filename):
    postgres_conn = psycopg2.connect(
        host="localhost",
        port="5432",
        database=os.getenv("POSTGRES_DB"),
        user=os.getenv("POSTGRES_USER"),
        password=os.getenv("POSTGRES_PASSWORD"),
    )
    postgres_cursor = postgres_conn.cursor()

    with open(f'{os.getenv("SEED_DATA_FOLDER")}/{os.getenv("SEED_DATA_FOLDER_SQL")}/{filename}', "r") as file:
        sql_commands = file.read()
        postgres_cursor.execute(sql_commands)

    postgres_conn.commit()
    postgres_cursor.close()
    postgres_conn.close()

def upload_knowledge_items(uuid: str, filename: str):
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
        if not os.path.exists(f'{os.getenv("SEED_DATA_FOLDER")}/{os.getenv("SEED_DATA_FOLDER_RAW")}/{filename}'):
            raise FileNotFoundError(f"File not found: {filename}")
        
        # Prepare the file for upload
        with open(f'{os.getenv("SEED_DATA_FOLDER")}/{os.getenv("SEED_DATA_FOLDER_RAW")}/{filename}', "rb") as file:
            files = {'file': (os.path.basename(filename), file)}
            
            # Make the request to the API
            response = requests.put(
                f"http://localhost:10000/knowledge_items/upload/{uuid}",
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

def attach_knowledge_items_to_options(option_uuid: str, knowledge_item_uuid: str):
    """
    Attach a knowledge item to an option via the API.
    
    Args:
        option_uuid (str): The UUID of the option
        knowledge_item_uuid (str): The UUID of the knowledge item to attach
    
    Returns:
        dict: The response from the API containing the updated option details
    """
    try:
        # Make the request to the API
        response = requests.put(
            f"http://localhost:10000/options/attach/knowledge/{option_uuid}/{knowledge_item_uuid}"
        )
        
        # Check if request was successful
        response.raise_for_status()
        
        return response.json()
        
    except requests.exceptions.RequestException as e:
        print(f"API request failed: {str(e)}")
        raise
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        raise

if __name__ == "__main__":
    #process_sql_file("knowledge_items.sql")
    process_sql_file("options.sql")
    process_sql_file("functions.sql")
    process_sql_file("solution_spaces.sql")
    process_sql_file("solutions.sql")
    process_sql_file("knowledge_items.sql")
    upload_knowledge_items("3ae112f2-131d-4263-bc2c-28297f1c1174", "conveyor-belt.pdf")
    attach_knowledge_items_to_options("cc9a94a0-a303-452f-8153-4fd2927c6703", "3ae112f2-131d-4263-bc2c-28297f1c1174")
    #upload_knowledge_items("ca7d738e-1c9f-415e-b600-de22b3aab619", "report.pdf")
    #upload_knowledge_items("b09f05c9-da52-46c6-a84d-3fcdde0a8d52", "lecture.pdf")
