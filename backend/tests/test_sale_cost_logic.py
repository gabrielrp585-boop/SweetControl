import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from sales_logic import (
    aggregate_ingredient_usage,
    calculate_recipe_cost_and_usage,
    linked_sale_cost_fields,
    match_saved_cake,
    match_recipes_by_name,
)


def test_match_recipes_by_name_handles_accents_abbreviations_and_repeated_fillings():
    recipes = [
        {"id": "massa", "name": "Massa Branca"},
        {"id": "filling", "name": "Brigadeiro Tradicional"},
        {"id": "fruit", "name": "Brigadeiro de Morangos"},
        {"id": "passionfruit", "name": "Brigadeiro de Maracujá"},
        {"id": "milk", "name": "4 Leites"},
    ]

    matches = match_recipes_by_name(
        [
            "Massa Branca",
            "Brig. Tradicional",
            "Brig. Tradicional",
            "Brig. de Morango",
            "Brig. de Maracuja",
            "4leites",
        ],
        recipes,
    )

    assert [recipe["id"] for recipe in matches] == [
        "massa", "filling", "filling", "fruit", "passionfruit", "milk",
    ]


def test_match_recipes_by_name_skips_ambiguous_names():
    recipes = [
        {"id": "one", "name": "Brigadeiro"},
        {"id": "two", "name": "Brigadeiro"},
    ]

    assert match_recipes_by_name(["Brigadeiro"], recipes) == []


def test_match_saved_cake_uses_unique_saved_composition_when_order_has_no_cake_id():
    cakes = [
        {
            "id": "saved-cake",
            "ring_size": 15,
            "dough_name": "Massa Branca",
            "filling_names": ["Brigadeiro Branco", "Cocada"],
            "total_cost": 25,
        },
        {
            "id": "wrong-ring",
            "ring_size": 20,
            "dough_name": "Massa Branca",
            "filling_names": ["Brigadeiro Branco", "Cocada"],
            "total_cost": 30,
        },
    ]

    match = match_saved_cake(
        {
            "ring_size": 15,
            "dough": "Branca",
            "fillings": ["Brig Branco", "Cocada"],
        },
        cakes,
    )

    assert match["id"] == "saved-cake"


def test_match_saved_cake_does_not_guess_between_duplicate_compositions():
    cake = {
        "ring_size": 15,
        "dough_name": "Massa Branca",
        "filling_names": ["Cocada"],
    }

    assert match_saved_cake(
        {"ring_size": 15, "dough": "Branca", "fillings": ["Cocada"]},
        [{**cake, "id": "first"}, {**cake, "id": "second"}],
    ) is None


def test_linked_sale_uses_order_cost_to_recalculate_profit():
    fields = linked_sale_cost_fields(
        30,
        {"qty": 2, "unit_price": 50, "total": 100, "cost": 0, "profit": 100},
    )

    assert fields == {"cost": 15.0, "total": 100.0, "profit": 70.0}


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


def test_calculate_recipe_cost_includes_scaled_cost_items():
    ingredients = [{"id": "ing-1", "name": "Farinha", "unit_price": 0.01}]
    recipes = [
        {
            "name": "Massa com Gás",
            "yield_servings": 4,
            "ingredients": [
                {"ingredient_id": "ing-1", "ingredient_name": "Farinha", "qty": 200},
            ],
            "cost_items": [
                {"description": "Gás", "amount": 2.0},
            ],
        }
    ]

    # 2 servings out of 4 (scale = 0.5): ingredients = 200 * 0.5 * 0.01 = 1.0; cost_items = 2.0 * 0.5 = 1.0 -> total = 2.0
    cost, usage = calculate_recipe_cost_and_usage(recipes, ingredients, servings=2)
    assert cost == 2.0
    assert usage == [{"ingredient_id": "ing-1", "ingredient_name": "Farinha", "qty": 100.0}]
