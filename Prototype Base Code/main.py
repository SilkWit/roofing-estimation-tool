from production_quantities import ProductionQuantity
from project_io import save_to_json, load_from_json
from materials_query import fetch_materials_by_category, fetch_units
from material_pricing import MaterialPricing
import json
import uuid
from uuid import uuid4  # For generating unique IDs
import os
import eel

# Define variables and functions
current_project_file = None
# Path to the SQL database
db_file = "Price_List.db"
available_units = fetch_units(db_file)  # Fetch available units from the database

@eel.expose
def load_project(filepath):
    """
    Load a project from a JSON file and return its data.
    
    Args:
        filepath (str): Path to the project file
        
    Returns:
        dict: The project data or an error message
    """
    global current_project_file
    current_project_file = filepath  # Store current project path

    try:
        # Ensure file has the correct extension
        if not filepath.endswith(".json"):
            filepath += ".json"
            
        with open(filepath, "r", encoding="utf-8") as file:
            data = json.load(file)
        
        print(f"Successfully loaded project from {filepath}")
        
        # Ensure correct structure by returning only `data`
        if "data" in data:
            return data["data"]

        return data  # If structure is already correct

    except FileNotFoundError:
        print(f"Error: Project file {filepath} not found.")
        return {"error": f"Project file {filepath} not found."}
    except json.JSONDecodeError:
        print(f"Error: Failed to parse JSON in {filepath}.")
        return {"error": f"Failed to parse JSON in {filepath}."}
    except Exception as e:
        print(f"Unexpected error loading project: {e}")
        return {"error": f"Unexpected error loading project: {e}"}




# Project initialization
def initialize_project(file_name):
    global current_project_file

    # Ensure file has the correct extension
    if not file_name.endswith(".json"):
        file_name += ".json"

    current_project_file = file_name  # Store the project file path globally

    input_store = {
        "Production Quantities": [],
        "Material Pricing": [
            {
                "id": str(uuid4()),
                "description": "",  # Empty by default, user selects from dropdown
                "sub_description": "",
                "quantity": 0,  # Default to 0 to prevent errors
                "base_price": 0.0,
                "discount_price": 0.0,
                "total": 0.0
            }
        ],
        "Final Total": {},
        "Distributor Discount": 0.1,
        "Direct Discount": 0.05
    }

    # Save to file immediately
    with open(current_project_file, "w", encoding="utf-8") as f:
        json.dump(input_store, f, indent=4)

    return {"message": "New project initialized", "file_path": current_project_file, "data": input_store}


# ==================================================================================
# Production Quantities Section
# ==================================================================================

