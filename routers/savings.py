from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from datetime import datetime, timezone, date
from database import SessionLocal
from auth.oauth2 import get_current_user
from models import Expense, Budget, Goal

router = APIRouter(
    prefix="/savings",
    tags=["Savings Recommendations"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/")
def savings_recommendations(
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user)
):
    now = datetime.now(timezone.utc)

    #Monthly spending
    total_spent = db.query(func.sum(Expense.amount)).filter(
        Expense.owner_id == current_user,
        extract("month", Expense.created_at) == now.month,
        extract("year", Expense.created_at) == now.year
    ).scalar() or 0

    #Budget
    total_budget = db.query(func.sum(Budget.monthly_limit)).filter(
        Budget.owner_id == current_user,
        Budget.month == now.month,
        Budget.year == now.year
    ).scalar() or 0

    #Daily Savings needed to stay within budget
    days_left = 30 - now.day
    remaining_budget = max(total_budget - total_spent, 0)

    daily_safe_spend = remaining_budget / days_left if days_left > 0 else 0

    #Spending Rate Analysis
    daily_avg = total_spent / now.day if now.day else total_spent

    spending_trend = "stable"

    if daily_avg > daily_safe_spend:
        spending_trend = "over_spending"
    elif daily_avg < daily_safe_spend:
        spending_trend = "healthy"

   #Goal Savings
    goals = db.query(Goal).filter(
        Goal.owner_id == current_user
    ).all()

    goal_insights = []

    for g in goals:
        today = date.today()

        months_left = (
            (g.target_date.year - today.year) * 12 +
            (g.target_date.month - today.month)
        )

        if months_left > 0:
            required_monthly = (g.target_amount - g.saved_amount) / months_left
        else:
            required_monthly = g.target_amount - g.saved_amount

        goal_insights.append({
            "goal": g.name,
            "remaining_amount": g.target_amount - g.saved_amount,
            "months_left": months_left,
            "required_monthly_saving": round(required_monthly, 2)
        })

    #Recommendations
    recommendations = []

    if spending_trend == "over_spending":
        recommendations.append(
            "You are spending faster than your safe limit. Reduce daily expenses immediately."
        )
    else:
        recommendations.append(
            "You are within safe spending range. Keep consistency."
        )

    if total_budget > 0 and total_spent > total_budget:
        recommendations.append(
            "You have exceeded your monthly budget. Cut non-essential spending."
        )

    recommendations.append(
        f"Try to keep daily spending under {round(daily_safe_spend, 2)}"
    )

    return {
        "summary": {
            "total_spent": total_spent,
            "total_budget": total_budget,
            "remaining_budget": remaining_budget,
            "daily_safe_spend": round(daily_safe_spend, 2),
            "daily_average": round(daily_avg, 2),
            "spending_trend": spending_trend
        },
        "goal_insights": goal_insights,
        "recommendations": recommendations
    }