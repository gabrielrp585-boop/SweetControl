import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from sales_logic import calculate_recipe_cost_and_usage, aggregate_ingredient_usage


def test_aggregate_ingredient_usage_merges_duplicate_items():
    usage = [
        {"ingredient_id": "egg", "ingredient_name": "Ovos", "qty": 5},
        {"ingredient_id": "egg", "ingredient_name": "Ovos", "qty": 5},
        {"ingredient_id": "flour", "ingredient_name": "Farinha", "qty": 200},
    ]

    assert aggregate_ingredient_usage(usage) == [
        {"ingredient_id": "egg", "ingredient_name": "Ovos", "qty": 10.0},
        {"ingredient_id": "flour", "ingredient_name": "Farinha", "qty": 200.0},
    ]


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


def test_recipe_usage_is_still_calculated_when_cost_is_manual():
    ingredients = [{"id": "egg", "name": "Ovos", "unit_price": 0.8}]
    recipes = [{
        "name": "Bolo",
        "yield_servings": 1,
        "ingredients": [{"ingredient_id": "egg", "ingredient_name": "Ovos", "qty": 10}],
    }]

    _, usage = calculate_recipe_cost_and_usage(recipes, ingredients, servings=2)
    stock_usage = aggregate_ingredient_usage([
        {"ingredient_id": item["ingredient_id"], "ingredient_name": item["ingredient_name"], "qty": item["qty"] * 2}
        for item in usage
    ])

    assert stock_usage == [{"ingredient_id": "egg", "ingredient_name": "Ovos", "qty": 40.0}]
