from sqlalchemy import (
    Column,
    String,
    Integer,
    Boolean,
    DateTime,
    ForeignKey,
    PrimaryKeyConstraint,
    Text,
)
from database import Base


class Users(Base):
    __tablename__ = "users"
    user_id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(250), unique=True)
    email = Column(String(250), unique=True)
    password = Column(String(250))
    profile_photo_url = Column(String(250))
    is_online = Column(Boolean)
    last_seen = Column(DateTime)
    registered_at = Column(DateTime)


class FreindRequests(Base):
    __tablename__ = "requests"
    request_id = Column(Integer, primary_key=True, autoincrement=True)
    sender_id = Column(Integer, ForeignKey("users.user_id"))
    receiver_id = Column(Integer, ForeignKey("users.user_id"))
    status = Column(String(250))
    created_at = Column(DateTime)
    accepted_at = Column(DateTime)


class Chats(Base):
    __tablename__ = "chats"

    chat_id = Column(Integer, primary_key=True, autoincrement=True)
    created_by = Column(Integer, ForeignKey("users.user_id"))
    is_group = Column(Boolean)
    created_at = Column(DateTime)


class ChatMembers(Base):
    __tablename__ = "chat_members"

    chat_id = Column(Integer, ForeignKey("chats.chat_id"))
    user_id = Column(Integer, ForeignKey("users.user_id"))
    joined_at = Column(DateTime)

    __table_args__ = (PrimaryKeyConstraint("user_id", "chat_id"),)


class Messages(Base):
    __tablename__ = "messages"

    msg_id = Column(Integer, primary_key=True, autoincrement=True)
    chat_id = Column(Integer, ForeignKey("chats.chat_id"))
    sender_id = Column(Integer, ForeignKey("users.user_id"))
    message_text = Column(Text)
    sent_at = Column(DateTime)
    is_read = Column(Boolean)


class Notifications(Base):
    __tablename__ = "notifications"

    notification_id = Column(Integer, primary_key=True, autoincrement=True)
    receiver_id = Column(Integer, ForeignKey("users.user_id"))
    sender_id = Column(Integer, ForeignKey("users.user_id"))
    type = Column(String(200))
    message = Column(String(250))
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime)
