from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from datetime import datetime, timezone
from database import SessionLocal
from auth.oauth2 import get_current_user
from models import Expense, Budget

router = APIRouter(
    prefix="/insights",
    tags=["AI Insights"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

#To get insights
@router.get("/")
def get_insights(
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user)
):
    now = datetime.now(timezone.utc)

    #Total Spending
    total_spent = db.query(func.sum(Expense.amount)).filter(
        Expense.owner_id == current_user,
        extract("month", Expense.created_at) == now.month,
        extract("year", Expense.created_at) == now.year
    ).scalar() or 0

    #Categorywise
    category_data = db.query(
        Expense.category,
        func.sum(Expense.amount)
    ).filter(
        Expense.owner_id == current_user,
        extract("month", Expense.created_at) == now.month,
        extract("year", Expense.created_at) == now.year
    ).group_by(Expense.category).all()

    category_breakdown = {k: v for k, v in category_data}

    #Highest spending category
    highest_category = None
    if category_breakdown:
        highest_category = max(category_breakdown, key=category_breakdown.get)

    #Budget Data
    budgets = db.query(Budget).filter(
        Budget.owner_id == current_user,
        Budget.month == now.month,
        Budget.year == now.year
    ).all()

    total_budget = 0
    alerts = []
    risk_level = "LOW"

    for b in budgets:
        spent = category_breakdown.get(b.category, 0)
        total_budget += b.monthly_limit

        percent = (spent / b.monthly_limit) * 100 if b.monthly_limit else 0

        if percent >= 100:
            alerts.append(f"{b.category} budget exceeded")
            risk_level = "HIGH"

        elif percent >= 80:
            alerts.append(f"{b.category} close to limit")
            risk_level = "MEDIUM"

    #Saving Rate
    savings_potential = max(total_budget - total_spent, 0)

    recommendation = []

    if risk_level == "HIGH":
        recommendation.append("Reduce non-essential expenses immediately.")
        recommendation.append("You are overspending your monthly budget.")

    elif risk_level == "MEDIUM":
        recommendation.append("You are close to your budget limit.")
        recommendation.append("Try reducing entertainment and food spending.")

    else:
        recommendation.append("Good job! You are managing expenses well.")
        recommendation.append("Consider increasing savings or investments.")

    
    return {
        "summary": {
            "total_spent": total_spent,
            "total_budget": total_budget,
            "savings_potential": savings_potential,
            "highest_spending_category": highest_category
        },
        "risk_level": risk_level,
        "alerts": alerts,
        "recommendations": recommendation
    }