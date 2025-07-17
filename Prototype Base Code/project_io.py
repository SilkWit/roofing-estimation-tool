import json
import os
import sys
import logging

logger = logging.getLogger(__name__)

def get_project_path(file_name):
    """Get the correct path for project files"""
    if getattr(sys, 'frozen', False):
        # Running as compiled executable
        base_path = os.path.dirname(sys.executable)
    else:
        # Running as a normal Python script
        base_path = os.path.dirname(os.path.abspath(__file__))
    
    # Create a projects directory if it doesn't exist
    projects_dir = os.path.join(base_path, "projects")
    os.makedirs(projects_dir, exist_ok=True)
    
    # If file_name doesn't end with .json, add it
    if not file_name.endswith('.json'):
        file_name += '.json'
    
    full_path = os.path.join(projects_dir, file_name)
    logger.debug(f"Project path: {full_path}")
    return full_path

def save_to_json(file_name, data):
    """Save project data to a JSON file"""
    if not data:  # Prevent overwriting the JSON with empty/null data
        logger.warning(f"Attempted to save empty data to {file_name}. Skipping save.")
        return

    full_path = get_project_path(file_name)
    with open(full_path, 'w', encoding='utf-8') as file:
        json.dump(data, file, indent=4)
    logger.info(f"Saved project to {full_path}")

def load_from_json(file_name):
    """
    Loads project data from a JSON file, returning structured JSON output.
    """
    full_path = get_project_path(file_name)
    logger.debug(f"Attempting to load project from: {file_name}")
    logger.debug(f"Full path: {full_path}")
    
    if os.path.exists(full_path):
        try:
            with open(full_path, "r", encoding="utf-8") as file:
                data = json.load(file)
                logger.debug(f"Successfully loaded project from {full_path}")
                return data
        except json.JSONDecodeError as e:
            logger.error(f"Error decoding JSON file: {str(e)}")
            return {"error": f"Error decoding JSON file: {str(e)}"}
        except Exception as e:
            logger.error(f"Unexpected error loading project: {str(e)}")
            return {"error": f"Unexpected error loading project: {str(e)}"}
    else:
        logger.error(f"File not found: {file_name}")
        # Try to list all files in the projects directory to help debug
        try:
            projects_dir = os.path.dirname(full_path)
            if os.path.exists(projects_dir):
                files = os.listdir(projects_dir)
                logger.debug(f"Files in projects directory: {files}")
        except Exception as e:
            logger.error(f"Error listing project directory: {e}")
        
        return {"error": f"File '{file_name}' does not exist.", "data": {}}
