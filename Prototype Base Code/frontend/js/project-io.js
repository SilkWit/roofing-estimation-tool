// project-io.js - Handles project saving and loading functionality

// Check if Eel is ready
function isEelReady() {
    return typeof eel !== 'undefined' && eel.load_project !== undefined;
}

// Wait for Eel to be ready
function waitForEel(callback, maxAttempts = 10) {
    let attempts = 0;
    
    function checkEel() {
        attempts++;
        if (isEelReady()) {
            console.log("Eel is ready");
            callback();
        } else if (attempts < maxAttempts) {
            console.log(`Waiting for Eel to be ready (attempt ${attempts}/${maxAttempts})...`);
            setTimeout(checkEel, 500);
        } else {
            console.error("Eel failed to initialize after maximum attempts");
        }
    }
    
    checkEel();
}

// Function to check project name
function checkProjectName() {
    const projectName = localStorage.getItem('currentProject');
    console.log("Current project from localStorage:", projectName);
    
    if (!projectName) {
        // Try to get it from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const projectParam = urlParams.get('project');
        
        if (projectParam) {
            console.log("Found project in URL parameters:", projectParam);
            localStorage.setItem('currentProject', projectParam);
            return projectParam;
        } else {
            console.log("No project name found in localStorage or URL");
            return null;
        }
    }
    
    return projectName;
}