def process_production_quantities(input_store):
    #List display of measurement input area
    measurements_data = [
        {"description": "Total Roof Area", "sub_description": " - Tear-Off", "is_manual": True, "unit": "SQ FT"},
        {"description": "Total Roof Area", "sub_description": " - Insulation", "formula": "input_store['Total Roof Area - Tear-Off']", "unit": "SQ FT"},
        {"description": "Total Roof Area", "sub_description": " - Membrane", "formula": "input_store['Total Roof Area - Tear-Off']", "unit": "SQ FT"},
        {"description": "Total Roof Area", "sub_description": " - Coating", "is_manual": True, "unit": "SQ FT"},
        {"description": "Perimeter", "is_manual": True, "unit": "LN FT"},
        {"description": "Area of Perimeter", "sub_description": " - Wall Height (LF)", "extra_input": "Wall Height (LF)", 
        "formula": "previous_value * input_store['Wall Height (LF)']", "unit": "SQ FT"},
        {"description": "Number of Curbs", "is_manual": True, "unit": "EA"},
        {"description": "Curb Perimeter", "is_manual": True, "unit": "LN FT"},
        {"description": "Area of Curb Perimeter", "formula": "previous_value * 1.5", "unit": "SQ FT"},
        {"description": "LN FT of Field Seam", "sub_description": " - Sheet Width (FT)", "extra_input": "Sheet Width (FT)", 
        "formula": "input_store['Total Roof Area - Insulation'] / (input_store['Sheet Width (FT)'] * 100) * (100+input_store['Sheet Width (FT)'])", 
        "unit": "LN FT"},
        {"description": "LN FT of Walkway", "is_manual": True, "unit": "LN FT"},
        {"description": "SF of Walkway", "is_manual": True, "unit": "SQ FT"},
        {"description": "Number of Roof Drains", "is_manual": True, "unit": "EA"},
        {"description": "Number of Scuppers", "is_manual": True, "unit": "EA"},
        {"description": "Number of VTR'S", "sub_description": " - SMALL", "is_manual": True, "unit": "EA"},
        {"description": "Number of VTR'S", "sub_description": " - LARGE / Universal", "is_manual": True, "unit": "EA"},
        {"description": "Taper Area", "is_manual": True, "unit": "SQ FT"},
        {"description": "Insulation Fasteners & Plates", "sub_description": " - Fasteners / Board (EA)", "extra_input": "Fasteners / Board (EA)",
        "formula": "((input_store['Total Roof Area - Membrane'] / 32) * input_store['Fasteners / Board (EA)']) * 1.05", "unit": "EA"},
        {"description": "Perimeter Securement", "formula": "(input_store['Perimeter'] + input_store['Curb Perimeter']) * 1.05", "unit": "LN FT"},
        {"description": "Expansion Joint", "sub_description": " (Wall)", "is_manual": True, "unit": "LN FT"},
        {"description": "Expansion Joint", "sub_description": " (Field)", "is_manual": True, "unit": "LN FT"},
    # FINISH FORMULA LATER WHEN MATERIAL PRICING IS FINISHED - REQUIRES INPUT FROM THERE
    # {"description": "Parapet TPO Rolls", "sub_description": " -Tbar / Drip Edge  :  Convert to Rolls", "formula": "input_store['Perimeter'] - ", "unit": "LN FT"},
        {"description": "Coating", "is_manual": True, "unit": "SQ FT"},
        {"description": "Pavers", "is_manual": True, "unit": "SQ FT"},
        {"description": "Paver Perimeter", "is_manual": True, "unit": "LN FT"},
        {"description": "725TR", "is_editable": True, "is_manual": True, "unit_dropdown": True, "Unit": "EA"},
        {"description": "CAV Grip", "is_editable": True, "is_manual": True, "unit_dropdown": True, "Unit": "EA"},
        {"description": "Molded Sealant Pocket", "is_editable": True, "is_manual": True, "unit_dropdown": True, "Unit": "EA"},
        {"description": "One Part Sealant (2/pcket)", "is_editable": True, "formula": "input_store['Molded Sealant Pocket'] / 2", "unit_dropdown": True, "Unit": "EA"},
        {"description": '2" HP-X Perim', "is_editable": True, "formula": "(input_store['Perimeter'] * 2) * 1.05", "unit_dropdown": True, "Unit": "EA"},
        {"description": "Coping Underlayment", "is_editable": True, "is_manual": True, "unit_dropdown": True, "Unit": "EA"},
    ]

    # Create objects and collect inputs
    production_quantities = []
    previous_value = None

    for data in measurements_data:
        pq = ProductionQuantity(
            data.get('description', ''),
            data.get("sub_description", ""),
            data.get("is_manual", False),
            data.get("extra_input", ""),
            data.get("value", 0),
            data.get("unit", ""),
            data.get("formula", None),
            data.get("is_editable", False),
            data.get("unit_dropdown", False),
        )
        pq.set_value(input_store, previous_value, available_units)
        previous_value = pq.value

        # Add an ID to each production quantity entry
        production_quantities.append({
            "id": uuid4().hex,  # Generate unique ID
            "description": pq.description,
            "sub_description": pq.sub_description,
            "value": pq.value,
            "unit": pq.unit
        })

    # Store production quantities
    input_store["Production Quantities"] = production_quantities

    for key in ["Sheet Width (FT)", "Wall Height (LF)", "Fasteners / Board (EA)"]:
        if key not in input_store or input_store[key] == 0:
                print(f"DEBUG: {key} set to 0 (default).")

    # Return the modified input_store
    return input_store  # Add this line to return the modified input_store

