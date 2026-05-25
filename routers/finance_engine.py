from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from datetime import datetime, timezone, date
from database import SessionLocal
from auth.oauth2 import get_current_user
from models import Budget, Expense, Goal

router = APIRouter(
    prefix="/finance",
    tags=["Finance Engine"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/plan")
def financial_plan(
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user)
):
    now = datetime.now(timezone.utc)
    today = date.today()

    #Budget Cap
    total_budget = db.query(func.sum(Budget.monthly_limit)).filter(
        Budget.owner_id == current_user,
        Budget.month == now.month,
        Budget.year == now.year
    ).scalar() or 0

    #Total Expenses
    total_spent = db.query(func.sum(Expense.amount)).filter(
        Expense.owner_id == current_user,
        extract("month", Expense.created_at) == now.month,
        extract("year", Expense.created_at) == now.year
    ).scalar() or 0

    remaining_budget = total_budget - total_spent

    #Goal Analysis
    goals = db.query(Goal).filter(
        Goal.owner_id == current_user
    ).all()

    total_required_savings = 0
    goal_breakdown = []

    for g in goals:
        months_left = (
            (g.target_date.year - today.year) * 12 +
            (g.target_date.month - today.month)
        )

        remaining_amount = g.target_amount - g.saved_amount

        if remaining_amount < 0:
            remaining_amount = 0

        if months_left > 0:
            monthly_required = remaining_amount / months_left
        else:
            monthly_required = remaining_amount

        total_required_savings += monthly_required

        goal_breakdown.append({
            "goal": g.name,
            "remaining_amount": remaining_amount,
            "months_left": months_left,
            "monthly_required": round(monthly_required, 2)
        })

    #Check if goals are affordable
    disposable_income = remaining_budget

    gap = disposable_income - total_required_savings

    if gap >= 0:
        status = "ON_TRACK"
    elif gap > -1000:
        status = "RISKY"
    else:
        status = "CRITICAL"

    #Suggestion Engine
    suggestions = []

    if status == "ON_TRACK":
        suggestions.append("You are on track to achieve all your goals.")
        suggestions.append("You can even increase savings or investments.")

    elif status == "RISKY":
        suggestions.append("You are slightly short on meeting your goals.")
        suggestions.append("Reduce non-essential spending by 10–15%.")

    else:
        suggestions.append("You cannot meet all goals with current budget.")
        suggestions.append("Consider extending goal deadlines or increasing income.")

    #Category based advice
    if total_budget > 0 and total_spent > total_budget:
        suggestions.append("You are overspending your budget this month.")


    return {
        "summary": {
            "total_budget": total_budget,
            "total_spent": total_spent,
            "remaining_budget": remaining_budget,
            "disposable_income": remaining_budget,
            "total_required_savings": round(total_required_savings, 2),
            "gap": round(gap, 2),
            "status": status
        },
        "goal_breakdown": goal_breakdown,
        "suggestions": suggestions
    }