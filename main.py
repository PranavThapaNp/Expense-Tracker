from fastapi import FastAPI
from routers import auth, expenses
from database import engine, Base
import models

app = FastAPI(title="Expense Tracker API")

Base.metadata.create_all(bind=engine)

app.include_router(auth.router)
app.include_router(expenses.router)

@app.get("/")
def root():
    return{"message":"Expense Tracker API is running."}