from materials_query import fetch_materials_by_category

class MaterialPricing:
    def __init__(self, description="", sub_description="", quantity=0, base_price=0, discount_price=0, distributor_discount=0, direct_discount=0, total=0, unit=""):
        self.description = description
        self.sub_description = sub_description
        self.quantity = float(quantity)
        self.base_price = float(base_price)
        self.discount_price = float(discount_price)
        self.total = float(total)
        self.distributor_discount = float(distributor_discount)
        self.direct_discount = float(direct_discount)
        self.unit = unit

    def evaluate_formula(self, formula, input_store, local_vars):
        try:
            return eval(formula, {}, {**input_store, **local_vars})
        except KeyError:
            return 0  # Default to 0 instead of breaking
        except Exception:
            return 0  # Default to 0 for other errors

    def calculate_discount_price(self):
        if self.base_price is None:
            self.base_price = 0  # Default to 0 if missing
        if self.discount_price == 0:  # Only calculate if not manually defined
            total_discount = (self.direct_discount or 0) + (self.distributor_discount or 0)
            self.discount_price = self.base_price * (1 - total_discount)

    def calculate_total(self):
        self.total = self.quantity * self.discount_price

    def evaluate_and_set(self, formula, input_store, local_vars, attribute):
        try:
            evaluation_context = {**input_store, **local_vars, "input_store": input_store}
            value = eval(formula, {}, evaluation_context)
            setattr(self, attribute, value if value is not None else 0)  # Ensure no None values
        except KeyError:
            setattr(self, attribute, 0)  # Default to 0 if key is missing
        except Exception:
            setattr(self, attribute, 0)  # Default to 0 for any error

    def display(self):
        return {
            "description": self.description,
            "sub_description": self.sub_description,
            "quantity": self.quantity,
            "base_price": self.base_price,
            "discount_price": self.discount_price,
            "total": self.total
        }
