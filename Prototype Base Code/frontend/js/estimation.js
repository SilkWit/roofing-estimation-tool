// Global variables
let basePriceManuallyEdited = false;
let discountPriceManuallyEdited = false;
let materialsData = [];
let materialPricingRows = [];

// Function to toggle side panel
function toggleSidePanel() {
    const sidePanel = document.getElementById('sidePanel');
    const overlay = document.getElementById('overlay');
    
    sidePanel.classList.toggle('open');
    overlay.classList.toggle('active');
}

// Function to export to Excel (placeholder)
function exportToExcel() {
    alert('Export to Excel functionality will be implemented here');
}

// Function to print (placeholder)
function printEstimation() {
    window.print();
}

// Function to save project
function saveProject() {
    console.log("saveProject called in estimation.html");
    try {
        // Call the saveProjectData function from project-io.js
        saveProjectData();
    } catch (error) {
        console.error("Error calling saveProjectData:", error);
    }
}

// Function to load membrane types when the page loads
async function loadMembraneTypes() {
    try {
        console.log("Fetching membrane types...");
        
        // Make sure we're passing the category as a string
        const category = "Membrane Type";
        console.log("Requesting materials for category:", category);
        
        // Call the backend function with the category parameter
        const result = await eel.fetch_materials_by_category(category)();
        
        console.log("Fetch result:", result);

        const select = document.getElementById('membrane-type-description');
        // Clear existing options except the first one
        while (select.options.length > 1) {
            select.remove(1);
        }

        // Make sure the first option says "Membrane Type"
        if (select.options.length === 0) {
            const defaultOption = document.createElement('option');
            defaultOption.value = "";
            defaultOption.textContent = "Membrane Type";
            select.appendChild(defaultOption);
        } else {
            select.options[0].textContent = "Membrane Type";
        }

        if (result && result.success && result.materials && result.materials.length > 0) {
            // Add new options from the database
            result.materials.forEach(material => {
                const option = document.createElement('option');
                option.value = material.id;
                option.textContent = material.description || material.name;
                option.dataset.price = material.base_price || material.price || 0;
                option.dataset.unit = material.unit || "SQ FT";
                select.appendChild(option);
                console.log(`Added option: ${option.textContent}, ID: ${material.id}, Price: ${option.dataset.price}, Unit: ${option.dataset.unit}`);
            });

            console.log(`Loaded ${result.materials.length} membrane types`);
        } else {
            console.error("Error or no materials found:", result);
        }
    } catch (error) {
        console.error("Error calling fetch_materials_by_category:", error);
    }
}

// Function to update all membrane-related rows
function updateAllMembraneRows() {
    updateMembraneType();
    calculateMembranePerimeterValues();
    calculateMembraneCurbValues();
}

// Function to calculate values for the Perimeter & Walls row
function calculateMembranePerimeterValues() {
    // Check if required elements exist
    const unitElement = document.getElementById('membrane-type-unit');
    const basePriceElement = document.getElementById('membrane-type-base-price');
    const discountPriceElement = document.getElementById('membrane-type-discount-price');
    
    if (!unitElement || !basePriceElement || !discountPriceElement) {
        console.warn("Required elements not found in calculateMembranePerimeterValues");
        return; // Exit early if elements don't exist
    }
    
    // Get values from the main membrane row
    const mainUnit = unitElement.textContent;
    const mainBasePrice = parseFloat(basePriceElement.value) || 0;
    const mainDiscountPrice = parseFloat(discountPriceElement.value) || 0;
    
    console.log("Perimeter row: Copying from main row - Unit:", mainUnit, "Base Price:", mainBasePrice, "Discount Price:", mainDiscountPrice);
    
    // Set the unit
    const perimeterUnitElement = document.getElementById('membrane-perimeter-unit');
    if (perimeterUnitElement) {
        perimeterUnitElement.textContent = mainUnit;
    }
    
    // Set the base price (same as main row)
    const perimeterBasePriceElement = document.getElementById('membrane-perimeter-base-price');
    if (perimeterBasePriceElement) {
        perimeterBasePriceElement.value = mainBasePrice.toFixed(2);
    }
    
    // Set the discount price (same as main row)
    const perimeterDiscountPriceElement = document.getElementById('membrane-perimeter-discount-price');
    if (perimeterDiscountPriceElement) {
        perimeterDiscountPriceElement.value = mainDiscountPrice.toFixed(2);
    }
    
    // Calculate quantity based on the formula: 1.05 * input_store['Area of Perimeter - Wall Height (LF)']
    const perimeterElement = document.getElementById('perimeter');
    const wallHeightElement = document.getElementById('wallHeight');
    
    if (!perimeterElement || !wallHeightElement) {
        console.warn("Perimeter or Wall Height elements not found");
        return;
    }
    
    const perimeter = parseFloat(perimeterElement.value) || 0;
    const wallHeight = parseFloat(wallHeightElement.value) || 0;
    const areaOfPerimeter = perimeter * wallHeight;
    const quantity = 1.05 * areaOfPerimeter;
    
    console.log("Perimeter row: Calculated quantity =", quantity, "from perimeter =", perimeter, "and wall height =", wallHeight);
    
    const quantityElement = document.getElementById('membrane-perimeter-quantity');
    if (quantityElement) {
        quantityElement.value = quantity.toFixed(2);
    }
    
    // Calculate total
    const total = quantity * mainDiscountPrice;
    const totalElement = document.getElementById('membrane-perimeter-total');
    if (totalElement) {
        totalElement.value = total.toFixed(2);
    }
}


