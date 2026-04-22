from fastapi import FastAPI, Depends, HTTPException, Body, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlmodel import Session, select, create_engine, SQLModel
from sqlalchemy.orm import selectinload
from typing import List, Optional
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from models import Task, User, SubTask, TodoList

# JWT 配置
SECRET_KEY = "your-secret-key-change-this-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 天

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

app = FastAPI(title="To-Do List API", version="0.1.0")

# ... (rest of the setup)

sqlite_url = "sqlite:///./todo.db"
engine = create_engine(sqlite_url, connect_args={"check_same_thread": False})

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session

# Auth Utilities
def get_password_hash(password):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme), session: Session = Depends(get_session)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = session.exec(select(User).where(User.email == email)).first()
    if user is None:
        raise credentials_exception
    return user

async def get_admin_user(current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return current_user

@app.on_event("startup")
def on_startup():
    create_db_and_tables()
    # 自动创建默认管理员
    with Session(engine) as session:
        admin_email = "admin@todo.com"
        admin_user = session.exec(select(User).where(User.email == admin_email)).first()
        if not admin_user:
            admin = User(
                email=admin_email,
                hashed_password=get_password_hash("admin123"),
                is_admin=True
            )
            session.add(admin)
            session.commit()

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to To-Do List API"}

# Auth Routes
@app.post("/register")
def register(user: User, session: Session = Depends(get_session)):
    db_user = session.exec(select(User).where(User.email == user.email)).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    user.hashed_password = get_password_hash(user.hashed_password)
    session.add(user)
    session.commit()
    session.refresh(user)
    return {"message": "User created successfully"}

@app.post("/token")
def login(form_data: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.email == form_data.username)).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me")
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

# Admin Routes
@app.get("/admin/users", response_model=List[User])
def get_all_users(admin: User = Depends(get_admin_user), session: Session = Depends(get_session)):
    users = session.exec(select(User)).all()
    return users

@app.delete("/admin/users/{user_id}")
def delete_user(user_id: int, admin: User = Depends(get_admin_user), session: Session = Depends(get_session)):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.is_admin:
        raise HTTPException(status_code=400, detail="Cannot delete admin user")
    session.delete(user)
    session.commit()
    return {"ok": True}

# TodoList CRUD
@app.post("/lists/", response_model=TodoList)
def create_list(todo_list: TodoList, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    todo_list.user_id = current_user.id
    session.add(todo_list)
    session.commit()
    session.refresh(todo_list)
    return todo_list

@app.get("/lists/", response_model=List[TodoList])
def read_lists(session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    lists = session.exec(select(TodoList).where(TodoList.user_id == current_user.id)).all()
    return lists

@app.get("/lists/{list_id}", response_model=TodoList)
def read_list(list_id: int, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    todo_list = session.exec(select(TodoList).where(TodoList.id == list_id, TodoList.user_id == current_user.id)).first()
    if not todo_list:
        raise HTTPException(status_code=404, detail="List not found")
    return todo_list

@app.patch("/lists/{list_id}", response_model=TodoList)
def update_list(list_id: int, list_data: dict = Body(...), session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    db_list = session.exec(select(TodoList).where(TodoList.id == list_id, TodoList.user_id == current_user.id)).first()
    if not db_list:
        raise HTTPException(status_code=404, detail="List not found")
    for key, value in list_data.items():
        if hasattr(db_list, key):
            setattr(db_list, key, value)
    session.add(db_list)
    session.commit()
    session.refresh(db_list)
    return db_list

@app.delete("/lists/{list_id}")
def delete_list(list_id: int, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    db_list = session.exec(select(TodoList).where(TodoList.id == list_id, TodoList.user_id == current_user.id)).first()
    if not db_list:
        raise HTTPException(status_code=404, detail="List not found")
    session.delete(db_list)
    session.commit()
    return {"ok": True}

# Task CRUD
@app.post("/tasks/", response_model=Task)
def create_task(task: Task, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    task.user_id = current_user.id
    session.add(task)
    session.commit()
    session.refresh(task)
    return task

@app.get("/tasks/", response_model=List[Task])
def read_tasks(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
    is_completed: Optional[bool] = None,
    is_important: Optional[bool] = None,
    todo_list_id: Optional[int] = None
):
    statement = select(Task).where(Task.user_id == current_user.id).options(selectinload(Task.subtasks))
    if is_completed is not None:
        statement = statement.where(Task.is_completed == is_completed)
    if is_important is not None:
        statement = statement.where(Task.is_important == is_important)
    if todo_list_id is not None:
        statement = statement.where(Task.todo_list_id == todo_list_id)
    tasks = session.exec(statement).all()
    return tasks

@app.get("/tasks/{task_id}", response_model=Task)
def read_task(task_id: int, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    task = session.exec(select(Task).where(Task.id == task_id, Task.user_id == current_user.id).options(selectinload(Task.subtasks))).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@app.patch("/tasks/{task_id}", response_model=Task)
def update_task(task_id: int, task_data: dict = Body(...), session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    db_task = session.exec(select(Task).where(Task.id == task_id, Task.user_id == current_user.id).options(selectinload(Task.subtasks))).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    for key, value in task_data.items():
        if hasattr(db_task, key):
            setattr(db_task, key, value)
            
    session.add(db_task)
    session.commit()
    session.refresh(db_task)
    return db_task

@app.delete("/tasks/{task_id}")
def delete_task(task_id: int, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    task = session.exec(select(Task).where(Task.id == task_id, Task.user_id == current_user.id)).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    session.delete(task)
    session.commit()
    return {"ok": True}

# SubTask CRUD
@app.post("/tasks/{task_id}/subtasks/", response_model=SubTask)
def create_subtask(task_id: int, subtask: SubTask, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    # Verify task ownership
    task = session.exec(select(Task).where(Task.id == task_id, Task.user_id == current_user.id)).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    subtask.task_id = task_id
    session.add(subtask)
    session.commit()
    session.refresh(subtask)
    return subtask

@app.patch("/subtasks/{subtask_id}", response_model=SubTask)
def update_subtask(subtask_id: int, subtask_data: dict = Body(...), session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    db_subtask = session.exec(select(SubTask).join(Task).where(SubTask.id == subtask_id, Task.user_id == current_user.id)).first()
    if not db_subtask:
        raise HTTPException(status_code=404, detail="SubTask not found")
    
    for key, value in subtask_data.items():
        if hasattr(db_subtask, key):
            setattr(db_subtask, key, value)
            
    session.add(db_subtask)
    session.commit()
    session.refresh(db_subtask)
    return db_subtask

@app.delete("/subtasks/{subtask_id}")
def delete_subtask(subtask_id: int, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    db_subtask = session.exec(select(SubTask).join(Task).where(SubTask.id == subtask_id, Task.user_id == current_user.id)).first()
    if not db_subtask:
        raise HTTPException(status_code=404, detail="SubTask not found")
    session.delete(db_subtask)
    session.commit()
    return {"ok": True}
