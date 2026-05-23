from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from database import SessionLocal
from auth.oauth2 import get_current_user
from models import Budget, Expense
from schemas import BudgetCreate, BudgetResponse
from datetime import datetime, timezone

router = APIRouter(
    prefix="/budgets",
    tags=["Budgets"]
)

#DB dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


#Create Budget
@router.post("/", response_model=BudgetResponse)
def create_budget(
    budget: BudgetCreate,
    db: Session = Depends(get_db),
    current_user : int = Depends(get_current_user)
):
    
    now = datetime.now(timezone.utc)
    
    #Check if budget already exists this month
    existing =db.query(Budget).filter(
        Budget.owner_id == current_user,
        Budget.category == budget.category,
        Budget.month == now.month,
        Budget.year == now.year
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Budget already exists for this month"
        )
    
    new_budget = Budget(
        category = budget.category,
        monthly_limit = budget.monthly_limit,
        owner_id = current_user,
        month = now.month,
        year =now.year
    )
    
    db.add(new_budget)
    db.commit()
    db.refresh(new_budget)
    
    return new_budget

#Get budget from user
@router.get("/",response_model=list[BudgetResponse])
def get_budget(
    db: Session = Depends(get_db),
    current_user : int = Depends(get_current_user)
):
    
    now = datetime.now(timezone.utc)
    
    budgets = db.query(Budget).filter(
        Budget.owner_id == current_user,
        Budget.month == now.month,
        Budget.year == now.year
    ).all()
    
    return budgets

#Budget Status
@router.get("/status")
def budget_status(
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user)
):
    
    now = datetime.now(timezone.utc)
    total_budget = 0
    total_spent = 0
    
    budgets = db.query(Budget).filter(
        Budget.owner_id == current_user,
        Budget.month == now.month,
        Budget.year == now.year
    ).all()
    
    result = []
    
    for budget in budgets:
        
        spent = db.query(func.sum(Expense.amount)).filter(
            Expense.owner_id == current_user,
            Expense.category == budget.category,
            extract("month", Expense.created_at) == now.month,
            extract("year", Expense.created_at) == now.year
        ).scalar() or 0
        
        remaining = budget.monthly_limit - spent
        percent_used = (spent / budget.monthly_limit)* 100 if budget.monthly_limit > 0 else 0
        
        total_budget += budget.monthly_limit
        total_spent += spent
        
        if spent > budget.monthly_limit:
            status = "Over_budget"
        elif percent_used > 80:
            status = "Warning"
        else:
            status = "Safe"
        
        result.append({
            "category": budget.category,
            "budget_limit": budget.monthly_limit,
            "spent": spent,
            "remaining": remaining,
            "percent_used": round(percent_used, 2),
            "status": status
        })
        
    total_remaining = total_budget - total_spent
    overall_percent = (total_spent / total_budget) * 100 if total_budget else 0
        
    if overall_percent >= 100:
        overall_status = "Over_Budget"
    elif overall_percent >= 80:
        overall_status = "Warning"
    else:
        overall_status = "Safe"
        
    return {
        "user_id": current_user,
        "summary":{
            "total_budget": total_budget,
            "total_spent": total_spent,
            "total_remaining": total_remaining,
            "overall_percent_used": round(overall_percent, 2),
            "overall_status": overall_status  
        },
        "budgets" : result
    }