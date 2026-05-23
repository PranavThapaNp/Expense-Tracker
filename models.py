from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Date
from sqlalchemy.orm import Relationship
from database import Base
from datetime import datetime, timezone

class User(Base):
    
    __tablename__ = "users"
    
    id = Column(Integer, primary_key = True, index = True)
    username = Column(String, unique = True, index = True)
    email = Column(String, unique = True, index = True)
    hashed_password = Column(String)
    expenses = Relationship("Expense", back_populates="owner")
    
class Expense(Base):
    
    __tablename__ = "expenses"
    
    id = Column(Integer, primary_key = True, index = True)
    amount = Column(Float, nullable= False)
    category = Column(String, nullable= False)
    description = Column(String, nullable= False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    owner =  Relationship("User", back_populates="expenses")
    
    owner_id = Column(Integer, ForeignKey("users.id"))

class Budget(Base):
    
    __tablename__ = "budgets"
    
    id = Column(Integer, primary_key=True, index=True)

    category = Column(String, nullable=False)

    monthly_limit = Column(Float, nullable=False)

    owner_id = Column(
        Integer,
        ForeignKey("users.id")
    )
    
    month = Column(Integer, nullable=False)
    year = Column(Integer, nullable= False)