from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import SessionLocal
from auth.oauth2 import get_current_user
from models import Expense
from schemas import ExpenseCreate, ExpenseResponse
from sqlalchemy import func
from datetime import date, datetime

router = APIRouter(
    prefix="/expenses",
    tags=["Expenses"]
)

# DB dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# CREATE EXPENSE
@router.post("/", response_model=ExpenseResponse)
def create_expense(
    expense: ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user)
):

    new_expense = Expense(
        amount=expense.amount,
        category=expense.category,
        description=expense.description,
        owner_id=current_user
    )

    db.add(new_expense)
    db.commit()
    db.refresh(new_expense)

    return new_expense

# GET ALL EXPENSES (LOGGED-IN USER ONLY)
@router.get("/", response_model=list[ExpenseResponse])
def get_expenses(
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user)
):

    expenses = db.query(Expense).filter(
        Expense.owner_id == current_user
    ).all()

    return expenses


# UPDATE EXPENSE
@router.put("/{expense_id}", response_model=ExpenseResponse)
def update_expense(
    expense_id: int,
    expense: ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user)
):

    existing_expense = db.query(Expense).filter(
        Expense.id == expense_id,
        Expense.owner_id == current_user
    ).first()

    if not existing_expense:
        raise HTTPException(status_code=404, detail="Expense not found")

    existing_expense.amount = expense.amount
    existing_expense.category = expense.category
    existing_expense.description = expense.description

    db.commit()
    db.refresh(existing_expense)

    return existing_expense

# DELETE EXPENSE
@router.delete("/{expense_id}")
def delete_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user)
):

    expense = db.query(Expense).filter(
        Expense.id == expense_id,
        Expense.owner_id == current_user
    ).first()

    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")

    db.delete(expense)
    db.commit()

    return {
        "message": "Expense deleted successfully"
    }
    
#Total expense
@router.get("/summary/total")
def get_total_spent(
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user)
):
    
    total = db.query(func.sum(Expense.amount)).filter(
        Expense.owner_id == current_user
    ).scalar()
    
    return{
        "total_spent": total or 0
    }

#Expenses by categories
@router.get("/summary/categories")
def get_category_breakdown(
    db:Session = Depends(get_db),
    current_user: int = Depends(get_current_user)
):
    
    results = db.query(
        Expense.category,
        func.sum(Expense.amount)
    ).filter(
        Expense.owner_id == current_user
    ).group_by(
        Expense.category
    ).all()
    
    return{
        category: total for category, total in results
    }

    
#Expenses filtered by date
@router.get("/filter", response_model=list[ExpenseResponse])
def filter_expense(
    start_date: date = Query(None),
    end_date: date = Query(None),
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user)    
):
    
    query = db.query(Expense).filter(
        Expense.owner_id == current_user
    )
    
    if start_date:
        query = query.filter(Expense.created_at >= start_date)
    
    if end_date:
        query = query.filter(Expense.created_at <= end_date)
    
    return query.all()

#Monthly analytics
@router.get("/summary/monthly")
def monthly_spending(
    db: Session = Depends(get_db),
    current_user : int = Depends(get_current_user)
):
    
    results = db.query(
        func.date_trunc('month', Expense.created_at).label("month"),
        func.sum(Expense.amount)
    ).filter(
        Expense.owner_id == current_user
    ).group_by(
        func.date_trunc('month', Expense.created_at)
    ).order_by(
        func.date_trunc('month', Expense.created_at)
    ).all()
    
    return{
        str(month): total for month , total in results
    }
    