// Function to load project data and populate form fields
async function loadProjectData() {
    try {
        // Get the current project name
        const projectName = checkProjectName();
        console.log("loadProjectData: Loading project:", projectName);
        
        if (!projectName) {
            console.log("loadProjectData: No project selected to load");
            return;
        }
        
        // Call the backend to load the project
        console.log("loadProjectData: Calling eel.load_project_file with:", projectName);
        const result = await eel.load_project_file(projectName)();
        console.log("loadProjectData: Raw project data received:", result);
        
        if (result && result.success && result.data) {
            const projectData = result.data;
            
            // Set global discount values first
            if (projectData["Distributor Discount"] !== undefined) {
                document.getElementById('distributor-discount').value = projectData["Distributor Discount"];
                console.log("Loaded Distributor Discount:", projectData["Distributor Discount"]);
            }
            
            if (projectData["Direct Discount"] !== undefined) {
                document.getElementById('direct-discount').value = projectData["Direct Discount"];
                console.log("Loaded Direct Discount:", projectData["Direct Discount"]);
            }
            
            // Load extra input values
            if (projectData["Wall Height (LF)"]) {
                document.getElementById('wallHeight').value = projectData["Wall Height (LF)"];
            }
            
            if (projectData["Sheet Width (FT)"]) {
                document.getElementById('sheetWidth').value = projectData["Sheet Width (FT)"];
            }
            
            if (projectData["Fasteners / Board (EA)"]) {
                document.getElementById('fastenersPerBoard').value = projectData["Fasteners / Board (EA)"];
            }
            
            // Populate Production Quantities fields
            if (projectData["Production Quantities"]) {
                const quantities = projectData["Production Quantities"];
                
                // Loop through each quantity item
                for (const item of quantities) {
                    const description = item.description;
                    const subDescription = item.sub_description || "";
                    const value = item.value || 0;
                    
                    console.log(`Loading: ${description}${subDescription} = ${value}`);
                    
                    // Map to field IDs
                    if (description === "Total Roof Area" && subDescription === " - Tear-Off") {
                        document.getElementById("roofAreaTearOff").value = value;
                    } 
                    else if (description === "Perimeter" && subDescription === "") {
                        document.getElementById("perimeter").value = value;
                    }
                    else if (description === "Area of Perimeter" && subDescription === " - Wall Height (LF)") {
                        document.getElementById("areaOfPerimeter").value = value;
                    }
                    else if (description === "Number of Curbs") {
                        document.getElementById("numberOfCurbs").value = value;
                    }
                    else if (description === "Curb Perimeter") {
                        document.getElementById("curbPerimeter").value = value;
                    }
                    else if (description === "LN FT of Field Seam" && subDescription === " - Sheet Width (FT)") {
                        document.getElementById("lnFtFieldSeam").value = value;
                    }
                    else if (description === "LN FT of Walkway") {
                        document.getElementById("lnFtWalkway").value = value;
                    }
                    else if (description === "SF of Walkway") {
                        document.getElementById("sfWalkway").value = value;
                    }
                    else if (description === "Number of Roof Drains") {
                        document.getElementById("roofDrains").value = value;
                    }
                    else if (description === "Number of Scuppers") {
                        document.getElementById("scuppers").value = value;
                    }
                    else if (description === "Number of VTR'S" && subDescription === " - SMALL") {
                        document.getElementById("vtrsSmall").value = value;
                    }
                    else if (description === "Number of VTR'S" && subDescription === " - LARGE / Universal") {
                        document.getElementById("vtrsLarge").value = value;
                    }
                    else if (description === "Taper Area") {
                        document.getElementById("taperArea").value = value;
                    }
                    else if (description === "Insulation Fasteners & Plates" && subDescription === " - Fasteners / Board (EA)") {
                        document.getElementById("insulationFasteners").value = value;
                    }
                    else if (description === "Expansion Joint" && subDescription === " (Wall)") {
                        document.getElementById("expansionJointWall").value = value;
                    }
                    else if (description === "Expansion Joint" && subDescription === " (Field)") {
                        document.getElementById("expansionJointField").value = value;
                    }
                    else if (description === "Coating") {
                        document.getElementById("coating").value = value;
                    }
                    else if (description === "Pavers") {
                        document.getElementById("pavers").value = value;
                    }
                    else if (description === "Paver Perimeter") {
                        document.getElementById("paverPerimeter").value = value;
                    }
                    else if (description.includes("725TR") || description === "725TR") {
                        document.getElementById("tr725").value = value;
                        document.getElementById("tr725Description").value = description;
                    }
                    else if (description.includes("CAV Grip") || description === "CAV Grip") {
                        document.getElementById("cavGrip").value = value;
                        document.getElementById("cavGripDescription").value = description;
                    }
                    else if (description.includes("Molded Sealant Pocket") || description === "Molded Sealant Pocket") {
                        document.getElementById("moldedSealantPocket").value = value;
                        document.getElementById("moldedSealantPocketDescription").value = description;
                    }
                    else if (description.includes("One Part Sealant") || description === "One Part Sealant (2/pcket)") {
                        document.getElementById("onePartSealant").value = value;
                        document.getElementById("onePartSealantDescription").value = description;
                    }
                    else if (description.includes("HP-X Perim") || description === '2" HP-X Perim') {
                        document.getElementById("hpxPerim").value = value;
                        document.getElementById("hpxPerimDescription").value = description;
                    }
                    else if (description.includes("Coping Underlayment") || description === "Coping Underlayment") {
                        document.getElementById("copingUnderlayment").value = value;
                        document.getElementById("copingUnderlaymentDescription").value = description;
                    }
                }
            }
            
            // Populate Material Pricing
            if (projectData["Material Pricing"]) {
                populateMaterialPricing(projectData);
            }
            
            // Add a delay before calculating values
            await new Promise(resolve => setTimeout(resolve, 200));
            
            // Try to calculate values
            try {
                // Make sure the membrane type is properly set
                const select = document.getElementById('membrane-type-description');
                if (select && select.selectedIndex > 0) {
                    // Trigger the change event to update dependent fields
                    const event = new Event('change');
                    select.dispatchEvent(event);
                }
                
                // Calculate values for all fields
                if (typeof calculateValues === 'function') {
                    calculateValues();
                }
                
                // Calculate membrane-specific values
                if (typeof calculateMembranePerimeterValues === 'function') {
                    calculateMembranePerimeterValues();
                }
                
                if (typeof calculateMembraneCurbValues === 'function') {
                    calculateMembraneCurbValues();
                }
                
                // Calculate weathered mem cleaner values
                if (typeof calculateWeatheredMemCleanerValues === 'function') {
                    calculateWeatheredMemCleanerValues();
                }
                
                // Update all discount prices
                if (typeof updateAllDiscounts === 'function') {
                    updateAllDiscounts();
                }
            } catch (error) {
                console.error("Error calculating values after loading project:", error);
            }
            
            console.log("loadProjectData: Project data loaded successfully");
        } else {
            console.error("loadProjectData: Error loading project:", result ? result.error : "No data returned");
        }
    } catch (error) {
        console.error("loadProjectData: Error loading project data:", error);
    }
}


function generateUniqueId() {
    // Use crypto.randomUUID if available (modern browsers)
    if (window.crypto && typeof window.crypto.randomUUID === 'function') {
        return window.crypto.randomUUID();
    }
    
    // Fallback to a timestamp-based ID
    return Date.now().toString() + Math.random().toString(36).substring(2, 11);
}


