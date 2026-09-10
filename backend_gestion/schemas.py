from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional


# --- Auth ---
class UserCreate(BaseModel):
    username: str
    password: str
    full_name: Optional[str] = None

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserOut(BaseModel):
    id: int
    username: str
    full_name: Optional[str] = None
    is_active: bool

    class Config:
        from_attributes = True


# --- Members ---
class MemberCreate(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    role: str = "fidele"

class MemberOut(BaseModel):
    id: int
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    role: str
    active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# --- Prayer Times ---
class PrayerTimeCreate(BaseModel):
    name: str
    time_hour: int
    time_minute: int
    iqama_hour: Optional[int] = None
    iqama_minute: Optional[int] = None

class PrayerTimeUpdate(BaseModel):
    time_hour: Optional[int] = None
    time_minute: Optional[int] = None
    iqama_hour: Optional[int] = None
    iqama_minute: Optional[int] = None
    active: Optional[bool] = None

class PrayerTimeOut(BaseModel):
    id: int
    name: str
    time_hour: int
    time_minute: int
    iqama_hour: Optional[int] = None
    iqama_minute: Optional[int] = None
    active: bool
    updated_at: datetime

    class Config:
        from_attributes = True


# --- Announcements ---
class AnnouncementCreate(BaseModel):
    title: str
    content: str
    category: str = "general"
    published: bool = True
    author_id: Optional[int] = None

class AnnouncementUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    category: Optional[str] = None
    published: Optional[bool] = None

class AnnouncementOut(BaseModel):
    id: int
    title: str
    content: str
    category: str
    published: bool
    created_at: datetime
    author_id: Optional[int] = None

    class Config:
        from_attributes = True


# --- Finances ---
class FinanceCreate(BaseModel):
    type: str  # recette / depense
    category: str
    description: Optional[str] = None
    amount: float
    recorded_by: Optional[int] = None

class FinanceOut(BaseModel):
    id: int
    type: str
    category: str
    description: Optional[str] = None
    amount: float
    date: datetime
    recorded_by: Optional[int] = None

    class Config:
        from_attributes = True


# --- Events ---
class EventCreate(BaseModel):
    title: str
    description: Optional[str] = None
    location: Optional[str] = None
    start_date: datetime
    end_date: Optional[datetime] = None
    recurring: bool = False
    recurrence_rule: Optional[str] = None
    max_attendees: Optional[int] = None
    created_by: Optional[int] = None

class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    recurring: Optional[bool] = None
    max_attendees: Optional[int] = None

class EventOut(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    location: Optional[str] = None
    start_date: datetime
    end_date: Optional[datetime] = None
    recurring: bool
    recurrence_rule: Optional[str] = None
    max_attendees: Optional[int] = None
    created_by: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True


# --- Dashboard ---
class DashboardStats(BaseModel):
    members_count: int
    announcements_count: int
    events_count: int
    total_recettes: float
    total_depenses: float
    solde: float
