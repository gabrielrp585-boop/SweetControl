# SweetControl — PRD

## Problema Original
Sistema web completo e profissional para gestão de mini confeitaria (bolos, doces, encomendas) com design feminino, elegante, sofisticado. Paleta rosa claro/nude/dourado/lilás pastel.

## Stack
- **Backend:** FastAPI + MongoDB (motor) + JWT (httpOnly cookies) + bcrypt + reportlab + openpyxl
- **Frontend:** React 19 + Tailwind + Framer Motion + Recharts + sonner + axios + lucide-react
- **Fontes:** Cormorant Garamond (títulos) + Outfit (corpo)

## Personas
- **Confeiteira (Admin):** controla encomendas, vendas, custos, estoque, clientes e relatórios
- **Suporte:** comunica com a desenvolvedora via aba Suporte para reportar bugs e dúvidas

## Implementado (23/05/2026)
- Auth JWT via cookies httpOnly + seed admin automático (admin@sweetcontrol.com / sweet123)
- Dashboard com KPIs + 3 gráficos (vendas/gastos/lucro 7 dias) + top produtos + alertas de estoque baixo
- Saudação dinâmica por horário (bom dia / boa tarde / boa noite / boa madrugada)
- Encomendas: CRUD + filtros status + busca + botão **WhatsApp** para enviar orçamento formatado
- Vendas + Gastos: CRUD com cálculo de lucro automático
- Massas/Custos: receitas com cálculo automático de custo via ingredientes
- Tabela de Preços: matriz Aro × Categoria (comum/gourmet/2-3 andares) com auto-cálculo
- Estoque: ingredientes + movimentações entrada/saída + alertas estoque baixo
- Clientes: CRUD com histórico de pedidos e total gasto
- Relatórios: export PDF + Excel (vendas, gastos, encomendas)
- Configurações: dados da confeitaria + margem padrão + tema
- Tema claro/escuro feminino elegante
- **Suporte (aba dedicada):** tickets categorizados (bug/dúvida/sugestão) com thread de respostas, prioridade e status
- 100% responsivo (mobile/tablet/desktop)
- Animações Framer Motion + glassmorphism

## Backlog
- P1: Brute-force lockout no login
- P1: Refresh-token rotation
- P2: Backup/restore de banco
- P2: Logo upload (object storage)
- P2: Histórico de pedidos por cliente expandido (modal)
- P2: Cálculo automático de redução de estoque ao registrar venda baseado na receita
