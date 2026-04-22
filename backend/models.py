from typing import Optional, List
from datetime import datetime
from sqlmodel import Field, SQLModel, Relationship

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(index=True, unique=True)
    hashed_password: str
    is_admin: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    tasks: List["Task"] = Relationship(back_populates="user")

class TodoList(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    icon: Optional[str] = "ListTodo"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    user_id: Optional[int] = Field(default=None, foreign_key="user.id", nullable=True)
    tasks: List["Task"] = Relationship(back_populates="todo_list")

class Task(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    is_completed: bool = Field(default=False)
    is_important: bool = Field(default=False)
    due_date: Optional[datetime] = None
    reminder_at: Optional[datetime] = None
    notes: Optional[str] = None
    
    user_id: Optional[int] = Field(default=None, foreign_key="user.id", nullable=True)
    user: Optional[User] = Relationship(back_populates="tasks")
    
    todo_list_id: Optional[int] = Field(default=None, foreign_key="todolist.id", nullable=True)
    todo_list: Optional[TodoList] = Relationship(back_populates="tasks")
    
    subtasks: List["SubTask"] = Relationship(back_populates="task")

class SubTask(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    is_completed: bool = Field(default=False)
    
    task_id: int = Field(foreign_key="task.id")
    task: Task = Relationship(back_populates="subtasks")
