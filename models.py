from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from database import Base
from datetime import datetime, timezone

class User(Base):
    
    __tablename__ = "users"
    
    id = Column(Integer, primary_key = True, index = True)
    username = Column(String, unique = True, index = True)
    email = Column(String, unique = True, index = True)
    hashed_password = Column(String)
    
class Expense(Base):
    
    __tablename__ = "expenses"
    
    id = Column(Integer, primary_key = True, index = True)
    amount = Column(Float)
    category = Column(String)
    description = Column(String)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    
    owner_id = Column(Integer, ForeignKey("users.id"))