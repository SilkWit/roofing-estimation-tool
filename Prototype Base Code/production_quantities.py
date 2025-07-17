
class ProductionQuantity:
    def __init__(self, description, sub_description, is_manual=False, extra_input="", value=0, unit="", formula=None, is_editable=False, unit_dropdown=False):
        self.description = description  # Main description of the quantity
        self.sub_description = sub_description
        self.is_manual = is_manual  # Determines if this requires user input
        self.extra_input = extra_input  # Optional extra input
        self.value = value  # Calculated or user-input value
        self.unit = unit  # Measurement unit
        self.formula = formula  # Row-specific formula that is optional
        self.is_editable = is_editable
        self.unit_dropdown = unit_dropdown


    def set_value(self, input_store, previous_value=None, available_units=None):
        """
        Sets the value of the quantity using stored input or formula evaluation.
        Removes user input prompts and ensures values are only set programmatically.
        """

        if f"{self.description}{self.sub_description}" in input_store:
            self.value = input_store[f"{self.description}{self.sub_description}"]
            return

        key = f"{self.description}{self.sub_description}"
        
        # If value already exists in input_store, use it
        if key in input_store:
            self.value = input_store[key]
            return

        # Handle unit assignment if applicable (UI should provide the selected unit)
        if self.unit_dropdown and available_units:
            self.unit = input_store.get(f"{key} - Unit", self.unit)  # Get from input_store if available

        # Editable descriptions (handled by UI, so no user input here)
        if self.is_editable:
            self.description = input_store.get(f"{key} - Description", self.description)

        # Handle extra input if required
        if self.extra_input:
            self.value = input_store.get(self.extra_input, 0)

        # Evaluate formula if applicable
        if self.formula:
            try:
                if any(input_store.get(key, 0) == 0 for key in ["Sheet Width (FT)", "Wall Height (LF)", "Fasteners / Board (EA)"]):
                    raise ValueError(f"Missing or zero value for required inputs in formula: {self.description} {self.sub_description}")

                self.value = round(eval(self.formula, {}, {"input_store": input_store, "previous_value": previous_value}), 2)

            except ValueError as e:
                # Silently set the value without printing
                self.value = 0
            except Exception as e:
                print(f"Error evaluating formula for {self.description} {self.sub_description}: {e}")
                self.value = 0

        # If manual entry, default to 0 (Frontend should handle user input)
        elif self.is_manual:
            self.value = input_store.get(key, 0)

        # Save the value to input_store
        input_store[key] = self.value