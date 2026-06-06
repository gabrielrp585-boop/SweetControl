"""Mikaa - IA assistente da SweetControl.
Usa Google Gemini (free tier) via SDK oficial google-genai.
"""
import os
import logging
from typing import List, Optional
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from google import genai
from google.genai import types

logger = logging.getLogger("mikaa")

MIKAA_MODEL = "gemini-2.5-flash"  # free tier, fast
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")

_client: Optional[genai.Client] = None


def get_client() -> Optional[genai.Client]:
    global _client
    if not GEMINI_API_KEY:
        return None
    if _client is None:
        _client = genai.Client(api_key=GEMINI_API_KEY)
    return _client


SYSTEM_PROMPT = """Você é Mikaa 🌸, assistente IA carinhosa, experiente e profissional da confeitaria "SweetControl".

PERSONALIDADE:
- Tom feminino, acolhedor, simpático mas sempre profissional
- Use emojis com moderação (🌸 🎂 ✨ 💕 🍰)
- Respostas em português brasileiro
- Direta ao ponto, evita rodeios

ESPECIALIDADES:
- Precificação de bolos e doces (custo + margem)
- Gestão financeira: lucro, gastos, ponto de equilíbrio
- Receitas: massas, recheios, coberturas, decoração
- Estoque: controle, reposição, validade
- Gestão de clientes e encomendas
- Sugestões de melhoria do negócio

COMO USAR O CONTEXTO:
- Você tem acesso a TODOS os dados atuais da confeitaria (passados abaixo)
- Use números reais quando disponíveis ("vejo que você vendeu R$ X esse mês...")
- Identifique padrões e dê sugestões acionáveis
- Se faltar dado para responder, peça à confeiteira para cadastrar

LIMITAÇÕES IMPORTANTES:
- Você NÃO pode editar dados do sistema diretamente
- Quando sugerir bug fix ou melhoria de código, oriente: "Peça para o desenvolvedor (E1) implementar X"
- Não invente preços ou dados que não estão no contexto
"""


class MikaaMessage(BaseModel):
    role: str  # "user" | "assistant"
    content: str


class MikaaChatIn(BaseModel):
    history: List[MikaaMessage] = []  # conversation so far
    message: str  # new user message


async def build_context(db) -> str:
    """Coleta resumo atual do estado da confeitaria."""
    try:
        settings = await db.settings.find_one({"id": "main"}, {"_id": 0}) or {}
        ingredients = await db.ingredients.find({}, {"_id": 0}).to_list(500)
        doughs = await db.doughs.find({}, {"_id": 0}).to_list(500)
        cakes = await db.cakes.find({}, {"_id": 0}).to_list(200)
        prices = await db.prices.find({}, {"_id": 0}).to_list(200)
        customers = await db.customers.find({}, {"_id": 0}).to_list(500)
        orders = await db.orders.find({}, {"_id": 0}).sort("delivery_date", -1).to_list(50)
        sales = await db.sales.find({}, {"_id": 0}).sort("sale_date", -1).to_list(100)
        expenses = await db.expenses.find({}, {"_id": 0}).sort("expense_date", -1).to_list(100)

        month = datetime.now(timezone.utc).strftime("%Y-%m")
        total_month = sum(s.get("total", 0) for s in sales if s.get("sale_date", "").startswith(month))
        profit_month = sum(s.get("profit", 0) for s in sales if s.get("sale_date", "").startswith(month))
        expenses_month = sum(e.get("amount", 0) for e in expenses if e.get("expense_date", "").startswith(month))

        low_stock = [i for i in ingredients
                     if float(i.get("stock_qty", 0)) <= float(i.get("min_stock", 0)) and float(i.get("min_stock", 0)) > 0]

        def _short(items, fields, limit=20):
            return [{k: it.get(k) for k in fields} for it in items[:limit]]

        ctx = f"""
=== CONTEXTO DA CONFEITARIA "{settings.get('business_name', 'SweetControl')}" ===

📊 RESUMO FINANCEIRO DO MÊS ({month}):
- Vendas: R$ {total_month:.2f}
- Lucro: R$ {profit_month:.2f}
- Gastos: R$ {expenses_month:.2f}
- Margem real: {(profit_month / total_month * 100) if total_month else 0:.1f}%
- Margem padrão configurada: {settings.get('default_margin', 100)}%

🧂 INGREDIENTES ({len(ingredients)} cadastrados):
{_short(ingredients, ['name', 'unit', 'unit_price', 'stock_qty', 'min_stock'], 30)}

⚠️ ESTOQUE BAIXO: {[i['name'] for i in low_stock] or 'nenhum'}

🍰 RECEITAS ({len(doughs)}):
{_short(doughs, ['name', 'category', 'ring_sizes', 'total_cost'], 30)}

🎂 BOLOS MONTADOS ({len(cakes)}):
{_short(cakes, ['name', 'ring_size', 'total_cost', 'final_price', 'margin_percent'], 20)}

🏷️ TABELA DE PREÇOS ({len(prices)}):
{_short(prices, ['ring_size', 'category', 'cost', 'price', 'margin_percent'], 30)}

👥 CLIENTES ({len(customers)}):
{_short(customers, ['name', 'total_spent', 'order_count'], 15)}

📦 ENCOMENDAS ATIVAS (últimas 10):
{_short([o for o in orders if o.get('status') in ('pendente', 'em_preparo', 'finalizado')], ['customer_name', 'delivery_date', 'ring_size', 'dough', 'status', 'total'], 10)}

💰 ÚLTIMAS 10 VENDAS:
{_short(sales, ['sale_date', 'description', 'total', 'profit'], 10)}

💸 ÚLTIMOS 10 GASTOS:
{_short(expenses, ['expense_date', 'description', 'category', 'amount'], 10)}
""".strip()
        return ctx
    except Exception as e:
        logger.error(f"build_context error: {e}")
        return "[Contexto indisponível no momento]"


