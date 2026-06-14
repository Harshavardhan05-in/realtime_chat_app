from pydantic import BaseModel
from datetime import datetime


class UserRegistration(BaseModel):
    username: str
    email: str
    password: str


class UserLogin(BaseModel):
    email: str
    password: str


class SendRequest(BaseModel):
    receiver_id: int


class AcceptRequest(BaseModel):
    request_id: int


class RejectRequest(BaseModel):
    request_id: int


class SendMessage(BaseModel):
    chat_id: int
    message_text: str


class UpdateProfile(BaseModel):
    username: str
    email: str
    profile_photo_url: str | None = None
    password: str | None = None
