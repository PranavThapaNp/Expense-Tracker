from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from datetime import datetime, timezone

from database import SessionLocal
from auth.oauth2 import get_current_user
from models import Expense, Budget

router = APIRouter(
    prefix="/dashboard",
    tags=['Dashboard']
)

def get_db():
    db =  SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/")
def dashboard(
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user)
):
    
    now =datetime.now(timezone.utc)
    
    #To get currnet month expenses
    expenses = db.query(Expense).filter(
        Expense.owner_id == current_user,
        extract("month",Expense.created_at) == now.month,
        extract("year",Expense.created_at) == now.year
    ).all()
    
    
    #Total Spent
    total_spent = db.query(
        func.sum(Expense.amount)
    ).filter(
        Expense.owner_id == current_user,
        extract("month", Expense.created_at) == now.month,
        extract("year", Expense.created_at) == now.year
    ).scalar() or 0
    
    #Category Breakdown
    category_breakdown_query = db.query(
        Expense.category,
        func.sum(Expense.amount)
    ).filter(
        Expense.owner_id == current_user,
        extract("month", Expense.created_at) == now.month,
        extract("year", Expense.created_at) == now.year,
    ).group_by(
        Expense.category
    ).all()
    
    category_breakdown = {
        category: amount
        for category, amount in category_breakdown_query
    }
    
    
    #Highest Spending Category
    
    highest_category = None
    
    if category_breakdown:
        highest_category = max(
            category_breakdown,
            key= category_breakdown.get
        )
        
    
    #Daily Average
    
    average_daily_spending = round(
        total_spent / now.day,
        2
    )if now.day else 0
    
    
    #Monthly Budget
    budgets = db.query(Budget).filter(
        Budget.owner_id == current_user,
        Budget.month == now.month,
        Budget.year == now.year
    ).all()
    
    budget_statuses = []
    total_budget = 0
    alerts = []
    
    for budget in budgets:
        
        spent = category_breakdown.get(
            budget.category,
            0
        )
        
        remaining = budget.monthly_limit - spent
        
        percent_used = round(
            (spent / budget.monthly_limit) * 100,
            2
        )if budget.monthly_limit else 0
        
        total_budget += budget.monthly_limit
        
        status = "Safe"
        
        # Alert category-wise
        if percent_used >= 100:
            status = "Over Budget"
            alerts.append(f"{budget.category} budget exceeded")

        elif percent_used >= 80:
            status = "Warning"
            alerts.append(f"{budget.category} budget near limit")

        budget_statuses.append({
            "category": budget.category,
            "budget_limit": budget.monthly_limit,
            "spent": spent,
            "remaining": remaining,
            "percent_used": percent_used,
            "status": status
        })
        
    #Overall budget summary
    total_remaining = total_budget - total_spent
    
    overall_percent = (
        (total_spent / total_budget) * 100
        if total_budget else 0
    )
    
    overall_status = "Safe"

    if overall_percent >= 100:
        overall_status = "Over Budget"
        alerts.append("Total monthly budget exceeded")

    elif overall_percent >= 80:
        overall_status = "Warning"
        alerts.append("Total monthly budget near limit")
    
    #Overall Return
    return {

        "user_id": current_user,

        "analytics": {
            "total_spent": total_spent,
            "average_daily_spending": average_daily_spending,
            "highest_spending_category": highest_category,
            "category_breakdown": category_breakdown
        },

        "budget_summary": {
            "total_budget": total_budget,
            "total_spent": total_spent,
            "total_remaining": total_remaining,
            "overall_percent_used": round(overall_percent, 2),
            "overall_status": overall_status
        },

        "budget_statuses": budget_statuses,

        "alerts": alerts,

        "recent_expenses": [
            {
                "id": expense.id,
                "amount": expense.amount,
                "category": expense.category,
                "description": expense.description,
                "created_at": expense.created_at
            }
            for expense in expenses[-5:]
        ]
    }