from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import extract
from database import SessionLocal
from auth.oauth2 import get_current_user
from models import Expense
from datetime import datetime, timezone

import pandas as pd
from fastapi.responses import StreamingResponse
from io import StringIO, BytesIO
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter

router = APIRouter(
    prefix="/export",
    tags=["Export"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        
#To get current month expenses
def get_monthly_expenses(db:Session, user_id: int):
    
    now = datetime.now(timezone.utc)
    
    return db.query(Expense).filter(
        Expense.owner_id == user_id,
        extract("month", Expense.created_at) == now.month,
        extract("year", Expense.created_at) == now.year,
    ).all()


#To export CSV
@router.get("/csv")
def export_csv(
    db:Session = Depends(get_db),
    current_user: int = Depends(get_current_user)
):
    expenses = get_monthly_expenses(db, current_user)
    
    data = [
        {
            "id": e.id,
            "amount": e.amount,
            "category": e.category,
            "description": e.description,
            "created_at": e.created_at
        }
        for e in expenses
    ]
    
    df = pd.DataFrame(data)
    
    stream = StringIO()
    df.to_csv(stream, index=False)
    stream.seek(0)
    
    return StreamingResponse(
        stream,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=expenses.csv"}
    )
    
#Excel Export
@router.get("/excel")
def export_excel(
    db:Session = Depends(get_db),
    current_user: int = Depends(get_current_user)
):
    
    expenses = get_monthly_expenses(db, current_user)
    
    data = [
        {
            "id": e.id,
            "amount": e.amount,
            "category": e.category,
            "description": e.description,
            "created_at": e.created_at.replace(tzinfo = None) if e.created_at else None
        }
        for e in expenses
    ]
    
    df = pd.DataFrame(data)
    
    stream = BytesIO()
    with pd.ExcelWriter(stream, engine="openpyxl") as writer:
        df.to_excel(writer, index=False, sheet_name="Expenses")
    
    stream.seek(0)
    
    return StreamingResponse(
        stream,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=expenses.xlsx"}
    )
    

#PDF export
@router.get("/pdf")
def export_pdf(
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user)
):
    
    expenses = get_monthly_expenses(db, current_user)
    
    stream = BytesIO()
    pdf = canvas.Canvas(stream, pagesize = letter)
    
    y = 750
    pdf.setFont("Helvetica-Bold", 14)
    pdf.drawString(50, y, "Monthly Expense Report")
    y -= 30

    pdf.setFont("Helvetica", 10)

    for e in expenses:
        line = f"{e.category} | {e.amount} | {e.description} | {e.created_at}"
        pdf.drawString(50, y, line)
        y -= 20

        if y < 50:
            pdf.showPage()
            y = 750

    pdf.save()
    stream.seek(0)

    return StreamingResponse(
        stream,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=expenses.pdf"}
    )

