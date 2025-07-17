// Global variables
let projectData = null;

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

// Function to print
function printFinalTotal() {
    window.print();
}

// Function to save project
function saveProject() {
    try {
        // Call the saveProjectData function from project-io.js
        saveProjectData();
    } catch (error) {
        console.error("Error calling saveProjectData:", error);
    }
}

// Function to load and display project data
async function loadProjectData() {
    try {
        // Get the current project name
        const projectName = checkProjectName();
        console.log("Loading project for final total:", projectName);
        
        if (!projectName) {
            console.log("No project selected to load");
            document.getElementById('project-name').textContent = "No Project Selected";
            return;
        }
        
        // Update project name in the UI
        document.getElementById('project-name').textContent = projectName;
        
        // Call the backend to load the project
        console.log("Calling project loading function with:", projectName);
        
        // Try different loading functions
        let result;
        if (typeof eel.load_project_file === 'function') {
            result = await eel.load_project_file(projectName)();
            console.log("Used load_project_file function");
        } else if (typeof eel.load_project_data === 'function') {
            result = await eel.load_project_data(projectName)();
            console.log("Used load_project_data function");
        } else if (typeof eel.load_project === 'function') {
            result = await eel.load_project(projectName)();
            console.log("Used load_project function");
        } else {
            console.error("No project loading function available");
            alert("Error: Project loading functionality is not available");
            return;
        }
        
        console.log("Project data received:", result);
        
        if (result && result.success && result.data) {
            // Handle the new format with success and data properties
            projectData = result.data;
        } else if (result && !result.error) {
            // Handle the old format where result is the data directly
            projectData = result;
        } else {
            console.error("Error loading project:", result ? result.error : "No data returned");
            alert("Error loading project: " + (result ? result.error : "Unknown error"));
            return;
        }
        
        // Display the data
        displayFinalTotal(projectData);
        displayMaterialBreakdown(projectData);
    } catch (error) {
        console.error("Error loading project data:", error);
        alert("Error loading project: " + error.message);
    }
}

// Function to calculate and display final total
async function calculateFinalTotal() {
    try {
        if (!projectData) {
            console.error("No project data available");
            alert("Please load a project first");
            return;
        }
        
        console.log("Sending project data to calculate final total:", JSON.stringify(projectData));
        
        // Call the backend to calculate final total
        const result = await eel.process_final_total(projectData)();
        console.log("Final total calculation result:", JSON.stringify(result));
        
        if (result && result.data) {
            // Update the project data with the new final total
            projectData["Final Total"] = {
                "Grand Total": result.grand_total,
                "Details": result.data
            };
            
            // Display the updated data
            displayFinalTotal(projectData);
            displayMaterialBreakdown(projectData);
            
            // Save the updated project data
            await eel.save_project(checkProjectName(), projectData)();
            
            console.log("Final total calculated and saved successfully");
        } else {
            console.error("Error calculating final total:", result ? result.error : "No data returned");
            alert("Error calculating final total: " + (result ? result.error : "Unknown error"));
        }
    } catch (error) {
        console.error("Error calculating final total:", error);
        alert("Error calculating final total: " + error.message);
    }
}

// Function to display final total
function displayFinalTotal(data) {
    if (!data || !data["Final Total"]) {
        console.log("No final total data available");
        document.getElementById('grand-total').textContent = "0.00";
        document.getElementById('final-total-body').innerHTML = "<tr><td colspan='4'>No data available</td></tr>";
        return;
    }
    
    // Display grand total
    const grandTotal = data["Final Total"]["Grand Total"] || 0;
    document.getElementById('grand-total').textContent = grandTotal.toFixed(2);
    
    // Display details
    const details = data["Final Total"]["Details"] || [];
    const tbody = document.getElementById('final-total-body');
    tbody.innerHTML = "";
    
    if (details.length === 0) {
        tbody.innerHTML = "<tr><td colspan='4'>No details available</td></tr>";
        return;
    }
    
    details.forEach(item => {
        const row = document.createElement('tr');
        
        const descCell = document.createElement('td');
        descCell.textContent = item.description;
        row.appendChild(descCell);
        
        const quantityCell = document.createElement('td');
        quantityCell.textContent = item.total_quantity.toFixed(2);
        row.appendChild(quantityCell);
        
        const priceCell = document.createElement('td');
        priceCell.textContent = "$" + item.manual_price.toFixed(2);
        row.appendChild(priceCell);
        
        const totalCell = document.createElement('td');
        totalCell.textContent = "$" + item.total_price.toFixed(2);
        row.appendChild(totalCell);
        
        tbody.appendChild(row);
    });
}

// Function to display material breakdown
function displayMaterialBreakdown(data) {
    if (!data || !data["Material Pricing"]) {
        console.log("No material pricing data available");
        document.getElementById('material-breakdown-body').innerHTML = "<tr><td colspan='7'>No data available</td></tr>";
        return;
    }
    
    const materials = data["Material Pricing"];
    const tbody = document.getElementById('material-breakdown-body');
    tbody.innerHTML = "";
    
    if (materials.length === 0) {
        tbody.innerHTML = "<tr><td colspan='7'>No materials available</td></tr>";
        return;
    }
    
    console.log("Displaying material breakdown:", materials);
    
    materials.forEach((item, index) => {
        // Skip items with zero quantity or zero total
        if (parseFloat(item.quantity) === 0 && parseFloat(item.total) === 0) {
            return;
        }
        
        // For debugging
        console.log(`Material ${index}:`, item);
        
        const row = document.createElement('tr');
        
        const descCell = document.createElement('td');
        descCell.textContent = item.description || '';
        row.appendChild(descCell);
        
        const subDescCell = document.createElement('td');
        subDescCell.textContent = item.sub_description || '';
        row.appendChild(subDescCell);
        
        const quantityCell = document.createElement('td');
        quantityCell.textContent = parseFloat(item.quantity).toFixed(2);
        row.appendChild(quantityCell);
        
        const unitCell = document.createElement('td');
        unitCell.textContent = item.unit || '';
        row.appendChild(unitCell);
        
        const basePriceCell = document.createElement('td');
        basePriceCell.textContent = "$" + parseFloat(item.base_price).toFixed(2);
        row.appendChild(basePriceCell);
        
        const discountPriceCell = document.createElement('td');
        discountPriceCell.textContent = "$" + parseFloat(item.discount_price).toFixed(2);
        row.appendChild(discountPriceCell);
        
        const totalCell = document.createElement('td');
        // Calculate total if it's not already set or is zero
        let total = parseFloat(item.total);
        if (isNaN(total) || total === 0) {
            total = parseFloat(item.quantity) * parseFloat(item.discount_price);
            console.log(`Recalculated total for ${item.description}: ${total}`);
        }
        totalCell.textContent = "$" + total.toFixed(2);
        row.appendChild(totalCell);
        
        tbody.appendChild(row);
    });
}

// Function to format currency
function formatCurrency(value) {
    return "$" + parseFloat(value).toFixed(2);
}

// Initialize everything when the window loads
window.onload = async function() {
    console.log("Window loaded - Final Total page");
    
    try {
        // Wait for Eel to be ready
        waitForEel(async function() {
            console.log("Eel is ready, loading project data");
            
            // Load project data
            await loadProjectData();
            
            // Force recalculation of final total
            console.log("Forcing recalculation of final total");
            await calculateFinalTotal();
        });
    } catch (error) {
        console.error("Error during initialization:", error);
    }
};