// Function to calculate values for the Curb Perimeter row
function calculateMembraneCurbValues() {
    // Check if required elements exist
    const unitElement = document.getElementById('membrane-type-unit');
    const basePriceElement = document.getElementById('membrane-type-base-price');
    const discountPriceElement = document.getElementById('membrane-type-discount-price');
    
    if (!unitElement || !basePriceElement || !discountPriceElement) {
        console.warn("Required elements not found in calculateMembraneCurbValues");
        return; // Exit early if elements don't exist
    }
    
    // Get values from the main membrane row
    const mainUnit = unitElement.textContent;
    const mainBasePrice = parseFloat(basePriceElement.value) || 0;
    const mainDiscountPrice = parseFloat(discountPriceElement.value) || 0;
    
    console.log("Curb row: Copying from main row - Unit:", mainUnit, "Base Price:", mainBasePrice, "Discount Price:", mainDiscountPrice);
    
    // Set the unit
    const curbUnitElement = document.getElementById('membrane-curb-unit');
    if (curbUnitElement) {
        curbUnitElement.textContent = mainUnit;
    }
    
    // Set the base price (same as main row)
    const curbBasePriceElement = document.getElementById('membrane-curb-base-price');
    if (curbBasePriceElement) {
        curbBasePriceElement.value = mainBasePrice.toFixed(2);
    }
    
    // Set the discount price (same as main row)
    const curbDiscountPriceElement = document.getElementById('membrane-curb-discount-price');
    if (curbDiscountPriceElement) {
        curbDiscountPriceElement.value = mainDiscountPrice.toFixed(2);
    }
    
    // Calculate quantity based on the formula: 1.05 * input_store['Area of Curb Perimeter']
    const curbPerimeterElement = document.getElementById('curbPerimeter');
    if (!curbPerimeterElement) {
        console.warn("Curb Perimeter element not found");
        return;
    }
    
    const curbPerimeter = parseFloat(curbPerimeterElement.value) || 0;
    const areaOfCurbPerimeter = curbPerimeter * 1.5; // Area of Curb Perimeter formula from production_quantities
    const quantity = 1.05 * areaOfCurbPerimeter;
    
    console.log("Curb row: Calculated quantity =", quantity, "from curb perimeter =", curbPerimeter);
    
    const quantityElement = document.getElementById('membrane-curb-quantity');
    if (quantityElement) {
        quantityElement.value = quantity.toFixed(2);
    }
    
    // Calculate total
    const total = quantity * mainDiscountPrice;
    const totalElement = document.getElementById('membrane-curb-total');
    if (totalElement) {
        totalElement.value = total.toFixed(2);
    }
}

