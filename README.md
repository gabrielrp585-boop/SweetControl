# SweetControl 🎂

Sistema completo de gestão para confeitarias — encomendas, vendas, custos, estoque, clientes e relatórios.

## Stack
- **Backend:** FastAPI + MongoDB (motor) + JWT
- **Frontend:** React 19 + Tailwind + Framer Motion + Recharts

## Estrutura
```
/backend  → API FastAPI (porta 8001 local)
/frontend → React (porta 3000 local)
```

---

## 🚀 Deploy

### Backend no Koyeb

1. **Crie o app** em [koyeb.com](https://www.koyeb.com) → *Create App* → *GitHub*
2. **Work directory:** `backend` ← **muito importante**, senão o Koyeb não detecta Python
3. **Build command:** `pip install -r requirements.txt`
4. **Run command:** `uvicorn server:app --host 0.0.0.0 --port $PORT`
5. **Port:** `8000` (Koyeb usa `$PORT` automaticamente)
6. **Environment variables:**
   ```
   MONGO_URL=mongodb+srv://user:pass@cluster.mongodb.net/
   DB_NAME=sweetcontrol
   JWT_SECRET=cole-uma-string-aleatoria-de-64-caracteres
   ADMIN_EMAIL=seu@email.com
   ADMIN_PASSWORD=SuaSenhaSegura123
   CORS_ORIGINS=https://seu-frontend.onrender.com
   ```

### Frontend no Render

1. **Create** → *Static Site* → conecte o GitHub
2. **Root directory:** `frontend`
3. **Build command:** `yarn install && yarn build`
4. **Publish directory:** `frontend/build` (ou apenas `build` se Root estiver em frontend)
5. **Environment variable:**
   ```
   REACT_APP_BACKEND_URL=https://seu-backend.koyeb.app
   ```

### MongoDB Atlas

1. [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) → cluster grátis
2. **Database Access:** crie usuário com senha
3. **Network Access:** libere `0.0.0.0/0`
4. Copie a connection string para `MONGO_URL`

---

## 👤 Login padrão

- **Email:** `admin@sweetcontrol.com`
- **Senha:** `sweet123`
