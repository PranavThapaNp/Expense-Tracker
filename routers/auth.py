from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal
import models, schemas
from auth.hash import hash_password, verify_password
from auth.jwt import create_access_token

router = APIRouter()

#DB dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        
#Registeration
@router.post("/register", response_model=schemas.UserOut)
def register(user: schemas.UserCreate,db: Session = Depends(get_db)):
    
    existing_user = db.query(models.User).filter(models.User.email == user.email).first()
    
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already in use!!!")
    
    new_user = models.User(
        username = user.username,
        email = user.email,
        hashed_password = hash_password(user.password)
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user


#Login
@router.post("/login")
def login(user: schemas.UserCreate, db: Session = Depends(get_db)):
    
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    
    if not db_user:
        raise HTTPException(status_code=400, detail="Invalid Credentials.")
    
    if not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid Credentials.")
    
    token = create_access_token({"user_id": db_user.id})
    
    return{"access_token": token, "token_type": "bearer"}
    