import re
import unicodedata
from typing import List, Dict, Tuple


def _normalize_recipe_name(name: str) -> str:
    normalized = unicodedata.normalize("NFKD", name or "")
    normalized = "".join(char for char in normalized if not unicodedata.combining(char))
    tokens = re.findall(r"[a-z0-9]+", normalized.casefold())
    aliases = {"brig": "brigadeiro", "c": "com"}
    normalized_tokens = []
    for token in tokens:
        if token == "4leites":
            normalized_tokens.extend(["4", "leite"])
            continue
        if token.endswith("s") and len(token) > 4:
            token = token[:-1]
        normalized_tokens.append(aliases.get(token, token))
    return " ".join(normalized_tokens)


def match_recipes_by_name(names: List[str], recipes: List[dict]) -> List[dict]:
    recipes_by_name: Dict[str, List[dict]] = {}
    for recipe in recipes or []:
        name = _normalize_recipe_name(recipe.get("name", ""))
        if name:
            recipes_by_name.setdefault(name, []).append(recipe)

    matches = []
    for name in names or []:
        normalized_name = _normalize_recipe_name(name)
        candidates = recipes_by_name.get(normalized_name, [])
        if not candidates and normalized_name:
            requested_tokens = set(normalized_name.split())
            candidates = [
                recipe
                for recipe in recipes or []
                if requested_tokens.issubset(
                    set(_normalize_recipe_name(recipe.get("name", "")).split())
                )
            ]
        if len(candidates) == 1:
            matches.append(candidates[0])
    return matches


def match_saved_cake(order: dict, cakes: List[dict]) -> dict | None:
    fillings = order.get("fillings", []) or []
    if isinstance(fillings, str):
        fillings = [name.strip() for name in fillings.split(",") if name.strip()]
    requested_fillings = sorted(_normalize_recipe_name(name) for name in fillings)
    requested_dough = set(_normalize_recipe_name(order.get("dough", "")).split())

    matches = []
    for cake in cakes or []:
        if int(cake.get("ring_size", 0) or 0) != int(order.get("ring_size", 0) or 0):
            continue

        cake_dough = set(_normalize_recipe_name(cake.get("dough_name", "")).split())
        if requested_dough and not requested_dough.issubset(cake_dough):
            continue

        cake_fillings = cake.get("filling_names", []) or []
        if sorted(_normalize_recipe_name(name) for name in cake_fillings) != requested_fillings:
            continue
        matches.append(cake)

    return matches[0] if len(matches) == 1 else None


def linked_sale_cost_fields(order_cost: float, sale: dict) -> Dict[str, float]:
    quantity = max(int(sale.get("qty", 1) or 1), 1)
    unit_cost = round(float(order_cost) / quantity, 2)
    total = float(sale.get("total", 0) or 0)
    if not total:
        total = float(sale.get("unit_price", 0) or 0) * quantity
    return {
        "cost": unit_cost,
        "total": round(total, 2),
        "profit": round(total - unit_cost * quantity, 2),
    }


def aggregate_ingredient_usage(items: List[dict]) -> List[Dict[str, float]]:
    """Agrupa uso de ingredientes para evitar contagem duplicada de itens iguais."""
    merged: Dict[str, Dict[str, float | str]] = {}
    for item in items or []:
        ingredient_id = item.get("ingredient_id")
        if not ingredient_id:
            continue

        qty = float(item.get("qty", 0) or 0)
        if qty <= 0:
            continue

        if ingredient_id not in merged:
            merged[ingredient_id] = {
                "ingredient_id": ingredient_id,
                "ingredient_name": item.get("ingredient_name", ""),
                "qty": 0.0,
            }

        merged[ingredient_id]["qty"] = float(merged[ingredient_id]["qty"]) + qty
        name = item.get("ingredient_name")
        if name:
            merged[ingredient_id]["ingredient_name"] = name

    return [
        {
            "ingredient_id": entry["ingredient_id"],
            "ingredient_name": entry["ingredient_name"],
            "qty": round(float(entry["qty"]), 4),
        }
        for entry in merged.values()
    ]


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
        for cost_item in recipe.get("cost_items", []) or []:
            total_cost += float(cost_item.get("amount", 0) or 0) * scale

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

    return round(total_cost, 2), aggregate_ingredient_usage(usage)
