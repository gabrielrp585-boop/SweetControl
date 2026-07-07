"""SweetControl backend integration tests.

Covers: auth (httpOnly cookies), customers, ingredients/stock, doughs,
prices, orders, sales, expenses, dashboard, settings, reports and the
new support module. Uses external REACT_APP_BACKEND_URL via cookies.
"""
import os
import io
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://bolo-management.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@sweetcontrol.com"
ADMIN_PASSWORD = "sweet123"


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------
@pytest.fixture(scope="session")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def auth_session(session):
    r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"Login failed: {r.status_code} {r.text}"
    # verify httpOnly cookies set
    assert "access_token" in session.cookies, "access_token cookie not set"
    assert "refresh_token" in session.cookies, "refresh_token cookie not set"
    return session


def _no_underscore_id(obj):
    """Recursively check that _id is not present."""
    if isinstance(obj, dict):
        assert "_id" not in obj, f"_id leaked in response: keys={list(obj.keys())}"
        for v in obj.values():
            _no_underscore_id(v)
    elif isinstance(obj, list):
        for v in obj:
            _no_underscore_id(v)


# ---------------------------------------------------------------------------
# Health & Auth
# ---------------------------------------------------------------------------
class TestHealthAndAuth:
    def test_root(self, session):
        r = session.get(f"{API}/")
        assert r.status_code == 200
        assert r.json().get("status") == "ok"

    def test_login_invalid(self, session):
        s = requests.Session()
        r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": "wrong"})
        assert r.status_code == 401

    def test_login_success_sets_cookies(self):
        s = requests.Session()
        r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert r.status_code == 200
        data = r.json()
        assert data["email"] == ADMIN_EMAIL
        assert "_id" not in data
        # cookies set
        assert "access_token" in s.cookies
        assert "refresh_token" in s.cookies
        # cookies are httpOnly (check via raw header)
        set_cookie = r.headers.get("set-cookie", "").lower()
        assert "httponly" in set_cookie

    def test_me_unauthenticated(self, session):
        s = requests.Session()
        r = s.get(f"{API}/auth/me")
        assert r.status_code == 401

    def test_me_authenticated(self, auth_session):
        r = auth_session.get(f"{API}/auth/me")
        assert r.status_code == 200
        data = r.json()
        assert data["email"] == ADMIN_EMAIL
        assert "_id" not in data
        assert "password_hash" not in data

    def test_register_and_logout(self):
        s = requests.Session()
        email = f"test_{uuid.uuid4().hex[:8]}@example.com"
        r = s.post(f"{API}/auth/register", json={"email": email, "password": "secret123", "name": "Test User"})
        assert r.status_code == 200, r.text
        assert r.json()["email"] == email
        assert "access_token" in s.cookies
        # duplicate
        r2 = s.post(f"{API}/auth/register", json={"email": email, "password": "secret123", "name": "Dup"})
        assert r2.status_code == 400
        # logout clears cookies
        r3 = s.post(f"{API}/auth/logout")
        assert r3.status_code == 200
        r4 = s.get(f"{API}/auth/me")
        assert r4.status_code == 401


# ---------------------------------------------------------------------------
# Customers CRUD
# ---------------------------------------------------------------------------
class TestCustomers:
    def test_crud(self, auth_session):
        # Create
        payload = {"name": "TEST_Cliente", "phone": "11999990000", "address": "Rua A", "notes": "n"}
        r = auth_session.post(f"{API}/customers", json=payload)
        assert r.status_code == 200, r.text
        c = r.json()
        _no_underscore_id(c)
        cid = c["id"]
        assert c["name"] == "TEST_Cliente"

        # List
        r = auth_session.get(f"{API}/customers")
        assert r.status_code == 200
        items = r.json()
        _no_underscore_id(items)
        assert any(x["id"] == cid for x in items)

        # Update
        r = auth_session.put(f"{API}/customers/{cid}", json={**payload, "phone": "111"})
        assert r.status_code == 200
        assert r.json()["phone"] == "111"

        # Delete
        r = auth_session.delete(f"{API}/customers/{cid}")
        assert r.status_code == 200