// Function to update membrane type
function updateMembraneType() {
    const select = document.getElementById('membrane-type-description');
    const selectedOption = select.options[select.selectedIndex];
    
    if (selectedOption && selectedOption.value) {
        // Get the selected material name
        const materialName = selectedOption.textContent;

        // Update the sub-row descriptions
        const perimeterDescCell = document.querySelector('#membrane-perimeter-row td:first-child');
        const curbDescCell = document.querySelector('#membrane-curb-row td:first-child');

        if (perimeterDescCell) {
            const span = perimeterDescCell.querySelector('span');
            if (span) span.textContent = materialName;
            else perimeterDescCell.textContent = materialName;
        }

        if (curbDescCell) {
            const span = curbDescCell.querySelector('span');
            if (span) span.textContent = materialName;
            else curbDescCell.textContent = materialName;
        }

        // Set unit
        const unit = selectedOption.dataset.unit || '';
        document.getElementById('membrane-type-unit').textContent = unit;

        // Get the new base price from the selected material
        const newBasePrice = parseFloat(selectedOption.dataset.price) || 0;

        // Check if this is a new selection (different from current material)
        const currentMaterialId = document.getElementById('membrane-type-description').dataset.lastSelectedId;
        const newMaterialId = selectedOption.value;

        // If this is a new material selection, update prices
        if (currentMaterialId !== newMaterialId) {
            // Store the new selection ID
            document.getElementById('membrane-type-description').dataset.lastSelectedId = newMaterialId;

            // Only update prices if they haven't been manually edited since the last material change
            if (!basePriceManuallyEdited) {
                document.getElementById('membrane-type-base-price').value = newBasePrice.toFixed(2);
            }

            if (!discountPriceManuallyEdited) {
                document.getElementById('membrane-type-discount-price').value = calculateDiscountPrice(newBasePrice).toFixed(2);
            }

            // Reset manual edit flags for the new material
            basePriceManuallyEdited = false;
            discountPriceManuallyEdited = false;
        }

        // Calculate quantity based on the formula
        calculateMembraneQuantity();

        // Calculate total
        calculateMembraneTotal();

        // Update subcategory rows using our dedicated function
        updateSubRowsFromMain();
        
        console.log("Updated membrane type and all sub-rows");
    }
}




// Calculate membrane quantity based on the formula
function calculateMembraneQuantity() {
    // Get values needed for the formula
    const roofAreaMembrane = parseFloat(document.getElementById('roofAreaMembrane').value) || 0;
    const lnFtFieldSeam = parseFloat(document.getElementById('lnFtFieldSeam').value) || 0;
    
    // Calculate quantity using the formula: (Total Roof Area - Membrane + (LN FT of Field Seam / 2)) * 1.05
    const quantity = (roofAreaMembrane + (lnFtFieldSeam / 2)) * 1.05;
    
    console.log("Calculating membrane quantity: roof area =", roofAreaMembrane, "field seam =", lnFtFieldSeam, "quantity =", quantity);
    
    // Update the quantity input field
    document.getElementById('membrane-type-quantity').value = quantity.toFixed(2);
    
    // Also update the total since the quantity changed
    calculateMembraneTotal();
}


// Fix the calculateMembraneTotal function
function calculateMembraneTotal() {
    // First check if all required elements exist
    const quantityElement = document.getElementById('membrane-type-quantity');
    const discountPriceElement = document.getElementById('membrane-type-discount-price');
    const totalElement = document.getElementById('membrane-type-total');
    
    // If any element is missing, log an error and return early
    if (!quantityElement || !discountPriceElement || !totalElement) {
        console.error("Missing required elements in calculateMembraneTotal:", {
            quantityElement: !!quantityElement,
            discountPriceElement: !!discountPriceElement,
            totalElement: !!totalElement
        });
        return;
    }
    
    const quantity = parseFloat(quantityElement.value) || 0;
    const discountPrice = parseFloat(discountPriceElement.value) || 0;
    const total = quantity * discountPrice;
    
    console.log("Calculating membrane total: quantity =", quantity, "discount price =", discountPrice, "total =", total);
    
    // Set the total value
    totalElement.value = total.toFixed(2);
}

