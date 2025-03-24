# routes/lawyer_case_routes.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from bson.objectid import ObjectId
from database.db import get_db, serialize_doc

# Create blueprint
lawyer_case_bp = Blueprint('lawyer_case', __name__)

@lawyer_case_bp.route("/available-cases", methods=["GET"])
@jwt_required()
def get_available_cases():
    """Get all available cases that are pending lawyer assignment"""
    try:
        user_id = get_jwt_identity()
        db = get_db()
        
        # Check if user exists and is a lawyer
        user = db.users.find_one({"_id": ObjectId(user_id)})
        if not user or "lawyer" not in user.get("roles", []):
            return jsonify({"message": "Unauthorized"}), 403
        
        # Get cases that are pending and not assigned to any lawyer
        cases = list(db.cases.find({
            "status": "Pending",
            "assignedLawyer": None
        }).sort("urgencyLevel", -1).sort("created_at", -1))
        
        # Serialize the results
        serialized_cases = []
        for case in cases:
            case_dict = serialize_doc(case)
            
            # Add client info
            if case.get("clientId"):
                client = db.users.find_one({"_id": case["clientId"]})
                if client:
                    case_dict["client"] = {
                        "name": client.get("firstName", "") + " " + client.get("lastName", ""),
                        "contactPerson": client.get("email", "")
                    }
            
            serialized_cases.append(case_dict)
        
        return jsonify({
            "cases": serialized_cases
        }), 200
    except Exception as e:
        print(f"Error getting available cases: {str(e)}")
        return jsonify({"message": "An error occurred while retrieving available cases"}), 500

@lawyer_case_bp.route("/assigned-cases", methods=["GET"])
@jwt_required()
def get_assigned_cases():
    """Get all cases assigned to the current lawyer"""
    try:
        user_id = get_jwt_identity()
        db = get_db()
        
        # Check if user exists and is a lawyer
        user = db.users.find_one({"_id": ObjectId(user_id)})
        if not user or "lawyer" not in user.get("roles", []):
            return jsonify({"message": "Unauthorized"}), 403
        
        # Get cases assigned to this lawyer
        cases = list(db.cases.find({
            "assignedLawyer": ObjectId(user_id)
        }).sort("updated_at", -1))
        
        # Serialize the results
        serialized_cases = []
        for case in cases:
            case_dict = serialize_doc(case)
            
            # Add client info
            if case.get("clientId"):
                client = db.users.find_one({"_id": case["clientId"]})
                if client:
                    case_dict["client"] = {
                        "name": client.get("firstName", "") + " " + client.get("lastName", ""),
                        "contactPerson": client.get("email", "")
                    }
            
            serialized_cases.append(case_dict)
        
        return jsonify({
            "cases": serialized_cases
        }), 200
    except Exception as e:
        print(f"Error getting assigned cases: {str(e)}")
        return jsonify({"message": "An error occurred while retrieving assigned cases"}), 500

@lawyer_case_bp.route("/accept-case/<case_id>", methods=["POST"])
@jwt_required()
def accept_case(case_id):
    """Accept a case and assign it to the current lawyer"""
    try:
        user_id = get_jwt_identity()
        db = get_db()
        
        # Check if user exists and is a lawyer
        user = db.users.find_one({"_id": ObjectId(user_id)})
        if not user or "lawyer" not in user.get("roles", []):
            return jsonify({"message": "Unauthorized"}), 403
        
        # Get the case
        try:
            case = db.cases.find_one({"_id": ObjectId(case_id)})
        except:
            return jsonify({"message": "Invalid case ID"}), 400
        
        if not case:
            return jsonify({"message": "Case not found"}), 404
        
        # Check if case is already assigned
        if case.get("assignedLawyer") is not None:
            return jsonify({"message": "Case is already assigned to a lawyer"}), 400
        
        # Update the case
        now = datetime.utcnow()
        update_result = db.cases.update_one(
            {"_id": ObjectId(case_id), "assignedLawyer": None},
            {
                "$set": {
                    "assignedLawyer": ObjectId(user_id),
                    "status": "Assigned",
                    "updated_at": now,
                    "assignedAt": now
                }
            }
        )
        
        if update_result.modified_count == 0:
            return jsonify({"message": "Case could not be assigned. It may have been assigned to another lawyer."}), 400
        
        # Add a comment to the case
        lawyer_name = f"{user.get('firstName', '')} {user.get('lastName', '')}"
        db.cases.update_one(
            {"_id": ObjectId(case_id)},
            {
                "$push": {
                    "comments": {
                        "userId": ObjectId(user_id),
                        "userType": "lawyer",
                        "text": f"Case accepted by {lawyer_name}",
                        "timestamp": now
                    }
                }
            }
        )
        
        # Get the updated case
        updated_case = db.cases.find_one({"_id": ObjectId(case_id)})
        
        return jsonify({
            "message": "Case accepted successfully",
            "case": serialize_doc(updated_case)
        }), 200
    except Exception as e:
        print(f"Error accepting case: {str(e)}")
        return jsonify({"message": "An error occurred while accepting the case"}), 500

@lawyer_case_bp.route("/update-case-status/<case_id>", methods=["POST"])
@jwt_required()
def update_case_status(case_id):
    """Update the status of a case assigned to the current lawyer"""
    try:
        data = request.get_json()
        new_status = data.get("status")
        comment = data.get("comment", "")
        
        if not new_status:
            return jsonify({"message": "Status is required"}), 400
        
        if new_status not in ["InProgress", "OnHold", "Closed"]:
            return jsonify({"message": "Invalid status"}), 400
        
        user_id = get_jwt_identity()
        db = get_db()
        
        # Check if user exists and is a lawyer
        user = db.users.find_one({"_id": ObjectId(user_id)})
        if not user or "lawyer" not in user.get("roles", []):
            return jsonify({"message": "Unauthorized"}), 403
        
        # Get the case
        try:
            case = db.cases.find_one({"_id": ObjectId(case_id)})
        except:
            return jsonify({"message": "Invalid case ID"}), 400
        
        if not case:
            return jsonify({"message": "Case not found"}), 404
        
        # Check if case is assigned to this lawyer
        if str(case.get("assignedLawyer")) != user_id:
            return jsonify({"message": "You are not assigned to this case"}), 403
        
        # Update the case status
        now = datetime.utcnow()
        update_result = db.cases.update_one(
            {"_id": ObjectId(case_id), "assignedLawyer": ObjectId(user_id)},
            {
                "$set": {
                    "status": new_status,
                    "updated_at": now
                }
            }
        )
        
        if update_result.modified_count == 0:
            return jsonify({"message": "Case status could not be updated"}), 400
        
        # Add a comment to the case if provided
        if comment:
            lawyer_name = f"{user.get('firstName', '')} {user.get('lastName', '')}"
            db.cases.update_one(
                {"_id": ObjectId(case_id)},
                {
                    "$push": {
                        "comments": {
                            "userId": ObjectId(user_id),
                            "userType": "lawyer",
                            "text": comment,
                            "timestamp": now
                        }
                    }
                }
            )
        
        # Get the updated case
        updated_case = db.cases.find_one({"_id": ObjectId(case_id)})
        
        return jsonify({
            "message": "Case status updated successfully",
            "case": serialize_doc(updated_case)
        }), 200
    except Exception as e:
        print(f"Error updating case status: {str(e)}")
        return jsonify({"message": "An error occurred while updating the case status"}), 500
