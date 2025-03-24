# utils/gemini_classifier.py
import os
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure the Gemini API
genai.configure(api_key="AIzaSyDGTonIRoAIBkzxUYCJwe0j7uymAY9xwLQ")

# Available case categories
CASE_CATEGORIES = [
    "civil", 
    "criminal", 
    "corporate", 
    "family", 
    "property",
    "intellectual-property",
    "employment",
    "immigration",
    "tax",
    "personal-injury"
]

for m in genai.list_models():
    if 'generateContent' in m.supported_generation_methods:
        print(m.name)

# Prompt template for case classification
CLASSIFICATION_PROMPT = """
You are a legal expert tasked with classifying legal cases based on their descriptions.
Given the following case description, classify it into the most appropriate legal category.
Choose exactly one category from this list: {categories}

Case description: {description}

Respond with only the category name, no additional explanation.
"""

async def classify_case(description):
    """
    Use Gemini AI to classify a case description into a legal category.
    
    Args:
        description (str): The case description text
        
    Returns:
        str: The classified category
    """
    try:
        # Format the prompt with the available categories and the case description
        prompt = CLASSIFICATION_PROMPT.format(
            categories=", ".join(CASE_CATEGORIES),
            description=description
        )
        
        # Configure the Gemini model
        model = genai.GenerativeModel('gemini-1.5-pro-001')
        
        # Generate classification response
        response = model.generate_content(prompt)
        
        # Get the classified category
        category = response.text.strip().lower()
        
        # Validate that the response is one of our predefined categories
        if category in CASE_CATEGORIES:
            return category
        else:
            # Default to "civil" if the response doesn't match our categories
            print(f"Invalid category response from Gemini: {category}")
            return "civil"
            
    except Exception as e:
        print(f"Error classifying case with Gemini: {str(e)}")
        # Fallback to "civil" category in case of any error
        return "civil"

# Synchronous version for simpler integration
def classify_case_sync(description):
    """
    Synchronous version of classify_case for simpler integration.
    """
    try:
        # Format the prompt with the available categories and the case description
        prompt = CLASSIFICATION_PROMPT.format(
            categories=", ".join(CASE_CATEGORIES),
            description=description
        )
        
        # Configure the Gemini model
        model = genai.GenerativeModel('gemini-1.5-pro-001')
        
        # Generate classification response
        response = model.generate_content(prompt)
        
        # Get the classified category
        category = response.text.strip().lower()
        
        # Validate that the response is one of our predefined categories
        if category in CASE_CATEGORIES:
            return category
        else:
            # Default to "civil" if the response doesn't match our categories
            print(f"Invalid category response from Gemini: {category}")
            return "civil"
            
    except Exception as e:
        print(f"Error classifying case with Gemini: {str(e)}")
        # Fallback to "civil" category in case of any error
        return "civil"
