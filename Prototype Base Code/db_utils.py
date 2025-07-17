import os
import sys
import sqlite3
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

def get_db_path():
    """Get the correct path to the database file"""
    if getattr(sys, 'frozen', False):
        # Running as compiled executable
        base_path = sys._MEIPASS
    else:
        # Running as a normal Python script
        base_path = os.path.dirname(os.path.abspath(__file__))
    
    db_path = os.path.join(base_path, "Price_List.db")
    logger.debug(f"Database path: {db_path}")
    
    # Verify the file exists
    if os.path.exists(db_path):
        logger.debug(f"Database file found at: {db_path}")
    else:
        logger.error(f"Database file NOT found at: {db_path}")
        # List files in the directory to help debug
        logger.debug(f"Files in directory: {os.listdir(base_path)}")
    
    return db_path

def check_db_connection():
    """Test the database connection and log table information"""
    db_path = get_db_path()
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Get list of tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        logger.debug(f"Tables in database: {tables}")
        
        # Check if material_list table exists
        if ('material_list',) in tables:
            # Get column info
            cursor.execute("PRAGMA table_info(material_list)")
            columns = cursor.fetchall()
            logger.debug(f"Columns in material_list: {columns}")
            
            # Count rows
            cursor.execute("SELECT COUNT(*) FROM material_list")
            count = cursor.fetchone()[0]
            logger.debug(f"Number of rows in material_list: {count}")
        else:
            logger.error("material_list table not found in database!")
        
        conn.close()
        return True
    except Exception as e:
        logger.error(f"Database connection error: {e}")
        return False
