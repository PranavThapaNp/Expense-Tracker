from fastapi import FastAPI
from routers import auth, expenses, budget, dashboard, export, goals, insights, savings, finance_engine, predictions
from database import engine, Base
import models
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Expense Tracker API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(auth.router)
app.include_router(expenses.router)
app.include_router(budget.router)
app.include_router(dashboard.router)
app.include_router(export.router)
app.include_router(goals.router)
app.include_router(savings.router)
app.include_router(insights.router)
app.include_router(finance_engine.router)
app.include_router(predictions.router)

@app.get("/")
def root():
    return{"message":"Expense Tracker API is running."}