# ==================================================================================
# Material Pricing Section
# ==================================================================================
def process_material_pricing(input_store, project_file, distributor_discount=0.0, direct_discount=0.0):
    # Ensure current_project_file is set
    global current_project_file

    # Ensure current_project_file is set
    if current_project_file is None:
        if project_file is None:
            raise ValueError("ERROR: No project file provided for saving Material Pricing.")
        current_project_file = project_file  # Use provided file


    # Ensure "Material Pricing" exists
    if "Material Pricing" not in input_store:
        print("DEBUG: Material Pricing key missing. Initializing empty list...")
        input_store["Material Pricing"] = []

    # Store distributor & direct discounts
    input_store["Distributor Discount"] = distributor_discount
    input_store["Direct Discount"] = direct_discount

    # Material pricing and input
    materials_data = [
        {
            "description": "Membrane Type Material 1",  # User selects from Membrane Type category in SQL
            "category": "Membrane Type",  # Category in the SQL database
            "material_ids": [1, 2, 7, 8],  # Restrict to material IDs 1-4
            "sub_category": "Field & Seams",  # Sub-description
            "is_main": True, #Flagged as main material for subsequent sub-materials to draw data from
            "is_no_discount": True,
            "extra_input": True,  # Indicates user can adjust the extra input value
            "extra_input_formula": "selected_material[2]",  # Default: Price from SQL database
            "quantity_formula": "(input_store['Total Roof Area - Membrane'] + (input_store['LN FT of Field Seam - Sheet Width (FT)'] / 2)) * 1.05",  # Formula for Quantity
            "is_manual_base_price": True,  # User inputs the base price
            "base_price_reference": None, #No reference for this material
            "discount_price_input": True, #prompt for discount price input
            "total_formula": "(quantity * base_price)"  # Formula for Total
        },
        {"description": "Membrane Type 1 Subcategory", 
        "category": None, 
        "sub_category": "Perimeter & Walls",
        "is_main": False,  #sub-material
        "extra_input": False, 
        "quantity_formula": "1.05 * input_store['Area of Perimeter - Wall Height (LF)']", 
        "is_manual_base_price": False,
        "base_price_reference": "Membrane Type Material 1", 
        "is_no_discount": True,
        "discount_price_input": False,
        "total_formula": "(quantity * base_price)"
        },

        {"description": "Membrane Type 1 Subcategory",
        "category": None,
        "sub_category": "Curb Perimeter",
        "is_main": False,  #sub-material
        "extra_input": False, 
        "quantity_formula": "1.05 * input_store['Area of Curb Perimeter']",
        "is_manual_base_price": False,
        "base_price_reference": "Membrane Type Material 1", 
        "is_no_discount": True,
        "discount_price_input": False, 
        "total_formula": "(quantity * base_price)"
        },

        {
        "description": "Protection Mat", 
        "category": "Flashings", 
        "specific_material_id": 100,  # Fetch only the material with ID 100
        "is_manual_quantity": True,  # Prompt user to enter quantity manually
        "total_formula": "quantity * discount_price",  # Standard total formula
        },
        {
        "description": "Weathered Mem Cleaner",
        "category": "Adhesives/Sealants/Cleaners",
        "specific_material_id": 43,
        "sub_category": "Field & Seams",
        "is_main": True,
        "quantity_formula": "(input_store['LN FT of Field Seam - Sheet Width (FT)']) / 500 / 5 * 1.05",
        "total_formula": "quantity * discount_price"
        },
        {
        "description": "Weathered Mem Cleaner",
        "category": "Adhesives/Sealants/Cleaners",
        "specific_material_id": 43,
        "sub_category": "Perimeter & Walls",
        "is_main": False,  #sub-material
        "quantity_formula": "1.05 * (input_store['Perimeter'] / 500 / 5)",
        "base_price_reference": "Weathered Mem Cleaner",
        "total_formula": "quantity * discount_price"
        },
        {
        "description": "Weathered Mem Cleaner",
        "category": "Adhesives/Sealants/Cleaners",
        "specific_material_id": 43,
        "sub_category": "Curb Perimeter",
        "is_main": False,  #sub-material
        "quantity_formula": "input_store['Curb Perimeter'] / 550 / 5 * 1.025",
        "base_price_reference": "Weathered Mem Cleaner",
        "total_formula": "quantity * discount_price"
        },
        #{
        #"description": '6"/9"Flashings',
        #"category": "Flashings", 
        #"material_ids": [54, 55, 56, 57, 58, 59, 60, 61],
        #"is_manual_quantity": True,
        #"total_formula": "quantity * discount_price",
        #},
    ]

    # Initialize material pricing list
    material_pricing_list = []
    main_material_data = {}

    # Ensure missing fields are added to every material
    default_values = {
        "quantity": 0,
        "base_price": 0.0,
        "discount_price": 0.0,
        "total": 0.0,
        "extra_input": False,
        "is_main": False,
        "is_no_discount": False,
        "is_manual_base_price": False,
        "discount_price_input": False,
    }

    # If Material Pricing is empty, populate it with predefined materials
    if not input_store["Material Pricing"]:
        input_store["Material Pricing"] = [
            {
                "id": str(uuid4()),
                **material,
                **default_values
            }
            for material in materials_data
        ]

    
    # Ensure all materials have default values
    for material in input_store["Material Pricing"]:
        material.update({key: default_values[key] for key in default_values if key not in material})
        if material.get("is_manual_base_price", False):  # Check if user input is required
            material["base_price"] = input_store.get(material["description"], 0)  # Default to 0 if no user input


    def fetch_specific_material(db_file, material_id, category=None):
        """
        Fetch a single material from the database based on its ID.
        Optionally filter by category for additional specificity.
        """
        materials = fetch_materials_by_category(db_file, category) if category else []
        specific_material = next((mat for mat in materials if mat[0] == material_id), None)
        if not specific_material and material_id in materials:
            print(f"ERROR: Required material ID {material_id} missing from '{category}'!")

        return specific_material

    for data in materials_data:
        material = MaterialPricing(
            description=data.get("description", ""),
            sub_description=data.get("sub_category", ""),
            base_price=0,  # Default to 0
            quantity=0,  # Default to 0
            distributor_discount=distributor_discount,
            direct_discount=direct_discount,
            discount_price=0,  # Default to 0
        )

        # Assign a unique ID
        material_id = str(uuid4().hex)

        # Fetch specific material if applicable
        if "specific_material_id" in data:
            specific_material = fetch_specific_material(
                db_file, data["specific_material_id"], data.get("category")
            )
            if specific_material:
                try:
                    if not isinstance(selected_material, dict):
                        print("ERROR: selected_material is not a dictionary. Aborting process.")
                        return  # Prevent crash if selected_material is invalid

                    if "price" not in selected_material:
                        print("ERROR: selected_material does not contain 'price' field.")
                        return  # Prevent crash if 'price' key is missing

                    material.base_price = float(str(selected_material["price"]).replace("$", "").replace(",", "").strip())
                                        
                except ValueError:
                    print(f"Invalid base price format for {specific_material[1]}. Defaulting to 0.0.")
                    material.base_price = 0.0
                material.description = specific_material[1]

           
            if data.get("is_manual_quantity", False):
                # Try to fetch user input from input_store (frontend)
                material.quantity = input_store.get(material.description, 0)


        # Handle category-based dropdown for main materials
        elif data.get("is_main", False) and data.get("category"):
            available_materials = fetch_materials_by_category(db_file, data["category"])

            # Ensure we extract the materials list properly
            if isinstance(available_materials, dict) and "materials" in available_materials:
                available_materials = available_materials["materials"]  # Extract the actual list
            elif not isinstance(available_materials, list):
                print(f"ERROR: Expected list of materials but got {type(available_materials)}: {available_materials}")
                available_materials = []  # Prevent crashing


            if not available_materials:
                print(f"ERROR: No materials found for category {data['category']} despite fetching.")
                return  # Avoid further processing

            
            if available_materials:
                if not isinstance(available_materials, list):
                    print("ERROR: available_materials is not a list. Fixing format...")
                    available_materials = available_materials.get("materials", [])

                if not available_materials:
                    print("ERROR: No available materials found. Aborting material pricing.")
                    return  # Prevent processing if no materials exist

                selected_material = available_materials[0]  # Now safe to access the first item

                if isinstance(selected_material, dict):
                    if "price" in selected_material:
                        material.base_price = float(str(selected_material["price"]).replace("$", "").replace(",", "").strip())
                    else:
                        print(f"ERROR: selected_material is missing 'price' field: {selected_material}")
                        material.base_price = 0.0  # Fallback
                elif isinstance(selected_material, list) and len(selected_material) > 3:
                    if isinstance(selected_material, dict):
                        if "price" in selected_material:
                            material.base_price = float(str(selected_material["price"]).replace("$", "").replace(",", "").strip())
                        else:
                            print(f"ERROR: selected_material is missing 'price' field: {selected_material}")
                            material.base_price = 0.0  # Fallback
                    elif isinstance(selected_material, list) and len(selected_material) > 3:
                        material.base_price = float(selected_material[3].replace("$", "").replace(",", "").strip())
                    else:
                        print(f"ERROR: selected_material structure is invalid or missing data: {selected_material}")
                        material.base_price = 0.0  # Safe fallback

                else:
                    print(f"ERROR: selected_material structure is invalid or missing data: {selected_material}")
                    material.base_price = 0.0  # Safe fallback


                if isinstance(selected_material, dict):
                    material.description = selected_material.get("name", "Unknown Material")  # Use dictionary key
                elif isinstance(selected_material, list) and len(selected_material) > 1:
                    material.description = selected_material[1]  # Fallback for list
                else:
                    print(f"ERROR: Invalid selected_material structure: {selected_material}")
                    material.description = "No material available"  # Safe fallback


                # Store material data for sub-materials
                main_material_data[data["description"]] = {
                    "description": material.description,
                    "base_price": material.base_price
                }

            else:
                material.base_price = 0.0
                material.description = "No material available"


        # Sub-materials: Copy base price from main material
        elif not data.get("is_main", False) and data.get("base_price_reference"):
            reference = data["base_price_reference"]
            if reference in main_material_data:
                material.base_price = main_material_data[reference]["base_price"]
                material.description = main_material_data[reference]["description"]

        # Evaluate quantity formula if provided
        if "quantity_formula" in data and not data.get("is_manual_quantity", False):
            try:
                material.evaluate_and_set(
                    data["quantity_formula"],
                    input_store,
                    {"base_price": material.base_price},
                    "quantity",
                )
            except Exception as e:
                print(f"Warning: evaluating quantity formula for {material.description}: {e}")

        # Calculate the discount price
        material.calculate_discount_price()

        # Ensure valid values before calculating totals
        material.quantity = material.quantity or 0
        material.base_price = material.base_price or 0
        material.discount_price = material.discount_price or 0

        # Calculate total
        try:
            if "total_formula" in data:
                try:
                    material.evaluate_and_set(
                        data["total_formula"],
                        input_store,
                        {"quantity": material.quantity, "base_price": material.base_price, "discount_price": material.discount_price},
                        "total",
                    )
                except Exception as e:
                    print(f"ERROR: Failed to calculate total for {material.description}: {e}")

            else:
                material.calculate_total()
        except Exception as e:
            print(f"Error calculating total for {material.description}: {e}")

        # Store in material_pricing_list
        material_pricing_list.append({
            "id": material_id,
            "description": material.description,
            "sub_description": material.sub_description,
            "quantity": material.quantity,
            "base_price": material.base_price,
            "discount_price": material.discount_price,
            "total": round(material.total, 2)
        })




    input_store["Material Pricing"] = material_pricing_list # Add materials


    # Save to project file
    try:
        save_to_json(current_project_file, input_store)
    except Exception as e:
        print(f"ERROR: Failed to save material pricing - {str(e)}")

    return input_store  # Ensure changes persist



