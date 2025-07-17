import eel
import json
import os
from main import process_production_quantities, process_material_pricing
from project_io import save_to_json, load_from_json
from materials_query import fetch_materials_by_category, fetch_units


# Initialize eel with your web files directory
eel.init('frontend')


@eel.expose
def create_project(project_name):
    # Initialize input_store with required structure
    input_store = {
        "Material Pricing": [],
        "Production Quantities": [],
        "Wall Height (LF)": 0,
        "Sheet Width (FT)": 0,
        "Fasteners / Board (EA)": 0
    }
    
    # Process initial data
    processed_input = process_production_quantities(input_store)
    
    # Only continue if we got valid data back
    if processed_input is not None:
        # Use the original input_store if process_production_quantities returned None
        final_input = processed_input
        try:
            process_material_pricing(final_input, f"{project_name}.json")
            save_to_json(f"{project_name}.json", final_input)
            return True
        except Exception as e:
            print(f"ERROR in create_project: {e}")
            return False
    else:
        print("ERROR: process_production_quantities returned None")
        return False

@eel.expose
def save_project(project_name, data):
    """Save project data to a JSON file"""
    if not project_name.endswith('.json'):
        project_name += '.json'

    
    try:
        save_to_json(project_name, data)
        return {"success": True}
    except Exception as e:
        print(f"Error saving project: {e}")
        return {"error": str(e)}



# Global variable to track current project name
current_project_name = None

@eel.expose
def load_project_file(project_name):
    """Load a project file and return its data"""
    try:
        from project_io import load_from_json
        import logging
        logger = logging.getLogger(__name__)
        
        logger.debug(f"Loading project file: {project_name}")
        
        # Ensure project name has .json extension
        if not project_name.endswith('.json'):
            project_name += '.json'
        
        data = load_from_json(project_name)
        
        if isinstance(data, dict) and "error" in data:
            logger.error(f"Error loading project: {data['error']}")
            return {"success": False, "error": data["error"]}
        
        logger.debug(f"Project loaded successfully: {project_name}")
        return {"success": True, "data": data}
    except Exception as e:
        import traceback
        error_msg = f"Error loading project: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        return {"success": False, "error": error_msg}

@eel.expose
def fetch_materials_by_category(category):
    """Fetch materials from the database by category"""
    try:
        from materials_query import fetch_materials_by_category as get_materials
        result = get_materials(category)
        return result
    except Exception as e:
        import traceback
        error_msg = f"Error fetching materials: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        return {"success": False, "error": error_msg}



@eel.expose
def fetch_material_by_id(material_id):
    """Fetch a specific material by ID"""
    try:
        import sqlite3
        from db_utils import get_db_path
        
        db_path = get_db_path()
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        query = "SELECT id, name, category, price, unit FROM material_list WHERE id = ?"
        cursor.execute(query, (material_id,))
        
        material = cursor.fetchone()
        conn.close()
        
        if not material:
            return {"success": False, "error": f"No material found with ID {material_id}"}
        
        material_data = {
            "id": material[0],
            "name": material[1],
            "category": material[2],
            "price": float(material[3].replace("$", "").replace(",", "").strip()) if isinstance(material[3], str) else material[3],
            "unit": material[4]
        }
        
        return {"success": True, "material": material_data}
    except Exception as e:
        import traceback
        error_msg = f"Error fetching material by ID: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        return {"success": False, "error": error_msg}
    
@eel.expose
def process_final_total(data):
    """Process the final total calculation and return the result"""
    try:
        import logging
        logger = logging.getLogger(__name__)
        logger.debug(f"process_final_total called with data: {data}")
        from main import process_final_total as calculate_final_total
        result = calculate_final_total(data)
        logger.debug(f"process_final_total result: {result}")
        return result
    except Exception as e:
        logger.error(f"Error processing final total: {e}", exc_info=True)
        return {"error": str(e)}

# Start the application
if __name__ == "__main__":
    try:
        # Start with your main HTML file
        eel.start('home.html', size=(1200, 800))
    except Exception as e:
        print(f"Error starting Eel: {e}")