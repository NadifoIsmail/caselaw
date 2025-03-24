# routes/auth_routes.py
from flask import Blueprint, request, jsonify
from flask_bcrypt import Bcrypt
from flask_jwt_extended import (
    create_access_token, create_refresh_token, 
    jwt_required, get_jwt_identity, get_jwt
)
from datetime import datetime
from bson.objectid import ObjectId
import jwt
from flask import current_app

from database.db import get_db, serialize_doc

# Create blueprint
auth_bp = Blueprint('auth', __name__)
bcrypt = Bcrypt()

@auth_bp.route("/signup", methods=["POST"])
def signup():
    data = request.get_json()
    db = get_db()
    
    # Check if email already exists
    if db.users.find_one({"email": data["email"]}):
        return jsonify({"message": "Email already registered"}), 409
    
    # Hash the password
    hashed_password = bcrypt.generate_password_hash(data["password"]).decode("utf-8")
    
    # Prepare user document
    new_user = {
        "firstName": data["firstName"],
        "lastName": data["lastName"],
        "email": data["email"],
        "password": hashed_password,
        "userType": data["userType"],
        "roles": [data["userType"]],
        "created_at": datetime.utcnow()
    }
    
    # Add bar number for lawyers
    if data["userType"] == "lawyer" and "barNumber" in data:
        new_user["barNumber"] = data["barNumber"]
    
    # Insert the new user
    result = db.users.insert_one(new_user)
    
    return jsonify({
        "message": "Account created successfully. Please log in.",
        "userId": str(result.inserted_id)
    }), 201

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    db = get_db()
    
    # Find the user
    user = db.users.find_one({"email": data["email"]})
    
    # Check if user exists and password is correct
    if not user or not bcrypt.check_password_hash(user["password"], data["password"]):
        return jsonify({"message": "Invalid email or password"}), 401
    
    # Prepare user data for token - simpler identity for JWT
    user_id = str(user["_id"])
    
    # Create tokens with simpler identity
    access_token = create_access_token(identity=user_id)
    refresh_token = create_refresh_token(identity=user_id)
    
    # Prepare user data for response
    user_data = serialize_doc(user)
    del user_data["password"]  # Don't send password hash
    
    return jsonify({
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user": user_data
    }), 200

@auth_bp.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    current_user_id = get_jwt_identity()
    # Create new access token with the user ID
    access_token = create_access_token(identity=current_user_id)
    
    return jsonify({"access_token": access_token}), 200

@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def get_me():
    # Now we're getting a simple user ID from the token
    user_id = get_jwt_identity()
    db = get_db()
    
    try:
        # Find the user in the database
        user = db.users.find_one({"_id": ObjectId(user_id)})
        
        if not user:
            return jsonify({"message": "User not found"}), 404
        
        # Prepare user data for response
        user_data = serialize_doc(user)
        del user_data["password"]  # Don't send password hash
        
        return jsonify(user_data), 200
    except Exception as e:
        print(f"Error in /me endpoint: {str(e)}")
        return jsonify({"message": "Error retrieving user data"}), 500

@auth_bp.route("/logout", methods=["POST"])
def logout():
    db = get_db()
    # Get the token from the authorization header
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Bearer '):
        token = auth_header.split(' ')[1]
        try:
            # Decode the token to get the JTI
            secret_key = current_app.config['JWT_SECRET_KEY']
            decoded_token = jwt.decode(
                token, 
                secret_key, 
                algorithms=["HS256"],
                options={"verify_signature": True}
            )
            jti = decoded_token["jti"]
            
            # Add the token to the revoked tokens list
            db.revoked_tokens.insert_one({"jti": jti, "created_at": datetime.utcnow()})
            
            return jsonify({"message": "Successfully logged out"}), 200
        except Exception as e:
            print(f"Logout error: {str(e)}")
            # Even if there's an error, we tell the client logout was successful
            # as the client side is already clearing tokens
            pass
    
    return jsonify({"message": "Successfully logged out"}), 200
