# routes/case_routes.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from bson.objectid import ObjectId
import os
from werkzeug.utils import secure_filename
from database.db import get_db, serialize_doc
from utils.gemini_classifier import classify_case_sync

# Create blueprint
case_bp = Blueprint('case', __name__)

# Allowed file extensions
ALLOWED_EXTENSIONS = {'pdf', 'docx', 'jpg', 'jpeg'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@case_bp.route("/report", methods=["POST"])
@jwt_required()
def report_case():
    try:
        # Get the current user ID from the JWT token
        user_id = get_jwt_identity()
        db = get_db()
        
        # Verify user exists
        user = db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            return jsonify({"message": "User not found"}), 404
        
        # Get form data from request
        data = request.form
        
        # Use Gemini to classify the case based on the description
        description = data.get("description", "")
        
        # If the user provided a category and we want to override, we can use it
        # Otherwise, use Gemini to classify
        if data.get("category") and data.get("category").strip():
            category = data.get("category")
        else:
            category = classify_case_sync(description)
        
        # Create a new case document
        new_case = {
            "title": data.get("title"),
            "description": description,
            "category": category,  # Use the classified category
            "urgencyLevel": data.get("urgencyLevel"),
            "communicationMethod": data.get("communicationMethod"),
            "specialRequirements": data.get("specialRequirements", ""),
            "clientId": ObjectId(user_id),
            "clientName": f"{user.get('firstName', '')} {user.get('lastName', '')}",
            "status": "Pending",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "assignedLawyer": None,
            "documents": [],
            "aiClassified": category != data.get("category")  # Flag if AI classified
        }
        
        # Handle file uploads if any
        if 'documents' in request.files:
            uploaded_files = request.files.getlist('documents')
            document_paths = []
            
            for file in uploaded_files:
                if file and allowed_file(file.filename):
                    # Create uploads directory if it doesn't exist
                    upload_dir = os.path.join('uploads', user_id)
                    if not os.path.exists(upload_dir):
                        os.makedirs(upload_dir, exist_ok=True)
                        
                    # Secure the filename and save the file
                    filename = secure_filename(file.filename)
                    timestamp = datetime.utcnow().strftime('%Y%m%d%H%M%S')
                    unique_filename = f"{timestamp}_{filename}"
                    file_path = os.path.join(upload_dir, unique_filename)
                    file.save(file_path)
                    
                    # Add file info to the documents list
                    document_paths.append({
                        "filename": filename,
                        "path": file_path,
                        "uploadedAt": datetime.utcnow()
                    })
            
            # Add document paths to the case
            new_case["documents"] = document_paths
        
        # Insert the case into the database
        result = db.cases.insert_one(new_case)
        
        # Add the case to the user's cases list
        db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$push": {"cases": result.inserted_id}}
        )
        
        return jsonify({
            "message": "Case reported successfully",
            "caseId": str(result.inserted_id),
            "category": category,
            "aiClassified": category != data.get("category"),
            "created_at": new_case["created_at"].isoformat()
        }), 201
        
    except Exception as e:
        print(f"Error reporting case: {str(e)}")
        return jsonify({"message": "An error occurred while reporting the case"}), 500

@case_bp.route("/client/cases", methods=["GET"])
@jwt_required()
def get_client_cases():
    user_id = get_jwt_identity()
    db = get_db()
    
    try:
        # Check if user exists and is a client
        user = db.users.find_one({"_id": ObjectId(user_id)})
        if not user or "client" not in user.get("roles", []):
            return jsonify({"message": "Unauthorized"}), 403
        
        # Get all cases for this client
        cases = list(db.cases.find({"clientId": ObjectId(user_id)}).sort("created_at", -1))
        
        # Serialize the results - this fixes the ObjectId issue
        serialized_cases = []
        for case in cases:
            case_dict = serialize_doc(case)
            
            # Handle lawyer data if present
            if case.get("assignedLawyer"):
                lawyer = db.users.find_one({"_id": case["assignedLawyer"]})
                if lawyer:
                    case_dict["assignedLawyer"] = {
                        "name": f"{lawyer.get('firstName', '')} {lawyer.get('lastName', '')}",
                        "id": str(lawyer["_id"]),
                    }
            
            serialized_cases.append(case_dict)
        
        return jsonify({
            "cases": serialized_cases
        }), 200
    except Exception as e:
        print(f"Error getting client cases: {str(e)}")
        return jsonify({"message": "An error occurred while retrieving cases"}), 500