// Helper function to collect all production quantities data
function collectProductionQuantities() {
    return [
        createQuantityItem("Total Roof Area", " - Tear-Off", 'roofAreaTearOff', "SQ FT"),
        createQuantityItem("Total Roof Area", " - Insulation", 'roofAreaInsulation', "SQ FT"),
        createQuantityItem("Total Roof Area", " - Membrane", 'roofAreaMembrane', "SQ FT"),
        createQuantityItem("Total Roof Area", " - Coating", 'roofAreaCoating', "SQ FT"),
        createQuantityItem("Perimeter", "", 'perimeter', "LN FT"),
        createQuantityItem("Area of Perimeter", "Wall Height (LF)", 'areaOfPerimeter', "SQ FT"),
        createQuantityItem("Number of Curbs", "", 'numberOfCurbs', "EA"),
        createQuantityItem("Curb Perimeter", "", 'curbPerimeter', "LN FT"),
        createQuantityItem("LN FT of Field Seam", "Sheet Width (FT)", 'lnFtFieldSeam', "LN FT"),
        createQuantityItem("LN FT of Walkway", "", 'lnFtWalkway', "LN FT"),
        createQuantityItem("SF of Walkway", "", 'sfWalkway', "SQ FT"),
        createQuantityItem("Number of Roof Drains", "", 'roofDrains', "EA"),
        createQuantityItem("Number of Scuppers", "", 'scuppers', "EA"),
        createQuantityItem("Number of VTR'S", " - SMALL", 'vtrsSmall', "EA"),
        createQuantityItem("Number of VTR'S", " - LARGE / Universal", 'vtrsLarge', "EA"),
        createQuantityItem("Taper Area", "", 'taperArea', "SQ FT"),
        createQuantityItem("Insulation Fasteners & Plates", "Fasteners / Board (EA)", 'insulationFasteners', "EA"),
        createQuantityItem("Perimeter Securement", "", 'perimeterSecurement', "LN FT"),
        createQuantityItem("Expansion Joint", " (Wall)", 'expansionJointWall', "LN FT"),
        createQuantityItem("Expansion Joint", " (Field)", 'expansionJointField', "LN FT"),
        createQuantityItem("Coating", "", 'coating', "SQ FT"),
        createQuantityItem("Pavers", "", 'pavers', "SQ FT"),
        createQuantityItem("Paver Perimeter", "", 'paverPerimeter', "LN FT"),
        createQuantityItem(document.getElementById('tr725Description').value, "", 'tr725', document.getElementById('tr725Unit').value),
        createQuantityItem(document.getElementById('cavGripDescription').value, "", 'cavGrip', document.getElementById('cavGripUnit').value),
        createQuantityItem(document.getElementById('moldedSealantPocketDescription').value, "", 'moldedSealantPocket', document.getElementById('moldedSealantPocketUnit').value),
        createQuantityItem(document.getElementById('onePartSealantDescription').value, "", 'onePartSealant', document.getElementById('onePartSealantUnit').value),
        createQuantityItem(document.getElementById('hpxPerimDescription').value, "", 'hpxPerim', document.getElementById('hpxPerimUnit').value),
        createQuantityItem(document.getElementById('copingUnderlaymentDescription').value, "", 'copingUnderlayment', document.getElementById('copingUnderlaymentUnit').value)
    ];
}

// Helper function to create a production quantity item
function createQuantityItem(description, subDescription, elementId, unit) {
    return {
        "id": generateUniqueId(),
        "description": description,
        "sub_description": subDescription,
        "value": parseFloat(document.getElementById(elementId).value) || 0,
        "unit": unit
    };
}

// Helper function to collect all material pricing data
function collectMaterialPricing() {
    const materialPricing = [];
    
    // Get membrane type data
    const membraneSelect = document.getElementById('membrane-type-description');
    const selectedOption = membraneSelect.options[membraneSelect.selectedIndex];
    
    if (selectedOption && selectedOption.value) {
        // Add main membrane row
        materialPricing.push(createMaterialItem(
            selectedOption.textContent,
            "Field & Seams",
            'membrane-type-quantity',
            'membrane-type-unit',
            'membrane-type-base-price',
            'membrane-type-discount-price',
            'membrane-type-total'
        ));
        
        // Add perimeter membrane row
        materialPricing.push(createMaterialItem(
            selectedOption.textContent,
            "Perimeter & Walls",
            'membrane-perimeter-quantity',
            'membrane-perimeter-unit',
            'membrane-perimeter-base-price',
            'membrane-perimeter-discount-price',
            'membrane-perimeter-total'
        ));
        
        // Add curb membrane row
        materialPricing.push(createMaterialItem(
            selectedOption.textContent,
            "Curb Perimeter",
            'membrane-curb-quantity',
            'membrane-curb-unit',
            'membrane-curb-base-price',
            'membrane-curb-discount-price',
            'membrane-curb-total'
        ));
    }
    
    // Add protection mat row
    materialPricing.push(createMaterialItem(
        "Protection Mat",
        "",
        'protection-mat-quantity',
        'protection-mat-unit',
        'protection-mat-base-price',
        'protection-mat-discount-price',
        'protection-mat-total'
    ));
    
    // Add weathered mem cleaner rows
    materialPricing.push(createMaterialItem(
        "Weathered Mem Cleaner",
        "Field & Seams",
        'weathered-mem-cleaner-quantity',
        'weathered-mem-cleaner-unit',
        'weathered-mem-cleaner-base-price',
        'weathered-mem-cleaner-discount-price',
        'weathered-mem-cleaner-total'
    ));
    
    materialPricing.push(createMaterialItem(
        "Weathered Mem Cleaner",
        "Perimeter & Walls",
        'weathered-mem-cleaner-perimeter-quantity',
        'weathered-mem-cleaner-perimeter-unit',
        'weathered-mem-cleaner-perimeter-base-price',
        'weathered-mem-cleaner-perimeter-discount-price',
        'weathered-mem-cleaner-perimeter-total'
    ));
    
    materialPricing.push(createMaterialItem(
        "Weathered Mem Cleaner",
        "Curb Perimeter",
        'weathered-mem-cleaner-curb-quantity',
        'weathered-mem-cleaner-curb-unit',
        'weathered-mem-cleaner-curb-base-price',
        'weathered-mem-cleaner-curb-discount-price',
        'weathered-mem-cleaner-curb-total'
    ));
    
    return materialPricing;
}

