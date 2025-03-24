# routes/test_routes.py
from flask import Blueprint, request, jsonify
from utils.gemini_classifier import classify_case_sync

# Create test blueprint
test_bp = Blueprint('test', __name__)

@test_bp.route("/classify", methods=["POST"])
def test_classification():
    """Test endpoint for trying out the Gemini classification."""
    try:
        data = request.get_json()
        
        if not data or "description" not in data:
            return jsonify({"error": "Missing description in request body"}), 400
            
        description = data["description"]
        
        # Use Gemini to classify the description
        category = classify_case_sync(description)
        
        return jsonify({
            "original_description": description,
            "classified_category": category
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
