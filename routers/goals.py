from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date
from database import SessionLocal
from auth.oauth2 import get_current_user
from models import Goal
from schemas import GoalCreate, GoalResponse, GoalSavingsUpdate

router = APIRouter(
    prefix="/goals",
    tags=["Goals"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

#To create goal
@router.post("/", response_model=GoalResponse)
def create_goal(
    goal: GoalCreate,
    db:Session = Depends(get_db),
    current_user: int =Depends(get_current_user)
):
    
    today = date.today()
    
    #Calculate months remaining
    months_remaining = (
        (goal.target_date.year - today.year) * 12
        + (goal.target_date.month - today.month)
    )
    
    if months_remaining <= 0:
        raise HTTPException(
            status_code=400,
            detail="Target date must be in the future"
        )
    
    monthly_saving_needed = round(
        goal.target_amount / months_remaining,
        2
    )
    
    new_goal = Goal(
        name=goal.name,
        target_amount=goal.target_amount,
        target_date=goal.target_date,
        monthly_saving_needed=monthly_saving_needed,
        saved_amount=0,
        owner_id=current_user
    )
    
    db.add(new_goal)
    db.commit()
    db.refresh(new_goal)
    
    return new_goal

#To get your goals
@router.get("/", response_model = list[GoalResponse])
def get_goals(
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user)
):
    
    goals = db.query(Goal).filter(
        Goal.owner_id == current_user
    ).all()
    
    return goals

#To update goalss
@router.put("/{goal_id}", response_model=GoalResponse)
def update_goal(
    goal_id: int,
    goal: GoalCreate,
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user)
):

    existing_goal = db.query(Goal).filter(
        Goal.id == goal_id,
        Goal.owner_id == current_user
    ).first()

    if not existing_goal:
        raise HTTPException(
            status_code=404,
            detail="Goal not found"
        )

    today = date.today()

    # Calculate months remaining
    months_remaining = (
        (goal.target_date.year - today.year) * 12
        + (goal.target_date.month - today.month)
    )

    if months_remaining <= 0:
        raise HTTPException(
            status_code=400,
            detail="Target date must be in the future"
        )

    monthly_saving_needed = round(
        goal.target_amount / months_remaining,
        2
    )

    # Update values
    existing_goal.name = goal.name
    existing_goal.target_amount = goal.target_amount
    existing_goal.target_date = goal.target_date
    existing_goal.monthly_saving_needed = monthly_saving_needed

    db.commit()
    db.refresh(existing_goal)

    return existing_goal


#To delete goals
@router.delete("/{goal_id}")
def delete_goal(
    goal_id: int,
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user)
):

    goal = db.query(Goal).filter(
        Goal.id == goal_id,
        Goal.owner_id == current_user
    ).first()

    if not goal:
        raise HTTPException(
            status_code=404,
            detail="Goal not found"
        )

    db.delete(goal)
    db.commit()

    return {
        "message": "Goal deleted successfully"
    }
    

#To update progress
@router.put("/{goal_id}/progress")
def update_goal_progress(
    goal_id: int,
    progress: GoalSavingsUpdate,
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user)
):

    goal = db.query(Goal).filter(
        Goal.id == goal_id,
        Goal.owner_id == current_user
    ).first()

    if not goal:
        raise HTTPException(
            status_code=404,
            detail="Goal not found"
        )
    
    if progress.saved_amount <= 0:
        raise HTTPException(
            status_code=400,
            detail="Saved amount must be greater than 0"
        )

    goal.saved_amount = (goal.saved_amount or 0) + progress.saved_amount
    
    if goal.saved_amount > goal.target_amount:
        goal.saved_amount = goal.target_amount

    db.commit()
    db.refresh(goal)

    remaining_amount = goal.target_amount - goal.saved_amount

    progress_percent = round(
        (goal.saved_amount / goal.target_amount) * 100,
        2
    )
    
    is_completed = goal.saved_amount >= goal.target_amount

    return {
        "goal": goal.name,
        "target_amount": goal.target_amount,
        "saved_amount": goal.saved_amount,
        "remaining_amount": remaining_amount,
        "progress_percent": progress_percent,
        "is_completed": is_completed
    }
    
#To get progress
@router.get("/{goal_id}/progress")
def get_goal_progress(
    goal_id: int,
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user)
):

    goal = db.query(Goal).filter(
        Goal.id == goal_id,
        Goal.owner_id == current_user
    ).first()

    if not goal:
        raise HTTPException(
            status_code=404,
            detail="Goal not found"
        )

    remaining_amount = goal.target_amount - goal.saved_amount

    progress_percent = round(
        (goal.saved_amount / goal.target_amount) * 100,
        2
    )
    
    is_completed = goal.saved_amount >= goal.target_amount

    return {
        "goal": goal.name,
        "target_amount": goal.target_amount,
        "saved_amount": goal.saved_amount,
        "remaining_amount": remaining_amount,
        "progress_percent": progress_percent,
        "is_completed" : is_completed
    }
    