from pydantic import BaseModel
from datetime import datetime, date
from enum import Enum

#Categories available
class CategoryEnum(str, Enum):
    food_drinks = "Food & Drinks"
    utility_bills = "Utility & Bills"
    family_friends = "Family & Friends"
    education = "Education"
    transportation = "Transportation"
    entertainment = "Entertainment"
    health_medicine = "Health & Medicine"
    others = "Others"

#Registration Input
class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    
#Output without displaying password
class UserOut(BaseModel):
    id: int
    username: str
    email: str
    
    class Config:
        from_attributes = True
        
#Expenses        
        
class ExpenseBase(BaseModel):
    amount: float
    category : CategoryEnum
    description: str

class ExpenseCreate(ExpenseBase):
    pass

class ExpenseResponse(ExpenseBase):
    id: int
    owner_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True
        
#Budget

class BudgetBase(BaseModel):
    category: CategoryEnum
    monthly_limit: float

class BudgetCreate(BudgetBase):
    pass

class BudgetResponse(BudgetBase):
    id: int
    owner_id: int
    
    class Config:
        from_attributes =  True


#Goals

class GoalCreate(BaseModel):
    name: str
    target_amount: float
    target_date: date

class GoalSavingsUpdate(BaseModel):
    saved_amount: float

class GoalResponse(BaseModel):
    id: int
    name:str
    target_amount: float
    saved_amount: float
    target_date: date
    monthly_saving_needed: float
    owner_id: int
    
    class Config:
        from_attributes = True
    