def create_mikaa_router(db, get_current_user):
    router = APIRouter(prefix="/mikaa", tags=["mikaa"])

    @router.get("/status")
    async def status(user=Depends(get_current_user)):
        return {"available": bool(get_client()), "model": MIKAA_MODEL}

    @router.post("/chat")
    async def chat(payload: MikaaChatIn, user=Depends(get_current_user)):
        client = get_client()
        if not client:
            raise HTTPException(
                status_code=503,
                detail="Mikaa indisponível: GEMINI_API_KEY não configurada.",
            )

        context = await build_context(db)
        full_system = f"{SYSTEM_PROMPT}\n\n{context}\n\nUsuário atual: {user.get('name', '')}."

        # Build Gemini Contents from history + new message
        contents = []
        for m in payload.history[-30:]:  # cap history
            role = "user" if m.role == "user" else "model"
            contents.append(types.Content(role=role, parts=[types.Part.from_text(text=m.content)]))
        contents.append(types.Content(role="user", parts=[types.Part.from_text(text=payload.message)]))

        try:
            response = await client.aio.models.generate_content(
                model=MIKAA_MODEL,
                contents=contents,
                config=types.GenerateContentConfig(
                    system_instruction=full_system,
                    temperature=0.6,
                    max_output_tokens=1024,
                ),
            )
            reply = (response.text or "").strip()
            if not reply:
                reply = "Desculpe, não consegui formular uma resposta. Pode reformular a pergunta? 🌸"

            # Save to history collection (optional, for UI)
            now = datetime.now(timezone.utc).isoformat()
            await db.mikaa_messages.insert_many([
                {"user_id": user["id"], "role": "user", "content": payload.message, "created_at": now},
                {"user_id": user["id"], "role": "assistant", "content": reply, "created_at": now},
            ])

            return {"reply": reply}
        except Exception as e:
            logger.error(f"Mikaa chat error: {e}")
            raise HTTPException(status_code=500, detail=f"Erro na IA: {str(e)[:200]}")

    @router.get("/history")
    async def history(user=Depends(get_current_user)):
        msgs = await db.mikaa_messages.find(
            {"user_id": user["id"]}, {"_id": 0, "user_id": 0}
        ).sort("created_at", 1).to_list(200)
        return msgs

    @router.delete("/history")
    async def clear_history(user=Depends(get_current_user)):
        await db.mikaa_messages.delete_many({"user_id": user["id"]})
        return {"ok": True}

    return router
