# MongoDB Case Schema
# This is a reference for the structure of cases in MongoDB

case_schema = {
    "_id": "ObjectId",
    "title": "String",               # Case title
    "description": "String",         # Detailed description of the case
    "category": "String",            # Category of the case (civil, criminal, etc.)
    "urgencyLevel": "String",        # Urgency level (Low, Medium, High)
    "communicationMethod": "String", # Preferred communication method
    "specialRequirements": "String", # Any special requirements or notes
    "clientId": "ObjectId",          # Reference to the client user
    "clientName": "String",          # Full name of the client
    "assignedLawyer": "ObjectId",    # Reference to the assigned lawyer (if any)
    "status": "String",              # Case status (Pending, Assigned, InProgress, Closed)
    "created_at": "DateTime",        # When the case was created
    "updated_at": "DateTime",        # When the case was last updated
    "documents": [                   # Array of uploaded documents
        {
            "filename": "String",    # Original filename
            "path": "String",        # Path to the saved file
            "uploadedAt": "DateTime" # When the file was uploaded
        }
    ],
    "comments": [                    # Array of comments/updates
        {
            "userId": "ObjectId",    # User who made the comment
            "userType": "String",    # Type of user (client or lawyer)
            "text": "String",        # Comment text
            "timestamp": "DateTime"  # When the comment was made
        }
    ]
}

# Example MongoDB indexes to create
indexes = [
    # Index for faster lookup by client
    {"clientId": 1, "created_at": -1},
    # Index for faster lookup by lawyer
    {"assignedLawyer": 1, "status": 1, "created_at": -1},
    # Index for finding cases by status
    {"status": 1, "created_at": -1},
    # Index for searching by category
    {"category": 1, "status": 1, "created_at": -1}
]

# Example MongoDB validation schema
validation_schema = {
    "$jsonSchema": {
        "bsonType": "object",
        "required": ["title", "description", "urgencyLevel", "communicationMethod", "clientId", "status", "created_at", "updated_at"],
        "properties": {
            "title": {
                "bsonType": "string",
                "description": "Title of the case"
            },
            "description": {
                "bsonType": "string",
                "description": "Detailed description of the case"
            },
            "urgencyLevel": {
                "bsonType": "string",
                "enum": ["Low", "Medium", "High"],
                "description": "Urgency level of the case"
            },
            "status": {
                "bsonType": "string",
                "enum": ["Pending", "Assigned", "InProgress", "Closed"],
                "description": "Status of the case"
            }
        }
    }
}

# To set up the validation schema in MongoDB, use:
# db.createCollection("cases", { validator: validation_schema })

# To add indexes to the collection:
# for index in indexes:
#     db.cases.createIndex(index)
