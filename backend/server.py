from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone

# =============================================================================
# SUPABASE TEMPLATE (DUMMY) - Replace MongoDB with Supabase when ready
# =============================================================================
# To integrate Supabase:
# 1. Install: pip install supabase
# 2. Add to .env: SUPABASE_URL=your_url, SUPABASE_KEY=your_anon_key
# 3. Initialize: from supabase import create_client
#    supabase = create_client(os.environ['SUPABASE_URL'], os.environ['SUPABASE_KEY'])
# 4. Replace MongoDB queries with Supabase:
#    - Insert: supabase.table('todos').insert(data).execute()
#    - Select: supabase.table('todos').select('*').execute()
#    - Update: supabase.table('todos').update(data).eq('id', id).execute()
#    - Delete: supabase.table('todos').delete().eq('id', id).execute()
# =============================================================================

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection (will be replaced with Supabase)
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

# ============== Models ==============
class TodoBase(BaseModel):
    title: str
    description: Optional[str] = ""
    category: str = "general"
    priority: str = "medium"  # high, medium, low
    due_date: Optional[str] = None

class TodoCreate(TodoBase):
    pass

class TodoUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[str] = None
    completed: Optional[bool] = None

class Todo(TodoBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    completed: bool = False
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class CategoryResponse(BaseModel):
    categories: List[str]

# Default categories
DEFAULT_CATEGORIES = ["general", "work", "personal", "shopping", "health", "learning"]

# ============== Routes ==============
@api_router.get("/")
async def root():
    return {"message": "Todo API is running"}

@api_router.get("/todos", response_model=List[Todo])
async def get_todos():
    todos = await db.todos.find({}, {"_id": 0}).to_list(1000)
    return todos

@api_router.post("/todos", response_model=Todo)
async def create_todo(todo_input: TodoCreate):
    todo = Todo(**todo_input.model_dump())
    doc = todo.model_dump()
    await db.todos.insert_one(doc)
    return todo

@api_router.put("/todos/{todo_id}", response_model=Todo)
async def update_todo(todo_id: str, todo_update: TodoUpdate):
    existing = await db.todos.find_one({"id": todo_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Todo not found")
    
    update_data = {k: v for k, v in todo_update.model_dump().items() if v is not None}
    if update_data:
        await db.todos.update_one({"id": todo_id}, {"$set": update_data})
    
    updated = await db.todos.find_one({"id": todo_id}, {"_id": 0})
    return updated

@api_router.delete("/todos/{todo_id}")
async def delete_todo(todo_id: str):
    result = await db.todos.delete_one({"id": todo_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Todo not found")
    return {"message": "Todo deleted successfully"}

@api_router.get("/categories", response_model=CategoryResponse)
async def get_categories():
    return {"categories": DEFAULT_CATEGORIES}

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