// Function to update sub-rows with main row values
function updateSubRowsFromMain() {
    // Get values from the main membrane row
    const mainUnit = document.getElementById('membrane-type-unit').textContent || 'SQ FT';
    const mainBasePrice = parseFloat(document.getElementById('membrane-type-base-price').value) || 0;
    const mainDiscountPrice = parseFloat(document.getElementById('membrane-type-discount-price').value) || 0;
    
    console.log("Updating sub-rows with main row values - Base Price:", mainBasePrice, "Discount Price:", mainDiscountPrice);
    
    // Update perimeter row
    document.getElementById('membrane-perimeter-unit').textContent = mainUnit;
    document.getElementById('membrane-perimeter-base-price').value = mainBasePrice.toFixed(2);
    document.getElementById('membrane-perimeter-discount-price').value = mainDiscountPrice.toFixed(2);
    
    // Update curb row
    document.getElementById('membrane-curb-unit').textContent = mainUnit;
    document.getElementById('membrane-curb-base-price').value = mainBasePrice.toFixed(2);
    document.getElementById('membrane-curb-discount-price').value = mainDiscountPrice.toFixed(2);
    
    // Recalculate totals for sub-rows
    calculateMembranePerimeterValues();
    calculateMembraneCurbValues();
}


// Function to calculate values
function calculateValues() {
    // Get input values
    const roofAreaTearOff = parseFloat(document.getElementById('roofAreaTearOff').value) || 0;
    const perimeter = parseFloat(document.getElementById('perimeter').value) || 0;
    const wallHeight = parseFloat(document.getElementById('wallHeight').value) || 0;
    const numberOfCurbs = parseFloat(document.getElementById('numberOfCurbs').value) || 0;
    const curbPerimeter = parseFloat(document.getElementById('curbPerimeter').value) || 0;
    const sheetWidth = parseFloat(document.getElementById('sheetWidth').value) || 0;
    const fastenersPerBoard = parseFloat(document.getElementById('fastenersPerBoard').value) || 0;
    const moldedSealantPocket = parseFloat(document.getElementById('moldedSealantPocket').value) || 0;

    // Calculate derived values based on formulas
    document.getElementById('roofAreaInsulation').value = roofAreaTearOff;
    document.getElementById('roofAreaMembrane').value = roofAreaTearOff;
    document.getElementById('roofAreaCoating').value = roofAreaTearOff;
    
    // Calculate Area of Perimeter - Wall Height (LF)
    // Formula: previous_value * input_store['Wall Height (LF)']
    // In this case, previous_value is perimeter
    const areaOfPerimeter = perimeter * wallHeight;
    document.getElementById('areaOfPerimeter').value = areaOfPerimeter.toFixed(2);
    
    // Calculate LN FT of Field Seam - Sheet Width (FT)
    // Formula: input_store['Total Roof Area - Insulation'] / (input_store['Sheet Width (FT)'] * 100) * (100+input_store['Sheet Width (FT)'])
    let lnFtFieldSeam = 0;
    if (sheetWidth > 0) {
        lnFtFieldSeam = roofAreaTearOff / (sheetWidth * 100) * (100 + sheetWidth);
    }
    document.getElementById('lnFtFieldSeam').value = lnFtFieldSeam.toFixed(2);
    
    // Calculate Insulation Fasteners & Plates
    // Formula: ((input_store['Total Roof Area - Membrane'] / 32) * input_store['Fasteners / Board (EA)']) * 1.05
    const roofAreaMembrane = parseFloat(document.getElementById('roofAreaMembrane').value) || 0;
    const insulationFasteners = ((roofAreaMembrane / 32) * fastenersPerBoard) * 1.05;
    
    // Make sure we're setting the value to the correct element
    document.getElementById('insulationFasteners').value = insulationFasteners.toFixed(2);
    
    // Calculate perimeter securement
    document.getElementById('perimeterSecurement').value = ((perimeter + curbPerimeter) * 1.05).toFixed(2);
    
    // Calculate one part sealant
    document.getElementById('onePartSealant').value = (moldedSealantPocket / 2).toFixed(2);
    
    // Calculate HP-X Perim
    document.getElementById('hpxPerim').value = ((perimeter * 2) * 1.05).toFixed(2);
    
    // Update membrane quantity
    calculateMembraneQuantity();
    
    // Update membrane total
    calculateMembraneTotal();
    
    // Update subcategory rows - explicitly call these to ensure they're updated
    calculateMembranePerimeterValues();
    calculateMembraneCurbValues();

    // Update subcategory rows using our dedicated function
    updateSubRowsFromMain();
    
    // Also update Weathered Mem Cleaner values if that function exists
    if (typeof calculateWeatheredMemCleanerValues === 'function') {
        calculateWeatheredMemCleanerValues();
    }
    
    console.log("All values calculated and updated");
}