# ---------------------------------------------------------------------------
# Ingredients / Stock Movements
# ---------------------------------------------------------------------------
class TestIngredients:
    def test_crud_and_movement(self, auth_session):
        payload = {"name": "TEST_Ing", "unit": "g", "unit_price": 0.1, "stock_qty": 100, "min_stock": 10}
        r = auth_session.post(f"{API}/ingredients", json=payload)
        assert r.status_code == 200, r.text
        ing = r.json(); _no_underscore_id(ing)
        iid = ing["id"]

        # List
        r = auth_session.get(f"{API}/ingredients")
        assert r.status_code == 200
        assert any(i["id"] == iid for i in r.json())

        # Movement +50
        r = auth_session.post(f"{API}/ingredients/movement",
                              json={"ingredient_id": iid, "delta": 50, "reason": "compra"})
        assert r.status_code == 200
        assert r.json()["stock_qty"] == 150

        # Movement -20
        r = auth_session.post(f"{API}/ingredients/movement",
                              json={"ingredient_id": iid, "delta": -20, "reason": "uso"})
        assert r.json()["stock_qty"] == 130

        # Stock movements list
        r = auth_session.get(f"{API}/stock-movements")
        assert r.status_code == 200
        movs = r.json(); _no_underscore_id(movs)
        assert len(movs) >= 2

        # Update
        r = auth_session.put(f"{API}/ingredients/{iid}",
                             json={**payload, "unit_price": 0.5})
        assert r.status_code == 200
        assert r.json()["unit_price"] == 0.5

        # Delete
        r = auth_session.delete(f"{API}/ingredients/{iid}")
        assert r.status_code == 200


# ---------------------------------------------------------------------------
# Doughs (with cost computation)
# ---------------------------------------------------------------------------
class TestDoughs:
    def test_total_cost_calculated(self, auth_session):
        # create 2 ingredients
        ing1 = auth_session.post(f"{API}/ingredients",
                                 json={"name": "TEST_D_Farinha", "unit": "g", "unit_price": 0.01,
                                       "stock_qty": 1000, "min_stock": 0}).json()
        ing2 = auth_session.post(f"{API}/ingredients",
                                 json={"name": "TEST_D_Acucar", "unit": "g", "unit_price": 0.02,
                                       "stock_qty": 1000, "min_stock": 0}).json()
        # dough: 200g farinha (2.0) + 100g acucar (2.0) = 4.0
        payload = {
            "name": "TEST_Massa",
            "category": "massa",
            "ring_size": 20,
            "yield_servings": 8,
            "ingredients": [
                {"ingredient_id": ing1["id"], "ingredient_name": ing1["name"], "qty": 200, "unit": "g"},
                {"ingredient_id": ing2["id"], "ingredient_name": ing2["name"], "qty": 100, "unit": "g"},
            ],
            "notes": "",
        }
        r = auth_session.post(f"{API}/doughs", json=payload)
        assert r.status_code == 200, r.text
        d = r.json(); _no_underscore_id(d)
        assert d["total_cost"] == 4.0, f"expected 4.0 got {d['total_cost']}"
        did = d["id"]

        # update
        payload["ingredients"][0]["qty"] = 100
        # cost: 100*0.01 + 100*0.02 = 3.0
        r = auth_session.put(f"{API}/doughs/{did}", json=payload)
        assert r.status_code == 200
        assert r.json()["total_cost"] == 3.0

        # delete
        auth_session.delete(f"{API}/doughs/{did}")
        auth_session.delete(f"{API}/ingredients/{ing1['id']}")
        auth_session.delete(f"{API}/ingredients/{ing2['id']}")


# ---------------------------------------------------------------------------
# Prices (auto-calc)
# ---------------------------------------------------------------------------
class TestPrices:
    def test_auto_price_calculation(self, auth_session):
        # price=0 should auto-compute = cost*(1+margin/100) = 50*(1+100/100)=100
        payload = {"ring_size": 20, "category": "comum", "cost": 50, "margin_percent": 100,
                   "price": 0, "notes": "TEST_p"}
        r = auth_session.post(f"{API}/prices", json=payload)
        assert r.status_code == 200, r.text
        p = r.json(); _no_underscore_id(p)
        assert p["price"] == 100.0
        pid = p["id"]

        # update with explicit price
        r = auth_session.put(f"{API}/prices/{pid}",
                             json={**payload, "price": 150})
        assert r.json()["price"] == 150.0

        auth_session.delete(f"{API}/prices/{pid}")


