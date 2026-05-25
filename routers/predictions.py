from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from datetime import datetime, timezone, timedelta
from database import SessionLocal
from auth.oauth2 import get_current_user
from models import Expense

router = APIRouter(
    prefix="/ml",
    tags=["ML Predictions"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        
#Linear Regression to predict Basic spending 
@router.get("/forecast")
def forecast_spending(
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user)
):

    now = datetime.now(timezone.utc)

    #Daily spending
    daily_data = db.query(
        func.date(Expense.created_at),
        func.sum(Expense.amount)
    ).filter(
        Expense.owner_id == current_user,
        extract("month", Expense.created_at) == now.month,
        extract("year", Expense.created_at) == now.year
    ).group_by(
        func.date(Expense.created_at)
    ).order_by(
        func.date(Expense.created_at)
    ).all()

    
    # Convert to numeric X (day index)
    # IMPORTANT: use index, not actual day number
    x_vals = []
    y_vals = []

    start_date = daily_data[0][0] if daily_data else None

    if not start_date or len(daily_data) < 2:
        return {"message": "Not enough data for prediction"}

    for i, (day, amount) in enumerate(daily_data):
        x_vals.append(i)        # 0,1,2,3...
        y_vals.append(amount)

   
    # 3. Linear regression (manual/ not using scikit learn in this project)
    # y = ax + b
    
    n = len(x_vals)

    sum_x = sum(x_vals)
    sum_y = sum(y_vals)
    sum_xy = sum(x * y for x, y in zip(x_vals, y_vals))
    sum_x2 = sum(x * x for x in x_vals)

    denominator = (n * sum_x2 - sum_x ** 2)

    if denominator == 0:
        return {"message": "Cannot compute trend"}

    a = (n * sum_xy - sum_x * sum_y) / denominator
    b = (sum_y - a * sum_x) / n

    #Next 7 days forecast
    predictions = []
    total_forecast = 0

    last_index = len(x_vals) - 1

    for i in range(1, 8):
        future_x = last_index + i
        predicted = a * future_x + b

        future_date = now + timedelta(days=i)

        predictions.append({
            "date": future_date.date().isoformat(),
            "predicted_spending": round(max(predicted, 0), 2)
        })

        total_forecast += max(predicted, 0)

    return {
        "model": "linear_trend",
        "7_day_forecast": predictions,
        "total_predicted_spending": round(total_forecast, 2)
    }
    
#To predict budget exhaustion
@router.get("/burn-rate")
def burn_rate(
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user)
):
    now = datetime.now(timezone.utc)

    total_spent = db.query(func.sum(Expense.amount)).filter(
        Expense.owner_id == current_user,
        extract("month", Expense.created_at) == now.month,
        extract("year", Expense.created_at) == now.year
    ).scalar() or 0

    current_day = now.day

    if current_day == 0:
        return {"message": "No data yet"}

    daily_avg = total_spent / current_day

    # assume 30-day month
    projected_monthly_spend = daily_avg * 30

    burn_rate_status = "SAFE"

    if projected_monthly_spend > total_spent * 1.2:
        burn_rate_status = "RISKY"
    if projected_monthly_spend > total_spent * 1.5:
        burn_rate_status = "CRITICAL"

    return {
        "daily_average_spending": round(daily_avg, 2),
        "projected_monthly_spending": round(projected_monthly_spend, 2),
        "status": burn_rate_status
    }


#To predict future Risks Area
@router.get("/risk-categories")
def risk_categories(
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user)
):
    now = datetime.now(timezone.utc)

    data = db.query(
        Expense.category,
        func.sum(Expense.amount)
    ).filter(
        Expense.owner_id == current_user,
        extract("month", Expense.created_at) == now.month,
        extract("year", Expense.created_at) == now.year
    ).group_by(Expense.category).all()

    risky = []

    for category, amount in data:
        if amount > 1000:
            risky.append({
                "category": category,
                "risk_level": "HIGH",
                "suggestion": "Reduce spending in this category"
            })
        else:
            risky.append({
                "category": category,
                "risk_level": "LOW",
                "suggestion": "Safe spending pattern"
            })

    return {
        "risk_analysis": risky
    }