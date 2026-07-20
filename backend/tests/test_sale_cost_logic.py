import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from sales_logic import calculate_recipe_cost_and_usage


def test_calculate_recipe_cost_and_usage_per_serving():
    ingredients = [
        {"id": "ing-1", "name": "Farinha", "unit_price": 0.01},
        {"id": "ing-2", "name": "Açúcar", "unit_price": 0.02},
    ]
    recipes = [
        {
            "name": "Chocolate",
            "yield_servings": 8,
            "ingredients": [
                {"ingredient_id": "ing-1", "ingredient_name": "Farinha", "qty": 200},
                {"ingredient_id": "ing-2", "ingredient_name": "Açúcar", "qty": 100},
            ],
        }
    ]

    cost, usage = calculate_recipe_cost_and_usage(recipes, ingredients, servings=1)

    assert cost == 0.5
    assert usage == [
        {"ingredient_id": "ing-1", "ingredient_name": "Farinha", "qty": 25.0},
        {"ingredient_id": "ing-2", "ingredient_name": "Açúcar", "qty": 12.5},
    ]
