# database/db.py
from pymongo import MongoClient
import os
from dotenv import load_dotenv
from bson.objectid import ObjectId
from datetime import datetime

# Load environment variables
load_dotenv()

# MongoDB connection
mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/legal_app")
client = MongoClient(mongo_uri)
db = client.get_database()

def get_db():
    return db

# Enhanced helper function to serialize MongoDB documents
def serialize_doc(doc):
    """
    Convert MongoDB document to a JSON serializable format.
    This handles ObjectId, datetime, and nested documents/arrays.
    """
    if doc is None:
        return None
        
    if isinstance(doc, (str, int, float, bool)):
        return doc
        
    if isinstance(doc, ObjectId):
        return str(doc)
        
    if isinstance(doc, datetime):
        return doc.isoformat()
        
    if isinstance(doc, list):
        return [serialize_doc(item) for item in doc]
        
    if isinstance(doc, dict):
        return {key: serialize_doc(value) for key, value in doc.items()}
        
    # Default for any other types
    return str(doc)