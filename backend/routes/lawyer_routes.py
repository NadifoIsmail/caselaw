# routes/lawyer_routes.py
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson.objectid import ObjectId
from database.db import get_db

# Create blueprint
lawyer_bp = Blueprint('lawyer', __name__)

@lawyer_bp.route("/dashboard", methods=["GET"])
@jwt_required()
def lawyer_dashboard():
    user_id = get_jwt_identity()
    db = get_db()
    
    # Get the user to check their role
    user = db.users.find_one({"_id": ObjectId(user_id)})
    
    if not user or "lawyer" not in user.get("roles", []):
        return jsonify({"message": "Unauthorized"}), 403
    
    # In a real app, you would fetch lawyer-specific data here
    return jsonify({
        "message": "Lawyer dashboard data",
        "cases": [
            {"id": "1", "title": "Client A - Contract Review", "status": "In Progress"},
            {"id": "2", "title": "Client B - Trademark Filing", "status": "Pending"},
            {"id": "3", "title": "Client C - Legal Consultation", "status": "Completed"}
        ]
    }), 200

@lawyer_bp.route("/available-cases", methods=["GET"])
@jwt_required()
def available_cases():
    user_id = get_jwt_identity()
    db = get_db()
    
    # Get the user to check their role
    user = db.users.find_one({"_id": ObjectId(user_id)})
    
    if not user or "lawyer" not in user.get("roles", []):
        return jsonify({"message": "Unauthorized"}), 403
    
    # In a real app, fetch available cases from database
    # For now, return sample data
    return jsonify({
        "cases": [
            {
                "id": "101", 
                "client_name": "Acme Corp", 
                "title": "Contract Dispute", 
                "type": "Commercial",
                "description": "Contract dispute with supplier",
                "date_posted": "2025-03-10",
                "urgency": "High"
            },
            {
                "id": "102", 
                "client_name": "John Smith", 
                "title": "Patent Filing", 
                "type": "Intellectual Property",
                "description": "Assistance needed for patent filing",
                "date_posted": "2025-03-15",
                "urgency": "Medium"
            },
            {
                "id": "103", 
                "client_name": "Sarah Jones", 
                "title": "Employment Contract Review", 
                "type": "Employment",
                "description": "Need review of employment contract",
                "date_posted": "2025-03-18",
                "urgency": "Low"
            }
        ]
    }), 200

@lawyer_bp.route("/accept-case/<case_id>", methods=["POST"])
@jwt_required()
def accept_case(case_id):
    # Implementation for accepting a case
    return jsonify({
        "message": f"Case {case_id} accepted successfully",
        "case_id": case_id
    }), 200

@lawyer_bp.route("/profile", methods=["GET"])
@jwt_required()
def get_profile():
    user_id = get_jwt_identity()
    db = get_db()
    
    # Get the lawyer profile
    user = db.users.find_one({"_id": ObjectId(user_id)})
    
    if not user or "lawyer" not in user.get("roles", []):
        return jsonify({"message": "Unauthorized"}), 403
    
    # In a real app, fetch complete profile data
    profile = {
        "id": str(user["_id"]),
        "name": f"{user['firstName']} {user['lastName']}",
        "email": user["email"],
        "barNumber": user.get("barNumber", ""),
        "specializations": user.get("specializations", []),
        "bio": user.get("bio", ""),
        "experience": user.get("experience", ""),
        "rating": user.get("rating", 0)
    }
    
    return jsonify(profile), 200

@lawyer_bp.route("/profile", methods=["PUT"])
@jwt_required()
def update_profile():
    # Implementation for updating lawyer profile
    return jsonify({"message": "Profile updated successfully"}), 200