// Function to load Protection Mat data
async function loadProtectionMat() {
    try {
        console.log("Fetching Protection Mat data...");
        // Fetch the specific material with ID 100
        const result = await eel.fetch_material_by_id(100)();
        console.log("Protection Mat fetch result:", result);

        if (result && result.success && result.material) {
            const material = result.material;

            // Set the unit
            document.getElementById('protection-mat-unit').textContent = material.unit || '';

            // Set the base price
            const basePrice = parseFloat(material.base_price || material.price) || 0;
            document.getElementById('protection-mat-base-price').value = basePrice.toFixed(2);

            // Calculate discount price (applying global discount)
            const discountPrice = calculateDiscountPrice(basePrice);
            document.getElementById('protection-mat-discount-price').value = discountPrice.toFixed(2);

            // Calculate total
            calculateProtectionMatTotal();

            console.log("Protection Mat data loaded successfully");
        } else {
            console.error("Error or no material found for Protection Mat:", result);
            // Set default values
            document.getElementById('protection-mat-unit').textContent = 'SQ FT';
            document.getElementById('protection-mat-base-price').value = '0.00';
            document.getElementById('protection-mat-discount-price').value = '0.00';
        }
    } catch (error) {
        console.error("Error loading Protection Mat data:", error);
    }
}

// Function to calculate discount price based on global discount
function calculateDiscountPrice(basePrice) {
    // Get discount rates from input fields
    const distributorDiscount = parseFloat(document.getElementById('distributor-discount').value) || 0;
    const directDiscount = parseFloat(document.getElementById('direct-discount').value) || 0;
    const totalDiscount = distributorDiscount + directDiscount;

    return basePrice * (1 - totalDiscount);
}

// Function to calculate Protection Mat total
function calculateProtectionMatTotal() {
    const quantity = parseFloat(document.getElementById('protection-mat-quantity').value) || 0;
    const discountPrice = parseFloat(document.getElementById('protection-mat-discount-price').value) || 0;

    // Calculate total using the formula: quantity * discount_price
    const total = quantity * discountPrice;

    document.getElementById('protection-mat-total').value = total.toFixed(2);
}

// Function to load Membrane data
async function loadMembrane() {
    try {
        console.log("Fetching Membrane data...");
        const result = await eel.fetch_material_by_id(101)();
        console.log("Membrane fetch result:", result);

        if (result && result.success && result.material) {
            const material = result.material;
            document.getElementById('membrane-unit').textContent = material.unit || '';
            const basePrice = parseFloat(material.base_price || material.price) || 0;
            document.getElementById('membrane-base-price').value = basePrice.toFixed(2);
            const discountPrice = calculateDiscountPrice(basePrice);
            document.getElementById('membrane-discount-price').value = discountPrice.toFixed(2);
            calculateMembraneTotal();
            console.log("Membrane data loaded successfully");
        } else {
            console.error("Error or no material found for Membrane:", result);
            document.getElementById('membrane-unit').textContent = 'SQ FT';
            document.getElementById('membrane-base-price').value = '0.00';
            document.getElementById('membrane-discount-price').value = '0.00';
        }
    } catch (error) {
        console.error("Error loading Membrane data:", error);
    }
}

// Function to calculate discount price based on global discount
function calculateDiscountPrice(basePrice) {
    const distributorDiscount = parseFloat(document.getElementById('distributor-discount').value) || 0;
    const directDiscount = parseFloat(document.getElementById('direct-discount').value) || 0;
    const totalDiscount = distributorDiscount + directDiscount;
    return basePrice * (1 - totalDiscount);
}



