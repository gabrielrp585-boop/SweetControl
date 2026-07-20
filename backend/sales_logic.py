from typing import List, Dict, Tuple


def calculate_recipe_cost_and_usage(
    recipes: List[dict],
    ingredients: List[dict],
    servings: float = 1.0,
) -> Tuple[float, List[Dict[str, float]]]:
    """Calcula o custo total e o uso de ingredientes para uma receita escalada."""
    ingredient_lookup = {
        item.get("id"): item
        for item in ingredients or []
        if item.get("id")
    }

    total_cost = 0.0
    usage: List[Dict[str, float]] = []

    for recipe in recipes or []:
        yield_servings = float(recipe.get("yield_servings", 1) or 1)
        if yield_servings <= 0:
            yield_servings = 1

        scale = float(servings or 1) / yield_servings
        for item in recipe.get("ingredients", []) or []:
            qty = float(item.get("qty", 0) or 0) * scale
            if qty <= 0:
                continue

            ingredient = ingredient_lookup.get(item.get("ingredient_id")) or {}
            unit_price = float(ingredient.get("unit_price", 0) or 0)
            total_cost += unit_price * qty

            usage.append({
                "ingredient_id": item.get("ingredient_id"),
                "ingredient_name": item.get("ingredient_name", ""),
                "qty": round(qty, 4),
            })

    return round(total_cost, 2), usage
