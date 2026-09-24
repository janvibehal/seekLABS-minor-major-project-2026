import os
import psycopg
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

def test_connection():
    with psycopg.connect(DATABASE_URL) as conn:
        return "Database connected successfully!"