// Function to initialize all event listeners
function initializeEventListeners() {
    // Add event listeners for input fields that should trigger calculations
    document.getElementById('roofAreaTearOff').addEventListener('change', calculateValues);
    document.getElementById('perimeter').addEventListener('change', function() {
        calculateValues();
        // Also update membrane sub-rows since perimeter is used in their calculations
        calculateMembranePerimeterValues();
        calculateMembraneCurbValues();
    });
    document.getElementById('wallHeight').addEventListener('change', function() {
        calculateValues();
        // Also update membrane perimeter row since wall height is used in its calculation
        calculateMembranePerimeterValues();
    });
    document.getElementById('numberOfCurbs').addEventListener('change', calculateValues);
    document.getElementById('curbPerimeter').addEventListener('change', function() {
        calculateValues();
        // Also update membrane curb row since curb perimeter is used in its calculation
        calculateMembraneCurbValues();
    });
    document.getElementById('sheetWidth').addEventListener('change', calculateValues);
    document.getElementById('fastenersPerBoard').addEventListener('change', calculateValues);
    document.getElementById('moldedSealantPocket').addEventListener('change', calculateValues);
    
    // Add event listeners for membrane type price fields
    document.getElementById('membrane-type-base-price').addEventListener('input', function() {
        basePriceManuallyEdited = true;
        // Update discount price if it hasn't been manually edited
        if (!discountPriceManuallyEdited) {
            const basePrice = parseFloat(this.value) || 0;
            document.getElementById('membrane-type-discount-price').value = calculateDiscountPrice(basePrice).toFixed(2);
        }
        calculateMembraneTotal();
        
        // Force update sub-rows with the new base price
        updateSubRowsFromMain();
    });
    
    // Also add a 'change' event listener to catch when focus leaves the field
    document.getElementById('membrane-type-base-price').addEventListener('change', function() {
        // Force update sub-rows again to ensure they're updated
        updateSubRowsFromMain();
    });
    
    document.getElementById('membrane-type-discount-price').addEventListener('change', function() {
        discountPriceManuallyEdited = true;
        calculateMembraneTotal();
        
        // Update sub-rows with the new discount price
        updateSubRowsFromMain();
    });
    
    // Add event listener for protection mat quantity
    document.getElementById('protection-mat-quantity').addEventListener('change', calculateProtectionMatTotal);
    
    // Add event listeners for discount inputs
    document.getElementById('distributor-discount').addEventListener('change', updateAllDiscounts);
    document.getElementById('direct-discount').addEventListener('change', updateAllDiscounts);
}

// Function to load Weathered Mem Cleaner data
async function loadWeatheredMemCleaner() {
    try {
        console.log("Fetching Weathered Mem Cleaner data...");
        // Fetch the specific material with ID 43 (Weathered Mem Cleaner)
        const result = await eel.fetch_material_by_id(43)();
        console.log("Weathered Mem Cleaner fetch result:", result);

        if (result && result.success && result.material) {
            const material = result.material;

            // Set the unit for all three rows
            document.getElementById('weathered-mem-cleaner-unit').textContent = material.unit || 'EA';
            document.getElementById('weathered-mem-cleaner-perimeter-unit').textContent = material.unit || 'EA';
            document.getElementById('weathered-mem-cleaner-curb-unit').textContent = material.unit || 'EA';

            // Set the base price for all three rows
            const basePrice = parseFloat(material.price) || 0;
            document.getElementById('weathered-mem-cleaner-base-price').value = basePrice.toFixed(2);
            document.getElementById('weathered-mem-cleaner-perimeter-base-price').value = basePrice.toFixed(2);
            document.getElementById('weathered-mem-cleaner-curb-base-price').value = basePrice.toFixed(2);

            // Calculate discount price for all three rows
            const discountPrice = calculateDiscountPrice(basePrice);
            document.getElementById('weathered-mem-cleaner-discount-price').value = discountPrice.toFixed(2);
            document.getElementById('weathered-mem-cleaner-perimeter-discount-price').value = discountPrice.toFixed(2);
            document.getElementById('weathered-mem-cleaner-curb-discount-price').value = discountPrice.toFixed(2);

            // Calculate quantities and totals
            calculateWeatheredMemCleanerValues();

            console.log("Weathered Mem Cleaner data loaded successfully");
        } else {
            console.error("Error or no material found for Weathered Mem Cleaner:", result);
        }
    } catch (error) {
        console.error("Error loading Weathered Mem Cleaner data:", error);
    }
}

