# routes/document_routes.py
from flask import Blueprint, request, send_file, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import os
from database.db import get_db
from bson.objectid import ObjectId

# Create blueprint
document_bp = Blueprint('document', __name__)
@document_bp.route("/download", methods=["GET"])
def download_document():
    """Download a document from the server"""
    try:
        db = get_db()
        
        # Get the file path from the query parameters
        file_path = request.args.get('path')
        if not file_path:
            return jsonify({"message": "No file path provided"}), 400
        
        # Normalize the path - handle both relative and absolute paths
        base_dir = os.getcwd()
        
        # If the path doesn't include the full base directory, prepend it
        if not os.path.isabs(file_path):
            file_path = os.path.join(base_dir, file_path)
        
        # Security check: Make sure the path is within the uploads directory
        uploads_dir = os.path.join(base_dir, "uploads")
        normalized_path = os.path.normpath(file_path)
        normalized_uploads = os.path.normpath(uploads_dir)
        
        # Check if the normalized path starts with the normalized uploads directory
        if not normalized_path.startswith(normalized_uploads):
            print(f"Security error: Path {normalized_path} is not within {normalized_uploads}")
            return jsonify({"message": "Invalid file path"}), 403
        
        # Check if file exists
        if not os.path.exists(normalized_path):
            return jsonify({"message": f"File not found on server: {normalized_path}"}), 404
        
        # Get the filename from the file path
        filename = os.path.basename(normalized_path)
        
        # Return the file as an attachment
        return send_file(normalized_path, as_attachment=True, download_name=filename)
        
    except Exception as e:
        print(f"Error downloading document: {str(e)}")
        return jsonify({"message": "An error occurred while downloading the document"}), 500