// Helper function to create a material pricing item
function createMaterialItem(description, subDescription, quantityId, unitId, basePriceId, discountPriceId, totalId) {
    return {
        "id": generateUniqueId(),
        "description": description,
        "sub_description": subDescription,
        "quantity": parseFloat(document.getElementById(quantityId).value) || 0,
        "base_price": parseFloat(document.getElementById(basePriceId).value) || 0,
        "discount_price": parseFloat(document.getElementById(discountPriceId).value) || 0,
        "total": parseFloat(document.getElementById(totalId).value) || 0,
        "unit": document.getElementById(unitId).textContent
    };
}

// Helper function to populate production quantities from loaded data
function populateProductionQuantities(data) {
    if (!data || !data["Production Quantities"]) return;
    
    const quantities = data["Production Quantities"];
    
    // Map descriptions to element IDs
    const mappings = {
        "Total Roof Area - Tear-Off": 'roofAreaTearOff',
        "Total Roof Area - Insulation": 'roofAreaInsulation',
        "Total Roof Area - Membrane": 'roofAreaMembrane',
        "Total Roof Area - Coating": 'roofAreaCoating',
        "Perimeter": 'perimeter',
        "Area of Perimeter - Wall Height (LF)": 'areaOfPerimeter',
        "Number of Curbs": 'numberOfCurbs',
        "Curb Perimeter": 'curbPerimeter',
        "LN FT of Field Seam - Sheet Width (FT)": 'lnFtFieldSeam',
        "LN FT of Walkway": 'lnFtWalkway',
        "SF of Walkway": 'sfWalkway',
        "Number of Roof Drains": 'roofDrains',
        "Number of Scuppers": 'scuppers',
        "Number of VTR'S - SMALL": 'vtrsSmall',
        "Number of VTR'S - LARGE / Universal": 'vtrsLarge',
        "Taper Area": 'taperArea',
        "Insulation Fasteners & Plates - Fasteners / Board (EA)": 'insulationFasteners',
        "Perimeter Securement": 'perimeterSecurement',
        "Expansion Joint (Wall)": 'expansionJointWall',
        "Expansion Joint (Field)": 'expansionJointField',
        "Coating": 'coating',
        "Pavers": 'pavers',
        "Paver Perimeter": 'paverPerimeter'
    };
    
    // Set values for each field
    for (const item of quantities) {
        const fullDesc = item.description + (item.sub_description || "");
        const elementId = mappings[fullDesc];
        
        if (elementId && document.getElementById(elementId)) {
            document.getElementById(elementId).value = item.value;
        }
    }
    
    // Also set the extra input values if they exist in the data
    if (data["Wall Height (LF)"]) {
        document.getElementById('wallHeight').value = data["Wall Height (LF)"];
    }
    
    if (data["Sheet Width (FT)"]) {
        document.getElementById('sheetWidth').value = data["Sheet Width (FT)"];
    }
    
    if (data["Fasteners / Board (EA)"]) {
        document.getElementById('fastenersPerBoard').value = data["Fasteners / Board (EA)"];
    }
}

