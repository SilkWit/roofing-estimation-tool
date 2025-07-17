import sqlite3
from db_utils import get_db_path
import logging

logger = logging.getLogger(__name__)

def fetch_materials_by_category(category):
    """
    Fetch materials from the 'material_list' table based on a specific category.
    
    Args:
        category (str): The category to filter materials by.

    Returns:
        dict: A dictionary containing the material data or an error message.
    """
    db_file = get_db_path()
    conn = None
    try:
        logger.debug(f"Connecting to database at: {db_file}")
        conn = sqlite3.connect(db_file)
        cursor = conn.cursor()

        query = "SELECT id, name, category, price, unit FROM material_list WHERE category = ?"
        logger.debug(f"Executing query: {query} with parameter: {category}")
        cursor.execute(query, (category,))

        materials = cursor.fetchall()

        if not materials:
            logger.warning(f"No materials found for category '{category}'")
            return {"success": False, "error": f"No materials found for category '{category}'"}

        materials_list = [
            {
                "id": row[0],
                "name": row[1],
                "category": row[2],
                "price": float(row[3].replace("$", "").replace(",", "").strip()) if isinstance(row[3], str) else row[3],
                "unit": row[4]
            }
            for row in materials
        ]

        logger.debug(f"Found {len(materials_list)} materials for category '{category}'")
        return {"success": True, "materials": materials_list}

    except sqlite3.Error as e:
        logger.error(f"Database error: {e}")
        return {"success": False, "error": f"Database error: {e}"}
    finally:
        if conn:
            conn.close()

def fetch_units(db_file):
    """
    Fetch unit names from the 'material_list' table under the 'Units' category.

    Args:
        db_file (str): Path to the SQLite database file.

    Returns:
        dict: A dictionary with the unit names or an error message.
    """
    conn = None
    try:
        conn = sqlite3.connect(db_file)
        cursor = conn.cursor()

        query = "SELECT name FROM material_list WHERE category = 'Units'"
        cursor.execute(query)
        
        units = cursor.fetchall()
        return [unit[0] for unit in units]
    except sqlite3.Error as e:
        logger.error(f"Database error fetching units: {e}")
        return []
    finally:
        if conn:
            conn.close()