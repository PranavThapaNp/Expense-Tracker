from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from datetime import datetime, timezone

from database import SessionLocal
from auth.oauth2 import get_current_user
from models import Expense, Budget, Goal

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)

# DB Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/")
def dashboard(
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user)
):

    now = datetime.now(timezone.utc)

    # ---------------------------
    # EXPENSES (CURRENT MONTH)
    # ---------------------------
    expenses = db.query(Expense).filter(
        Expense.owner_id == current_user,
        extract("month", Expense.created_at) == now.month,
        extract("year", Expense.created_at) == now.year
    ).all()

    total_spent = db.query(func.sum(Expense.amount)).filter(
        Expense.owner_id == current_user,
        extract("month", Expense.created_at) == now.month,
        extract("year", Expense.created_at) == now.year
    ).scalar() or 0

    category_breakdown_query = db.query(
        Expense.category,
        func.sum(Expense.amount)
    ).filter(
        Expense.owner_id == current_user,
        extract("month", Expense.created_at) == now.month,
        extract("year", Expense.created_at) == now.year
    ).group_by(Expense.category).all()

    category_breakdown = {
        c: a for c, a in category_breakdown_query
    }

    highest_category = (
        max(category_breakdown, key=category_breakdown.get)
        if category_breakdown else None
    )

    average_daily_spending = round(total_spent / now.day, 2) if now.day else 0


    # ---------------------------
    # BUDGETS
    # ---------------------------
    budgets = db.query(Budget).filter(
        Budget.owner_id == current_user,
        Budget.month == now.month,
        Budget.year == now.year
    ).all()

    budget_statuses = []
    alerts = []

    total_budget = 0

    # ---------------------------
    # AI INSIGHTS INIT
    # ---------------------------
    ai_insights = {
        "overspending_categories": [],
        "saving_opportunities": [],
        "risk_level": "Low",
        "top_waste_category": None,
        "budget_efficiency_score": 0,
        "monthly_spending_trend": "stable"
    }

    for budget in budgets:

        spent = category_breakdown.get(budget.category, 0)
        remaining = budget.monthly_limit - spent

        percent_used = round(
            (spent / budget.monthly_limit) * 100,
            2
        ) if budget.monthly_limit else 0

        total_budget += budget.monthly_limit

        status = "Safe"

        # ---------------- Budget Alerts ----------------
        if percent_used >= 100:
            status = "Over Budget"
            alerts.append(f"{budget.category} budget exceeded")

        elif percent_used >= 80:
            status = "Warning"
            alerts.append(f"{budget.category} budget near limit")

        # ---------------- AI LOGIC ----------------
        if percent_used > 100:
            ai_insights["risk_level"] = "High"
            ai_insights["overspending_categories"].append(budget.category)

        elif percent_used > 80:
            if ai_insights["risk_level"] != "High":
                ai_insights["risk_level"] = "Medium"

            suggestion = f"Reduce spending in {budget.category}"
            if suggestion not in ai_insights["saving_opportunities"]:
                ai_insights["saving_opportunities"].append(suggestion)

        budget_statuses.append({
            "category": budget.category,
            "budget_limit": budget.monthly_limit,
            "spent": spent,
            "remaining": remaining,
            "percent_used": percent_used,
            "status": status
        })

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


    # ---------------------------
    # AI: OTHERS CATEGORY INSIGHT
    # ---------------------------
    if total_spent > 0:
        others_ratio = category_breakdown.get("Others", 0) / total_spent

        if others_ratio > 0.3:
            ai_insights["saving_opportunities"].append(
                "High dependency on 'Others'. Improve expense categorization."
            )

        # top waste category
        ai_insights["top_waste_category"] = max(
            category_breakdown,
            key=category_breakdown.get,
            default=None
        )


    # ---------------------------
    # AI: GOAL VS BUDGET CONFLICT
    # ---------------------------
    goals = db.query(Goal).filter(
        Goal.owner_id == current_user
    ).all()

    total_goal_saving_required = sum(
        g.monthly_saving_needed for g in goals
    )

    if total_goal_saving_required > total_remaining:
        ai_insights["saving_opportunities"].append(
            "Your savings goals exceed your monthly surplus. Adjust spending or increase income."
        )
        ai_insights["risk_level"] = "High"

    goal_summary = {
        "active_goals": len(goals),
        "monthly_saving_required_total": total_goal_saving_required,
        "goal_names": [g.name for g in goals]
    }


    # ---------------------------
    # AI FINAL SCORES
    # ---------------------------
    ai_insights["budget_efficiency_score"] = round(
        (total_budget - total_spent) / total_budget * 100,
        2
    ) if total_budget else 0

    if overall_percent < 50:
        ai_insights["monthly_spending_trend"] = "controlled"
    elif overall_percent < 80:
        ai_insights["monthly_spending_trend"] = "moderate"
    else:
        ai_insights["monthly_spending_trend"] = "high"


    # ---------------------------
    # FORECAST PLACEHOLDER
    # ---------------------------
    forecast_summary = {
        "status": "use /forecast endpoint",
        "note": "ML module separated for scalability"
    }


    # ---------------------------
    # RESPONSE
    # ---------------------------
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

        "ai_insights": ai_insights,

        "goals": goal_summary,

        "forecast": forecast_summary,

        "alerts": alerts,

        "recent_expenses": [
            {
                "id": e.id,
                "amount": e.amount,
                "category": e.category,
                "description": e.description,
                "created_at": e.created_at
            }
            for e in expenses[-5:]
        ]
    }