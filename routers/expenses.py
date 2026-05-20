from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal
from auth.oauth2 import get_current_user
from models import Expense
from schemas import ExpenseCreate

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
@router.post("/")
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

    return {
        "message": "Expense created successfully",
        "expense": new_expense
    }


# GET ALL EXPENSES (LOGGED-IN USER ONLY)
@router.get("/")
def get_expenses(
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user)
):

    expenses = db.query(Expense).filter(
        Expense.owner_id == current_user
    ).all()

    return expenses


# UPDATE EXPENSE
@router.put("/{expense_id}")
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

    return {
        "message": "Expense updated successfully",
        "expense": existing_expense
    }


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