// Helper function to populate material pricing from loaded data
function populateMaterialPricing(data) {
    if (!data || !data["Material Pricing"]) return;
    
    const materials = data["Material Pricing"];
    
    // Find membrane type items
    const membraneItems = materials.filter(item => 
        item.description && (
            (item.description.includes("Mil") && item.description.includes("Rein")) ||
            item.description.includes("TPO") || 
            item.description.includes("EPDM") ||
            item.description.includes("CAR-")
        )
    );
    
    if (membraneItems.length > 0) {
        // Find the main membrane item (Field & Seams)
        const mainMembrane = membraneItems.find(item => item.sub_description === "Field & Seams");
        
        if (mainMembrane) {
            console.log("Found main membrane:", mainMembrane);
            
            // Set the membrane type dropdown
            const select = document.getElementById('membrane-type-description');
            
            // First make sure we have options loaded
            if (select.options.length <= 1) {
                console.log("Dropdown options not loaded yet, will try to load membrane types first");
                // If options aren't loaded yet, try to load them
                if (typeof loadMembraneTypes === 'function') {
                    loadMembraneTypes().then(() => {
                        // After loading, try to set the selection again
                        setMembraneTypeSelection(select, mainMembrane.description);
                    });
                }
            } else {
                // Options are already loaded, set the selection
                setMembraneTypeSelection(select, mainMembrane.description);
            }
            
            // Set the values for the main membrane row
            document.getElementById('membrane-type-quantity').value = mainMembrane.quantity || 0;
            document.getElementById('membrane-type-base-price').value = mainMembrane.base_price || 0;
            document.getElementById('membrane-type-discount-price').value = mainMembrane.discount_price || 0;
            document.getElementById('membrane-type-total').value = mainMembrane.total || 0;
            document.getElementById('membrane-type-unit').textContent = mainMembrane.unit || 'SQ FT';
            
            // Find and set perimeter membrane values
            const perimeterMembrane = membraneItems.find(item => item.sub_description === "Perimeter & Walls");
            if (perimeterMembrane) {
                document.getElementById('membrane-perimeter-quantity').value = perimeterMembrane.quantity || 0;
                document.getElementById('membrane-perimeter-base-price').value = perimeterMembrane.base_price || 0;
                document.getElementById('membrane-perimeter-discount-price').value = perimeterMembrane.discount_price || 0;
                document.getElementById('membrane-perimeter-total').value = perimeterMembrane.total || 0;
                document.getElementById('membrane-perimeter-unit').textContent = perimeterMembrane.unit || 'SQ FT';
            }
            
            // Find and set curb membrane values
            const curbMembrane = membraneItems.find(item => item.sub_description === "Curb Perimeter");
            if (curbMembrane) {
                document.getElementById('membrane-curb-quantity').value = curbMembrane.quantity || 0;
                document.getElementById('membrane-curb-base-price').value = curbMembrane.base_price || 0;
                document.getElementById('membrane-curb-discount-price').value = curbMembrane.discount_price || 0;
                document.getElementById('membrane-curb-total').value = curbMembrane.total || 0;
                document.getElementById('membrane-curb-unit').textContent = curbMembrane.unit || 'SQ FT';
            }

            try {
                // Trigger change event on membrane type dropdown to update all dependent fields
                const select = document.getElementById('membrane-type-description');
                if (select) {
                    const event = new Event('change');
                    select.dispatchEvent(event);
                }
                
                // Explicitly update sub-rows from main row
                if (typeof updateSubRowsFromMain === 'function') {
                    updateSubRowsFromMain();
                }
                
                // Calculate protection mat total
                if (typeof calculateProtectionMatTotal === 'function') {
                    calculateProtectionMatTotal();
                }
                
                // Calculate weathered mem cleaner values
                if (typeof calculateWeatheredMemCleanerValues === 'function') {
                    calculateWeatheredMemCleanerValues();
                }
            } catch (error) {
                console.error("Error recalculating values after populating material pricing:", error);
            }
            
            // Update the membrane type description in the sub-rows
            const perimeterDescCell = document.querySelector('#membrane-perimeter-row td:first-child span');
            const curbDescCell = document.querySelector('#membrane-curb-row td:first-child span');
            
            if (perimeterDescCell) {
                perimeterDescCell.textContent = mainMembrane.description;
            }
            
            if (curbDescCell) {
                curbDescCell.textContent = mainMembrane.description;
            }
        }
    }

    // Handle Protection Mat - use includes() instead of exact match
    const protectionMat = materials.find(item => item.description && item.description.includes("Protection Mat"));
    if (protectionMat) {
        console.log("Found Protection Mat:", protectionMat);
        
        // Make sure the quantity is set first
        const quantityElement = document.getElementById('protection-mat-quantity');
        if (quantityElement) {
            quantityElement.value = protectionMat.quantity || 0;
            console.log("Set Protection Mat quantity to:", protectionMat.quantity);
        }
        
        // Set other values
        const basePriceElement = document.getElementById('protection-mat-base-price');
        if (basePriceElement) {
            basePriceElement.value = protectionMat.base_price || 0;
        }
        
        const discountPriceElement = document.getElementById('protection-mat-discount-price');
        if (discountPriceElement) {
            discountPriceElement.value = protectionMat.discount_price || 0;
        }
        
        const totalElement = document.getElementById('protection-mat-total');
        if (totalElement) {
            totalElement.value = protectionMat.total || 0;
        }
        
        const unitElement = document.getElementById('protection-mat-unit');
        if (unitElement) {
            unitElement.textContent = protectionMat.unit || 'SQ FT';
        }
    } else {
        console.log("Protection Mat not found in loaded data");
    }
    
    // Handle Weathered Mem Cleaner rows
    const weatheredMemCleaners = materials.filter(item => 
        item.description && item.description.includes("Weathered Mem Cleaner")
    );
    
    // Field & Seams
    const fieldWeatheredMem = weatheredMemCleaners.find(item => item.sub_description === "Field & Seams");
    if (fieldWeatheredMem) {
        document.getElementById('weathered-mem-cleaner-quantity').value = fieldWeatheredMem.quantity || 0;
        document.getElementById('weathered-mem-cleaner-base-price').value = fieldWeatheredMem.base_price || 0;
        document.getElementById('weathered-mem-cleaner-discount-price').value = fieldWeatheredMem.discount_price || 0;
        document.getElementById('weathered-mem-cleaner-total').value = fieldWeatheredMem.total || 0;
        document.getElementById('weathered-mem-cleaner-unit').textContent = fieldWeatheredMem.unit || 'EA';
    }
    
    // Perimeter & Walls
    const perimeterWeatheredMem = weatheredMemCleaners.find(item => item.sub_description === "Perimeter & Walls");
    if (perimeterWeatheredMem) {
        document.getElementById('weathered-mem-cleaner-perimeter-quantity').value = perimeterWeatheredMem.quantity || 0;
        document.getElementById('weathered-mem-cleaner-perimeter-base-price').value = perimeterWeatheredMem.base_price || 0;
        document.getElementById('weathered-mem-cleaner-perimeter-discount-price').value = perimeterWeatheredMem.discount_price || 0;
        document.getElementById('weathered-mem-cleaner-perimeter-total').value = perimeterWeatheredMem.total || 0;
        document.getElementById('weathered-mem-cleaner-perimeter-unit').textContent = perimeterWeatheredMem.unit || 'EA';
    }
    
    // Curb Perimeter
    const curbWeatheredMem = weatheredMemCleaners.find(item => item.sub_description === "Curb Perimeter");
    if (curbWeatheredMem) {
        document.getElementById('weathered-mem-cleaner-curb-quantity').value = curbWeatheredMem.quantity || 0;
        document.getElementById('weathered-mem-cleaner-curb-base-price').value = curbWeatheredMem.base_price || 0;
        document.getElementById('weathered-mem-cleaner-curb-discount-price').value = curbWeatheredMem.discount_price || 0;
        document.getElementById('weathered-mem-cleaner-curb-total').value = curbWeatheredMem.total || 0;
        document.getElementById('weathered-mem-cleaner-curb-unit').textContent = curbWeatheredMem.unit || 'EA';
    }
    
    // After setting all values, try to recalculate
    try {
        // Trigger change event on membrane type dropdown to update all dependent fields
        const select = document.getElementById('membrane-type-description');
        if (select) {
            const event = new Event('change');
            select.dispatchEvent(event);
        }

        if (typeof calculateMembraneTotal === 'function') {
            calculateMembraneTotal();
        }
        
        // Calculate protection mat total
        if (typeof calculateProtectionMatTotal === 'function') {
            calculateProtectionMatTotal();
        }
        
        // Calculate weathered mem cleaner values
        if (typeof calculateWeatheredMemCleanerValues === 'function') {
            calculateWeatheredMemCleanerValues();
        }
    } catch (error) {
        console.error("Error recalculating values after populating material pricing:", error);
    }
}


