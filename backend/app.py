from flask import Flask
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
import os
from pymongo import MongoClient
from datetime import timedelta

# Import route modules
from routes.auth_routes import auth_bp
from routes.client_routes import client_bp
from routes.lawyer_routes import lawyer_bp
from routes.case_routes import case_bp  # Add the new case routes
from routes.lawyer_case_routes import lawyer_case_bp  # New lawyer case routes
from routes.test_routes import test_bp  # Import test routes
from routes.document_routes import document_bp  # Import document routes



# Load environment variables
load_dotenv()

def create_app():
    # Initialize Flask app
    app = Flask(__name__)
    CORS(app)
    
    # Configure JWT
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "your-secret-key")
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)
    app.config["JWT_REFRESH_TOKEN_EXPIRES"] = timedelta(days=30)

    app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024
    
    # Initialize extensions
    jwt = JWTManager(app)
    bcrypt = Bcrypt(app)
    
    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(client_bp, url_prefix='/api/client')
    app.register_blueprint(lawyer_bp, url_prefix='/api/lawyer')
    app.register_blueprint(case_bp, url_prefix='/api/cases')  # Register the new blueprint
    app.register_blueprint(lawyer_case_bp, url_prefix='/api/lawyer/cases')  # New lawyer case routes
    app.register_blueprint(test_bp, url_prefix='/api/test')  # Register test routes
    app.register_blueprint(document_bp, url_prefix='/api/documents')  # Register document routes
    
    
    # Configure JWT error handlers
    @jwt.token_in_blocklist_loader
    def check_if_token_revoked(jwt_header, jwt_payload):
        from database.db import get_db
        jti = jwt_payload["jti"]
        token = get_db().revoked_tokens.find_one({"jti": jti})
        return token is not None
    
    @app.errorhandler(422)
    def handle_unprocessable_entity(e):
        # Log the error for debugging
        print(f"JWT Error: {str(e)}")
        return {"msg": "Token validation failed"}, 422
    
    return app

if __name__ == "__main__":
    app = create_app()
    app.run("0.0.0.0",debug=True)