// Function to set default values for Weathered Mem Cleaner
function setDefaultWeatheredMemCleanerValues() {
    document.getElementById('weathered-mem-cleaner-unit').textContent = 'EA';
    document.getElementById('weathered-mem-cleaner-perimeter-unit').textContent = 'EA';
    document.getElementById('weathered-mem-cleaner-curb-unit').textContent = 'EA';
    
    document.getElementById('weathered-mem-cleaner-base-price').value = '0.00';
    document.getElementById('weathered-mem-cleaner-perimeter-base-price').value = '0.00';
    document.getElementById('weathered-mem-cleaner-curb-base-price').value = '0.00';
    
    document.getElementById('weathered-mem-cleaner-discount-price').value = '0.00';
    document.getElementById('weathered-mem-cleaner-perimeter-discount-price').value = '0.00';
    document.getElementById('weathered-mem-cleaner-curb-discount-price').value = '0.00';
}

// Function to calculate Weathered Mem Cleaner values
function calculateWeatheredMemCleanerValues() {
    // Get required values
    const lnFtFieldSeam = parseFloat(document.getElementById('lnFtFieldSeam').value) || 0;
    const perimeter = parseFloat(document.getElementById('perimeter').value) || 0;
    const curbPerimeter = parseFloat(document.getElementById('curbPerimeter').value) || 0;
    
    // Get discount price
    const discountPrice = parseFloat(document.getElementById('weathered-mem-cleaner-discount-price').value) || 0;
    
    // Calculate quantities
    // Field & Seams: (input_store['LN FT of Field Seam - Sheet Width (FT)']) / 500 / 5 * 1.05
    const fieldQuantity = (lnFtFieldSeam / 500 / 5) * 1.05;
    document.getElementById('weathered-mem-cleaner-quantity').value = fieldQuantity.toFixed(2);
    
    // Perimeter & Walls: 1.05 * (input_store['Perimeter'] / 500 / 5)
    const perimeterQuantity = 1.05 * (perimeter / 500 / 5);
    document.getElementById('weathered-mem-cleaner-perimeter-quantity').value = perimeterQuantity.toFixed(2);
    
    // Curb Perimeter: input_store['Curb Perimeter'] / 550 / 5 * 1.025
    const curbQuantity = (curbPerimeter / 550 / 5) * 1.025;
    document.getElementById('weathered-mem-cleaner-curb-quantity').value = curbQuantity.toFixed(2);
    
    // Calculate totals
    document.getElementById('weathered-mem-cleaner-total').value = (fieldQuantity * discountPrice).toFixed(2);
    document.getElementById('weathered-mem-cleaner-perimeter-total').value = (perimeterQuantity * discountPrice).toFixed(2);
    document.getElementById('weathered-mem-cleaner-curb-total').value = (curbQuantity * discountPrice).toFixed(2);
}


// Function to update all discount prices when global discounts change
function updateAllDiscounts() {
    // Update membrane discount prices
    const membraneBasePrice = parseFloat(document.getElementById('membrane-type-base-price').value) || 0;
    if (!discountPriceManuallyEdited) {
        document.getElementById('membrane-type-discount-price').value = calculateDiscountPrice(membraneBasePrice).toFixed(2);
    }
    
    // Update protection mat discount price
    const protectionMatBasePrice = parseFloat(document.getElementById('protection-mat-base-price').value) || 0;
    document.getElementById('protection-mat-discount-price').value = calculateDiscountPrice(protectionMatBasePrice).toFixed(2);
    
    // Update weathered mem cleaner discount prices
    const weatheredMemCleanerBasePrice = parseFloat(document.getElementById('weathered-mem-cleaner-base-price').value) || 0;
    const discountPrice = calculateDiscountPrice(weatheredMemCleanerBasePrice);
    document.getElementById('weathered-mem-cleaner-discount-price').value = discountPrice.toFixed(2);
    document.getElementById('weathered-mem-cleaner-perimeter-discount-price').value = discountPrice.toFixed(2);
    document.getElementById('weathered-mem-cleaner-curb-discount-price').value = discountPrice.toFixed(2);
    
    // Recalculate all totals
    calculateMembraneTotal();
    calculateProtectionMatTotal();
    calculateWeatheredMemCleanerValues();
    
    // Update subcategory rows
    calculateMembranePerimeterValues();
    calculateMembraneCurbValues();
}