@case_bp.route("/case/<case_id>", methods=["GET"])
@jwt_required()
def get_case_details(case_id):
    user_id = get_jwt_identity()
    db = get_db()
    
    try:
        # Verify user exists
        user = db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            return jsonify({"message": "User not found"}), 404
        
        # Get the case from the database
        try:
            case = db.cases.find_one({"_id": ObjectId(case_id)})
        except:
            return jsonify({"message": "Invalid case ID"}), 400
        
        if not case:
            return jsonify({"message": "Case not found"}), 404
        
        # Check if user has access to this case
        user_roles = user.get("roles", [])
        if "admin" not in user_roles:
            if "client" in user_roles and str(case.get("clientId")) != user_id:
                return jsonify({"message": "Access denied"}), 403
            if "lawyer" in user_roles and case.get("assignedLawyer") != ObjectId(user_id):
                return jsonify({"message": "Access denied"}), 403
        
        # Handle lawyer data if present
        case_dict = serialize_doc(case)
        if case.get("assignedLawyer"):
            lawyer = db.users.find_one({"_id": case["assignedLawyer"]})
            if lawyer:
                case_dict["assignedLawyer"] = {
                    "name": f"{lawyer.get('firstName', '')} {lawyer.get('lastName', '')}",
                    "id": str(lawyer["_id"]),
                }
        
        # Return the case details
        return jsonify(case_dict), 200
    except Exception as e:
        print(f"Error getting case details: {str(e)}")
        return jsonify({"message": "An error occurred while retrieving case details"}), 500
    

@case_bp.route("/add-comment/<case_id>", methods=["POST"])
@jwt_required()
def add_comment(case_id):
    """Add a comment to a case"""
    try:
        user_id = get_jwt_identity()
        db = get_db()
        
        # Get the comment from the request body
        data = request.get_json()
        comment_text = data.get("comment")
        
        if not comment_text or not comment_text.strip():
            return jsonify({"message": "Comment cannot be empty"}), 400
        
        # Get the user
        user = db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            return jsonify({"message": "User not found"}), 404
        
        # Get the case
        try:
            case = db.cases.find_one({"_id": ObjectId(case_id)})
        except:
            return jsonify({"message": "Invalid case ID"}), 400
        
        if not case:
            return jsonify({"message": "Case not found"}), 404
        
        # Check if the user is authorized to comment on this case
        # Admin can comment on any case
        is_authorized = "admin" in user.get("roles", [])
        # Client can comment on their own cases
        if not is_authorized and "client" in user.get("roles", []) and str(case.get("clientId")) == user_id:
            is_authorized = True
        # Lawyer can comment on cases assigned to them
        if not is_authorized and "lawyer" in user.get("roles", []) and case.get("assignedLawyer") == ObjectId(user_id):
            is_authorized = True
            
        if not is_authorized:
            return jsonify({"message": "You are not authorized to comment on this case"}), 403
        
        # Create the comment
        now = datetime.utcnow()
        comment = {
            "userId": ObjectId(user_id),
            "userType": user.get("roles", ["client"])[0],  # Use the first role as the user type
            "text": comment_text.strip(),
            "timestamp": now
        }
        
        # Add the comment to the case
        db.cases.update_one(
            {"_id": ObjectId(case_id)},
            {
                "$push": {"comments": comment},
                "$set": {"updated_at": now}
            }
        )
        
        # Get the updated case
        updated_case = db.cases.find_one({"_id": ObjectId(case_id)})
        
        return jsonify({
            "message": "Comment added successfully",
            "case": serialize_doc(updated_case)
        }), 200
        
    except Exception as e:
        print(f"Error adding comment: {str(e)}")
        return jsonify({"message": "An error occurred while adding the comment"}), 500