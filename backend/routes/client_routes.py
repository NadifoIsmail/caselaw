# routes/client_routes.py
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson.objectid import ObjectId
from database.db import get_db

# Create blueprint
client_bp = Blueprint('client', __name__)

@client_bp.route("/dashboard", methods=["GET"])
@jwt_required()
def client_dashboard():
    user_id = get_jwt_identity()
    db = get_db()
    
    # Get the user to check their role
    user = db.users.find_one({"_id": ObjectId(user_id)})
    
    if not user or "client" not in user.get("roles", []):
        return jsonify({"message": "Unauthorized"}), 403
    
    # In a real app, you would fetch client-specific data here
    return jsonify({
        "message": "Client dashboard data",
        "cases": [
            {"id": "1", "title": "Contract Review", "status": "In Progress"},
            {"id": "2", "title": "Trademark Filing", "status": "Pending"}
        ]
    }), 200

@client_bp.route("/cases", methods=["GET"])
@jwt_required()
def get_cases():
    user_id = get_jwt_identity()
    db = get_db()
    
    # Get the user to check their role
    user = db.users.find_one({"_id": ObjectId(user_id)})
    
    if not user or "client" not in user.get("roles", []):
        return jsonify({"message": "Unauthorized"}), 403
    
    # In a real app, fetch cases from database
    # For now, return sample data
    return jsonify({
        "cases": [
            {
                "id": "1", 
                "title": "Contract Review", 
                "status": "In Progress",
                "description": "Review of employment contract",
                "date_created": "2025-01-15"
            },
            {
                "id": "2", 
                "title": "Trademark Filing", 
                "status": "Pending",
                "description": "Filing trademark for company logo",
                "date_created": "2025-02-20"
            }
        ]
    }), 200

@client_bp.route("/report-case", methods=["POST"])
@jwt_required()
def report_case():
    # Implementation for reporting a new case
    return jsonify({"message": "Case reported successfully"}), 201

@client_bp.route("/find-lawyers", methods=["GET"])
@jwt_required()
def find_lawyers():
    # Implementation for finding lawyers
    return jsonify({
        "lawyers": [
            {
                "id": "1",
                "name": "Jane Smith",
                "specialization": "Contract Law",
                "rating": 4.8,
                "cases_handled": 45
            },
            {
                "id": "2",
                "name": "John Doe",
                "specialization": "Intellectual Property",
                "rating": 4.6,
                "cases_handled": 38
            }
        ]
    }), 200