function updateAllMembraneRows() {
    updateMembraneType();
    calculateMembranePerimeterValues();
    calculateMembraneCurbValues();
}

// Initialize everything when the window loads
window.onload = async function() {
    console.log("Window loaded");
    
    try {
        // Initialize event listeners first
        initializeEventListeners();
        
        // Load materials data with proper error handling
        try {
            await loadMembraneTypes();
            console.log("Membrane types loaded successfully");
        } catch (error) {
            console.error("Error loading membrane types:", error);
        }
        
        // Add a delay to ensure DOM updates
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Load project data with proper error handling
        try {
            await loadProjectData();
            console.log("Project data loaded successfully");
            
            // Force update all membrane rows
            updateAllMembraneRows();
            console.log("Forced update of all membrane rows after loading project");
        } catch (error) {
            console.error("Error loading project data:", error);
        }
        
        // Add another delay to ensure DOM updates
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Load other materials
        try {
            await loadProtectionMat();
            await loadWeatheredMemCleaner();
            console.log("Additional materials loaded successfully");
        } catch (error) {
            console.error("Error loading additional materials:", error);
        }
        
        // Add another delay to ensure DOM updates
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Calculate values and update discounts with proper error handling
        try {
            // Make sure all required elements exist before calculating
            if (document.getElementById('membrane-type-quantity') && 
                document.getElementById('membrane-type-discount-price') &&
                document.getElementById('membrane-type-total')) {
                calculateValues();
                // Explicitly calculate membrane total
                calculateMembraneTotal();
                console.log("Values calculated successfully");
            } else {
                console.warn("Required elements not found, skipping calculations");
            }
        } catch (error) {
            console.error("Error calculating values:", error);
        }
        
        // Add another delay to ensure DOM updates
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Update discounts with proper error handling
        try {
            // Make sure all required elements exist before updating discounts
            if (document.getElementById('membrane-type-base-price') && 
                document.getElementById('membrane-type-discount-price')) {
                calculateMembraneQuantity();
                calculateMembraneTotal();
                
                updateSubRowsFromMain();
                console.log("Discounts updated successfully");
            } else {
                console.warn("Required elements not found, skipping discount updates");
            }
        } catch (error) {
            console.error("Error updating discounts:", error);
        }

        try {
            // Make sure all required elements exist before calculating
            if (document.getElementById('membrane-type-quantity') && 
                document.getElementById('membrane-type-discount-price')) {
                
                // First calculate the membrane quantity
                calculateMembraneQuantity();
                
                // Then explicitly calculate the membrane total
                calculateMembraneTotal();
                
                // After that, update the sub-rows
                updateSubRowsFromMain();
                
                console.log("Membrane calculations completed in correct sequence");
            }
        } catch (error) {
            console.error("Error in membrane calculations:", error);
        }

        // Force update sub-rows from main row
        if (typeof updateSubRowsFromMain === 'function') {
            updateSubRowsFromMain();
            console.log("Forced update of sub-rows from main row");
        }

        // Set up a MutationObserver to watch for changes to the main row's base price
        try {
            const mainBasePriceElement = document.getElementById('membrane-type-base-price');
            if (mainBasePriceElement) {
                const observer = new MutationObserver(function(mutations) {
                    console.log("Detected change to main row base price via MutationObserver");
                    updateSubRowsFromMain();
                });
                
                observer.observe(mainBasePriceElement, { 
                    attributes: true, 
                    attributeFilter: ['value'] 
                });
                
                console.log("Set up MutationObserver for main row base price");
            }
        } catch (error) {
            console.error("Error setting up MutationObserver:", error);
        }
        
        console.log("Initialization complete");
    } catch (error) {
        console.error("Error during initialization:", error);
    }
};