// Helper function to set the membrane type dropdown selection
function setMembraneTypeSelection(select, membraneDescription) {
    console.log("Setting membrane type dropdown to:", membraneDescription);
    
    let found = false;
    
    // First try exact match
    for (let i = 0; i < select.options.length; i++) {
        if (select.options[i].textContent === membraneDescription) {
            select.selectedIndex = i;
            found = true;
            console.log("Found exact match at index", i);
            break;
        }
    }
    
    // If no exact match, try partial match
    if (!found) {
        for (let i = 0; i < select.options.length; i++) {
            if (select.options[i].textContent.includes(membraneDescription) || 
                membraneDescription.includes(select.options[i].textContent)) {
                select.selectedIndex = i;
                found = true;
                console.log("Found partial match at index", i);
                break;
            }
        }
    }
    
    // If still not found, log a warning
    if (!found) {
        console.warn("Could not find matching option for membrane type:", membraneDescription);
        console.log("Available options:", Array.from(select.options).map(o => o.textContent));
    }
    
    // Trigger the change event to update dependent fields
    const event = new Event('change');
    select.dispatchEvent(event);
}


// Function to save project data
async function saveProjectData() {
    try {
        // Get the current project name from localStorage
        const projectName = localStorage.getItem('currentProject');
        console.log("Saving project:", projectName);
        
        if (!projectName) {
            console.error("No project selected to save");
            alert("Please select a project before saving");
            return;
        }
        
        // Collect all the data from the form
        const projectData = {
            "Production Quantities": [],
            "Material Pricing": [],
            "Wall Height (LF)": parseFloat(document.getElementById('wallHeight').value) || 0,
            "Sheet Width (FT)": parseFloat(document.getElementById('sheetWidth').value) || 0,
            "Fasteners / Board (EA)": parseFloat(document.getElementById('fastenersPerBoard').value) || 0,
            // Add discount values to the saved data
            "Distributor Discount": parseFloat(document.getElementById('distributor-discount').value) || 0,
            "Direct Discount": parseFloat(document.getElementById('direct-discount').value) || 0
        };
        
        // Collect Production Quantities data
        const quantityFields = [
            { id: 'roofAreaTearOff', description: 'Total Roof Area', subDescription: ' - Tear-Off', unit: 'SQ FT' },
            { id: 'perimeter', description: 'Perimeter', subDescription: '', unit: 'LN FT' },
            { id: 'numberOfCurbs', description: 'Number of Curbs', subDescription: '', unit: 'EA' },
            { id: 'curbPerimeter', description: 'Curb Perimeter', subDescription: '', unit: 'LN FT' },
            { id: 'lnFtWalkway', description: 'LN FT of Walkway', subDescription: '', unit: 'LN FT' },
            { id: 'sfWalkway', description: 'SF of Walkway', subDescription: '', unit: 'SQ FT' },
            { id: 'roofDrains', description: 'Number of Roof Drains', subDescription: '', unit: 'EA' },
            { id: 'scuppers', description: 'Number of Scuppers', subDescription: '', unit: 'EA' },
            { id: 'vtrsSmall', description: 'Number of VTR\'S', subDescription: ' - SMALL', unit: 'EA' },
            { id: 'vtrsLarge', description: 'Number of VTR\'S', subDescription: ' - LARGE / Universal', unit: 'EA' },
            { id: 'taperArea', description: 'Taper Area', subDescription: '', unit: 'SQ FT' },
            { id: 'expansionJointWall', description: 'Expansion Joint', subDescription: ' (Wall)', unit: 'LN FT' },
            { id: 'expansionJointField', description: 'Expansion Joint', subDescription: ' (Field)', unit: 'LN FT' },
            { id: 'coating', description: 'Coating', subDescription: '', unit: 'SQ FT' },
            { id: 'pavers', description: 'Pavers', subDescription: '', unit: 'SQ FT' },
            { id: 'paverPerimeter', description: 'Paver Perimeter', subDescription: '', unit: 'LN FT' },
            { id: 'tr725', description: document.getElementById('tr725Description').value, subDescription: '', unit: document.getElementById('tr725Unit').value },
            { id: 'cavGrip', description: document.getElementById('cavGripDescription').value, subDescription: '', unit: document.getElementById('cavGripUnit').value },
            { id: 'moldedSealantPocket', description: document.getElementById('moldedSealantPocketDescription').value, subDescription: '', unit: document.getElementById('moldedSealantPocketUnit').value },
            { id: 'copingUnderlayment', description: document.getElementById('copingUnderlaymentDescription').value, subDescription: '', unit: document.getElementById('copingUnderlaymentUnit').value }
        ];
        
        for (const field of quantityFields) {
            const value = parseFloat(document.getElementById(field.id).value) || 0;
            projectData["Production Quantities"].push({
                description: field.description,
                sub_description: field.subDescription,
                value: value,
                unit: field.unit
            });
        }
        
        // Collect Material Pricing data
        // Membrane Type
        const membraneSelect = document.getElementById('membrane-type-description');
        const membraneDescription = membraneSelect.options[membraneSelect.selectedIndex].textContent;
        
        projectData["Material Pricing"].push({
            description: membraneDescription,
            sub_description: "Field & Seams",
            quantity: parseFloat(document.getElementById('membrane-type-quantity').value) || 0,
            unit: document.getElementById('membrane-type-unit').textContent,
            base_price: parseFloat(document.getElementById('membrane-type-base-price').value) || 0,
            discount_price: parseFloat(document.getElementById('membrane-type-discount-price').value) || 0,
            total: parseFloat(document.getElementById('membrane-type-total').value) || 0
        });
        
        // Perimeter Membrane Type
        projectData["Material Pricing"].push({
            description: membraneDescription,
            sub_description: "Perimeter & Walls",
            quantity: parseFloat(document.getElementById('membrane-perimeter-quantity').value) || 0,
            unit: document.getElementById('membrane-perimeter-unit').textContent,
            base_price: parseFloat(document.getElementById('membrane-perimeter-base-price').value) || 0,
            discount_price: parseFloat(document.getElementById('membrane-perimeter-discount-price').value) || 0,
            total: parseFloat(document.getElementById('membrane-perimeter-total').value) || 0
        });
        
        // Curb Membrane Type
        projectData["Material Pricing"].push({
            description: membraneDescription,
            sub_description: "Curb Perimeter",
            quantity: parseFloat(document.getElementById('membrane-curb-quantity').value) || 0,
            unit: document.getElementById('membrane-curb-unit').textContent,
            base_price: parseFloat(document.getElementById('membrane-curb-base-price').value) || 0,
            discount_price: parseFloat(document.getElementById('membrane-curb-discount-price').value) || 0,
            total: parseFloat(document.getElementById('membrane-curb-total').value) || 0
        });
        
        // Protection Mat
        projectData["Material Pricing"].push({
            description: "Protection Mat",
            sub_description: "",
            quantity: parseFloat(document.getElementById('protection-mat-quantity').value) || 0,
            unit: document.getElementById('protection-mat-unit').textContent,
            base_price: parseFloat(document.getElementById('protection-mat-base-price').value) || 0,
            discount_price: parseFloat(document.getElementById('protection-mat-discount-price').value) || 0,
            total: parseFloat(document.getElementById('protection-mat-total').value) || 0
        });
        
        // Weathered Mem Cleaner - Field & Seams
        projectData["Material Pricing"].push({
            description: "Weathered Mem Cleaner",
            sub_description: "Field & Seams",
            quantity: parseFloat(document.getElementById('weathered-mem-cleaner-quantity').value) || 0,
            unit: document.getElementById('weathered-mem-cleaner-unit').textContent,
            base_price: parseFloat(document.getElementById('weathered-mem-cleaner-base-price').value) || 0,
            discount_price: parseFloat(document.getElementById('weathered-mem-cleaner-discount-price').value) || 0,
            total: parseFloat(document.getElementById('weathered-mem-cleaner-total').value) || 0
        });
        
        // Weathered Mem Cleaner - Perimeter & Walls
        projectData["Material Pricing"].push({
            description: "Weathered Mem Cleaner",
            sub_description: "Perimeter & Walls",
            quantity: parseFloat(document.getElementById('weathered-mem-cleaner-perimeter-quantity').value) || 0,
            unit: document.getElementById('weathered-mem-cleaner-perimeter-unit').textContent,
            base_price: parseFloat(document.getElementById('weathered-mem-cleaner-perimeter-base-price').value) || 0,
            discount_price: parseFloat(document.getElementById('weathered-mem-cleaner-perimeter-discount-price').value) || 0,
            total: parseFloat(document.getElementById('weathered-mem-cleaner-perimeter-total').value) || 0
        });
        
        // Weathered Mem Cleaner - Curb Perimeter
        projectData["Material Pricing"].push({
            description: "Weathered Mem Cleaner",
            sub_description: "Curb Perimeter",
            quantity: parseFloat(document.getElementById('weathered-mem-cleaner-curb-quantity').value) || 0,
            unit: document.getElementById('weathered-mem-cleaner-curb-unit').textContent,
            base_price: parseFloat(document.getElementById('weathered-mem-cleaner-curb-base-price').value) || 0,
            discount_price: parseFloat(document.getElementById('weathered-mem-cleaner-curb-discount-price').value) || 0,
            total: parseFloat(document.getElementById('weathered-mem-cleaner-curb-total').value) || 0
        });
        
        // Call the backend to save the project
        const result = await eel.save_project(projectName, projectData)();
        console.log("Project saved:", result);
        
        if (result && !result.error) {
            console.log("Project saved successfully");
            alert("Project saved successfully");
        } else {
            console.error("Error saving project:", result ? result.error : "No data returned");
            alert("Error saving project: " + (result ? result.error : "Unknown error"));
        }
    } catch (error) {
        console.error("Error saving project data:", error);
        alert("Error saving project: " + error.message);
    }
}