# ---------------------------------------------------------------------------
# Orders
# ---------------------------------------------------------------------------
class TestOrders:
    def test_crud_and_filters(self, auth_session):
        payload = {"customer_name": "TEST_Order_Client", "phone": "9", "address": "X",
                   "delivery_date": "2026-02-15", "ring_size": 20, "dough": "Chocolate",
                   "fillings": ["Brigadeiro"], "observations": "", "total": 120.0,
                   "status": "pendente"}
        r = auth_session.post(f"{API}/orders", json=payload)
        assert r.status_code == 200, r.text
        o = r.json(); _no_underscore_id(o)
        oid = o["id"]

        # filter by status
        r = auth_session.get(f"{API}/orders", params={"status": "pendente"})
        assert r.status_code == 200
        assert any(x["id"] == oid for x in r.json())

        # search
        r = auth_session.get(f"{API}/orders", params={"q": "TEST_Order"})
        assert any(x["id"] == oid for x in r.json())

        # update status
        r = auth_session.put(f"{API}/orders/{oid}", json={**payload, "status": "finalizado"})
        assert r.status_code == 200
        assert r.json()["status"] == "finalizado"

        # delete
        auth_session.delete(f"{API}/orders/{oid}")
        # cleanup auto-created customer
        for c in auth_session.get(f"{API}/customers").json():
            if c["name"] == "TEST_Order_Client":
                auth_session.delete(f"{API}/customers/{c['id']}")

    def test_finalized_order_creates_sale_once(self, auth_session):
        payload = {"customer_name": "TEST_Order_Sale", "phone": "9", "address": "X",
                   "delivery_date": "2026-02-16", "ring_size": 24, "dough": "Baunilha",
                   "fillings": ["Doce de leite"], "observations": "", "total": 85.0,
                   "status": "pendente"}
        r = auth_session.post(f"{API}/orders", json=payload)
        assert r.status_code == 200, r.text
        oid = r.json()["id"]

        r = auth_session.put(f"{API}/orders/{oid}", json={**payload, "status": "finalizado"})
        assert r.status_code == 200

        sales = auth_session.get(f"{API}/sales").json()
        matching_sales = [s for s in sales if s.get("customer_name") == "TEST_Order_Sale"]
        assert len(matching_sales) == 1
        assert matching_sales[0]["description"] == "Encomenda TEST_Order_Sale"
        assert matching_sales[0]["unit_price"] == 85.0
        assert matching_sales[0]["ring_size"] == 24

        r = auth_session.put(f"{API}/orders/{oid}", json={**payload, "status": "entregue"})
        assert r.status_code == 200

        sales_after = auth_session.get(f"{API}/sales").json()
        matching_sales_after = [s for s in sales_after if s.get("customer_name") == "TEST_Order_Sale"]
        assert len(matching_sales_after) == 1

        auth_session.delete(f"{API}/orders/{oid}")
        for c in auth_session.get(f"{API}/customers").json():
            if c["name"] == "TEST_Order_Sale":
                auth_session.delete(f"{API}/customers/{c['id']}")


# ---------------------------------------------------------------------------
# Sales
# ---------------------------------------------------------------------------
class TestSales:
    def test_profit_calculation(self, auth_session):
        payload = {"description": "TEST_Sale", "ring_size": 20, "qty": 2,
                   "unit_price": 100.0, "cost": 30.0, "customer_name": "X",
                   "sale_date": "2026-01-15"}
        r = auth_session.post(f"{API}/sales", json=payload)
        assert r.status_code == 200, r.text
        s = r.json(); _no_underscore_id(s)
        # total = 100*2 = 200, profit = 200 - 30*2 = 140
        assert s["total"] == 200.0
        assert s["profit"] == 140.0
        sid = s["id"]

        r = auth_session.get(f"{API}/sales")
        _no_underscore_id(r.json())

        auth_session.delete(f"{API}/sales/{sid}")


