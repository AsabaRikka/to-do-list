from fastapi import FastAPI, Depends, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select, create_engine, SQLModel
from sqlalchemy.orm import selectinload
from typing import List, Optional
from models import Task, User, SubTask

app = FastAPI(title="To-Do List API", version="0.1.0")

sqlite_url = "sqlite:///./todo.db"
engine = create_engine(sqlite_url, connect_args={"check_same_thread": False})

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session

@app.on_event("startup")
def on_startup():
    create_db_and_tables()
    # 添加示例数据
    with Session(engine) as session:
        tasks = session.exec(select(Task)).all()
        if not tasks:
            session.add(Task(title="欢迎使用 Microsoft To Do 克隆版！", is_important=True))
            session.add(Task(title="点击左侧星号标记重要任务"))
            session.add(Task(title="点击左侧圆圈完成任务", is_completed=True))
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

# Task CRUD
@app.post("/tasks/", response_model=Task)
def create_task(task: Task, session: Session = Depends(get_session)):
    session.add(task)
    session.commit()
    session.refresh(task)
    return task

@app.get("/tasks/", response_model=List[Task])
def read_tasks(
    session: Session = Depends(get_session),
    is_completed: Optional[bool] = None,
    is_important: Optional[bool] = None
):
    statement = select(Task).options(selectinload(Task.subtasks))
    if is_completed is not None:
        statement = statement.where(Task.is_completed == is_completed)
    if is_important is not None:
        statement = statement.where(Task.is_important == is_important)
    tasks = session.exec(statement).all()
    return tasks

@app.get("/tasks/{task_id}", response_model=Task)
def read_task(task_id: int, session: Session = Depends(get_session)):
    task = session.exec(select(Task).where(Task.id == task_id).options(selectinload(Task.subtasks))).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@app.patch("/tasks/{task_id}", response_model=Task)
def update_task(task_id: int, task_data: dict = Body(...), session: Session = Depends(get_session)):
    db_task = session.exec(select(Task).where(Task.id == task_id).options(selectinload(Task.subtasks))).first()
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
def delete_task(task_id: int, session: Session = Depends(get_session)):
    task = session.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    session.delete(task)
    session.commit()
    return {"ok": True}

# SubTask CRUD
@app.post("/tasks/{task_id}/subtasks/", response_model=SubTask)
def create_subtask(task_id: int, subtask: SubTask, session: Session = Depends(get_session)):
    subtask.task_id = task_id
    session.add(subtask)
    session.commit()
    session.refresh(subtask)
    return subtask

@app.patch("/subtasks/{subtask_id}", response_model=SubTask)
def update_subtask(subtask_id: int, subtask_data: dict = Body(...), session: Session = Depends(get_session)):
    db_subtask = session.get(SubTask, subtask_id)
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
def delete_subtask(subtask_id: int, session: Session = Depends(get_session)):
    db_subtask = session.get(SubTask, subtask_id)
    if not db_subtask:
        raise HTTPException(status_code=404, detail="SubTask not found")
    session.delete(db_subtask)
    session.commit()
    return {"ok": True}