# ==================================================================================
# Final Total Calculation (Automated Section)
# ==================================================================================
def process_final_total(input_store):
    import uuid
    
    # List of final calculations
    final_total_data = [
        {
            "description": "Membrane Type - Field & Seams",
            "included_materials": [
                "Field & Seams"  # Simplified to match sub_description
            ],
            "manual_price": 1167.00,  # Manually set price per unit
        },
        {
            "description": "Membrane Type - Perimeter/Walls",
            "included_materials": [
                "Perimeter & Walls",
                "Curb Perimeter"
            ],
            "manual_price": 492.00,  # Manually set price per unit
        },
        {
            "description": "Protection Mat",
            "included_materials": ["Protection Mat"],
            "manual_price": 1559.40,  # Manually set price per unit
        },
        {
            "description": "Weathered Membrane Cleaner",
            "included_materials": [
                "Weathered Mem Cleaner"  # Match the description instead of sub_description
            ],
            "manual_price": 136.24,  # Manually set price per unit
        }
    ]

    # Calculate total for each row
    final_total_results = []
    grand_total = 0

    # Debug: Print all material pricing items
    print("DEBUG: All Material Pricing items:")
    for item in input_store.get("Material Pricing", []):
        print(f"  - Description: '{item.get('description', 'No desc')}' | Sub: '{item.get('sub_description', 'No sub')}' | Qty: {item.get('quantity', 0)}")

    for row in final_total_data:
        total_quantity = 0
        matched_items = []
        
        # For each material pricing entry
        for item in input_store.get("Material Pricing", []):
            description = item.get('description', '')
            sub_description = item.get('sub_description', '')
            quantity = float(item.get('quantity', 0))
            
            # Case 1: Membrane Type - Field & Seams
            if row["description"] == "Membrane Type - Field & Seams":
                if sub_description == "Field & Seams":
                    total_quantity += quantity
                    matched_items.append(f"{description} - {sub_description} (Qty: {quantity})")
            
            # Case 2: Membrane Type - Perimeter/Walls
            elif row["description"] == "Membrane Type - Perimeter/Walls":
                if sub_description in ["Perimeter & Walls", "Curb Perimeter"]:
                    total_quantity += quantity
                    matched_items.append(f"{description} - {sub_description} (Qty: {quantity})")
            
            # Case 3: Protection Mat
            elif row["description"] == "Protection Mat":
                if "Protection Mat" in description:
                    total_quantity += quantity
                    matched_items.append(f"{description} (Qty: {quantity})")
            
            # Case 4: Weathered Membrane Cleaner
            elif row["description"] == "Weathered Membrane Cleaner":
                if "Weathered Mem Cleaner" in description:
                    total_quantity += quantity
                    matched_items.append(f"{description} - {sub_description} (Qty: {quantity})")

        # Debug: Print what was matched for this row
        print(f"DEBUG: For {row['description']}, matched: {matched_items}")
        print(f"DEBUG: Total quantity: {total_quantity}")

        # Calculate the total using the manually set price
        total_price = total_quantity * row["manual_price"]
        grand_total += total_price

        # Store result
        final_total_results.append({
            "id": str(uuid.uuid4()),  # Generate a unique ID
            "description": row["description"],
            "included_materials": row["included_materials"],
            "total_quantity": total_quantity,
            "manual_price": row["manual_price"],
            "total_price": round(total_price, 2)
        })

    # Save final totals in input_store
    input_store["Final Total"] = {
        "Grand Total": round(grand_total, 2),
        "Details": final_total_results
    }

    return {"message": "Final total calculation complete.", "data": final_total_results, "grand_total": round(grand_total, 2)}



# ==================================================================================
# Final Output
# ==================================================================================


if __name__ == "__main__":
    # Initialize the project based on user input
    project_name = input("Enter project name (without .json): ").strip()
    project_data = initialize_project(project_name)

    # Process data
    project_data["data"] = process_production_quantities(project_data["data"])
    project_data["data"] = process_material_pricing(project_data["data"], current_project_file, distributor_discount=0.1, direct_discount=0.05)
    project_data["data"] = process_final_total(project_data["data"])

    save_to_json(current_project_file, project_data["data"])