# ---------------------------------------------------------------------------
# Expenses
# ---------------------------------------------------------------------------
class TestExpenses:
    def test_crud(self, auth_session):
        r = auth_session.post(f"{API}/expenses",
                              json={"description": "TEST_Gas", "category": "luz",
                                    "amount": 99.9, "expense_date": "2026-01-10"})
        assert r.status_code == 200
        e = r.json(); _no_underscore_id(e)
        eid = e["id"]
        r = auth_session.get(f"{API}/expenses")
        assert any(x["id"] == eid for x in r.json())
        auth_session.delete(f"{API}/expenses/{eid}")


# ---------------------------------------------------------------------------
# Dashboard
# ---------------------------------------------------------------------------
class TestDashboard:
    def test_dashboard_shape(self, auth_session):
        r = auth_session.get(f"{API}/dashboard")
        assert r.status_code == 200, r.text
        d = r.json(); _no_underscore_id(d)
        for k in ["total_day", "total_month", "profit_month", "expenses_month",
                  "pending_orders", "total_orders", "top_products",
                  "sales_chart", "expenses_chart", "profit_chart", "low_stock"]:
            assert k in d, f"missing key {k}"
        assert len(d["sales_chart"]) == 7
        assert len(d["expenses_chart"]) == 7
        assert len(d["profit_chart"]) == 7


# ---------------------------------------------------------------------------
# Settings
# ---------------------------------------------------------------------------
class TestSettings:
    def test_get_update(self, auth_session):
        r = auth_session.get(f"{API}/settings")
        assert r.status_code == 200
        _no_underscore_id(r.json())
        upd = {"business_name": "TEST_Sweet", "owner_name": "Ana", "address": "",
               "phone": "", "logo_url": "", "default_margin": 120.0, "instagram": ""}
        r = auth_session.put(f"{API}/settings", json=upd)
        assert r.status_code == 200
        assert r.json()["business_name"] == "TEST_Sweet"
        # restore
        auth_session.put(f"{API}/settings",
                         json={"business_name": "SweetControl", "owner_name": "",
                               "address": "", "phone": "", "logo_url": "",
                               "default_margin": 100.0, "instagram": ""})


# ---------------------------------------------------------------------------
# Reports
# ---------------------------------------------------------------------------
class TestReports:
    @pytest.mark.parametrize("kind,fmt,ctype", [
        ("sales", "pdf", "application/pdf"),
        ("sales", "xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"),
        ("expenses", "pdf", "application/pdf"),
        ("expenses", "xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"),
        ("orders", "pdf", "application/pdf"),
        ("orders", "xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"),
    ])
    def test_report_endpoint(self, auth_session, kind, fmt, ctype):
        r = auth_session.get(f"{API}/reports/{kind}/{fmt}")
        assert r.status_code == 200, f"{kind}/{fmt} failed: {r.text[:200]}"
        assert ctype in r.headers.get("content-type", "")
        cd = r.headers.get("content-disposition", "")
        assert "attachment" in cd and fmt in cd
        assert len(r.content) > 100


# ---------------------------------------------------------------------------
# Support (new)
# ---------------------------------------------------------------------------
class TestSupport:
    def test_full_flow(self, auth_session):
        r = auth_session.post(f"{API}/support",
                              json={"subject": "TEST_Bug", "message": "algo quebrou",
                                    "category": "bug", "priority": "alta"})
        assert r.status_code == 200, r.text
        t = r.json(); _no_underscore_id(t)
        assert t["status"] == "aberto"
        assert t["author_email"] == ADMIN_EMAIL
        tid = t["id"]

        # list
        r = auth_session.get(f"{API}/support")
        assert r.status_code == 200
        assert any(x["id"] == tid for x in r.json())

        # reply
        r = auth_session.post(f"{API}/support/{tid}/reply",
                              json={"message": "vou olhar agora"})
        assert r.status_code == 200, r.text
        body = r.json(); _no_underscore_id(body)
        assert len(body["replies"]) == 1
        assert body["status"] == "em_andamento"

        # status change
        r = auth_session.put(f"{API}/support/{tid}/status", json={"status": "resolvido"})
        assert r.status_code == 200
        assert r.json()["status"] == "resolvido"

        # delete
        r = auth_session.delete(f"{API}/support/{tid}")
        assert r.status_code == 200
