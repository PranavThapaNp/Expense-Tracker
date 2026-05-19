from pydantic import BaseModel

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