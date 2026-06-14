from database import Base
from database import engine, get_db
from fastapi import FastAPI, Depends, HTTPException
from schemas import (
    UserRegistration,
    UserLogin,
    SendRequest,
    AcceptRequest,
    RejectRequest,
    SendMessage,
    UpdateProfile,
)
from models import Users, FreindRequests, Chats, ChatMembers, Messages, Notifications
from sqlalchemy import or_, and_, case
from passlib.context import CryptContext
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta
from jose import jwt, JWTError
from fastapi.security import OAuth2PasswordBearer
from fastapi import WebSocket, WebSocketDisconnect
from connection_manager import manager
from fastapi.middleware.cors import CORSMiddleware
from fastapi import UploadFile, File
import cloudinary.uploader
import cloudinary_config


import bcrypt

# Patch missing __about__ for Passlib
if not hasattr(bcrypt, "__about__"):

    class About:
        __version__ = bcrypt.__version__

    bcrypt.__about__ = About()

Base.metadata.create_all(bind=engine)

app = FastAPI()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

load_dotenv()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://realtime-chat-app-sand-kappa.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def verify_token(token, db):
    try:
        payload = jwt.decode(token, os.getenv("SECRET_KEY"), algorithms=["HS256"])
        u_id = payload.get("sub")
        u_id = int(u_id)

        if u_id is None:
            raise HTTPException(status_code=401, detail="USER NOT FOUND")
        else:
            user = db.query(Users).filter(Users.user_id == u_id).first()

            if user is None:
                raise HTTPException(status_code=401, detail="NOT AUHTORIZED")
            else:
                return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid Token")
    # except Exception as e:
    #     print(e)
    #     raise HTTPException(status_code=401, detail="Invalid Token")


def get_current_user(token: str = Depends(oauth2_scheme), db=Depends(get_db)):
    return verify_token(token, db)


@app.post("/register")
def create_user(user: UserRegistration, db=Depends(get_db)):
    dup_user = (
        db.query(Users)
        .filter(or_(Users.username == user.username, Users.email == user.email))
        .first()
    )

    if dup_user is None:
        hashpass = pwd_context.hash(user.password)
        new_user = Users(
            username=user.username,
            email=user.email,
            password=hashpass,
            is_online=False,
            last_seen=datetime.now(),
            registered_at=datetime.now(),
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return {"MSG": "SUCESSFULL"}

    else:
        raise HTTPException(status_code=409, detail="USER ALREADY EXIST")


def create(u_id):
    expire = datetime.utcnow() + timedelta(minutes=30)
    payload = {"sub": str(u_id), "exp": expire}

    return jwt.encode(payload, os.getenv("SECRET_KEY"), algorithm="HS256")


@app.post("/login")
def user_login(user: UserLogin, db=Depends(get_db)):
    u = db.query(Users).filter(Users.email == user.email).first()

    if u is None:
        raise HTTPException(status_code=404, detail="USER NOT FOUND")
    elif not pwd_context.verify(user.password, u.password):
        raise HTTPException(status_code=401, detail="INVALID CREDENTIALS")
    else:
        u.is_online = True
        db.commit()
        token = create(u.user_id)
        return {"access_token": token}


@app.get("/profile")
def profile(user=Depends(get_current_user)):
    return {
        "id": user.user_id,
        "username": user.username,
        "profile_photo_url": user.profile_photo_url,
        "email": user.email,
        "registered_at": user.registered_at,
    }


@app.post("/sendrequest")
async def send_request(
    user_req: SendRequest, user=Depends(get_current_user), db=Depends(get_db)
):
    sender_id = user.user_id
    rec_id = user_req.receiver_id

    user_rec = db.query(Users).filter(Users.user_id == rec_id).first()

    dup_request = (
        db.query(FreindRequests)
        .filter(
            and_(
                FreindRequests.sender_id == sender_id,
                FreindRequests.receiver_id == rec_id,
                FreindRequests.status == "pending",
            )
        )
        .first()
    )

    if user_rec is None:
        raise HTTPException(status_code=404, detail="User Not Exist")
    elif sender_id == rec_id:
        raise HTTPException(status_code=400, detail="Invalid Request")
    elif dup_request is not None:
        raise HTTPException(status_code=409, detail="REQUEST ALREADY EXIST")
    else:
        new_req = FreindRequests(
            sender_id=sender_id,
            receiver_id=rec_id,
            status="pending",
            created_at=datetime.now(),
        )

        db.add(new_req)

        notif = Notifications(
            receiver_id=user_rec.user_id,
            sender_id=user.user_id,
            type="friend_request",
            message=f"{user.username} sent you a freind request!",
            is_read=False,
            created_at=datetime.now(),
        )

        db.add(notif)

        await manager.send_personal_message(rec_id, {"type": "notification"})

        db.commit()

        return {"MSG": "REQUEST SENT"}


@app.get("/requests")
def get_requests(user=Depends(get_current_user), db=Depends(get_db)):
    uid = user.user_id

    results = (
        db.query(
            Users.user_id,
            Users.username,
            Users.profile_photo_url,
            FreindRequests.request_id,
        )
        .join(Users, Users.user_id == FreindRequests.sender_id)  # join sender → user
        .filter(
            and_(FreindRequests.receiver_id == uid, FreindRequests.status == "pending")
        )  # condition
        .all()
    )

    return [
        {
            "user_id": r[0],
            "username": r[1],
            "profile_photo_url": r[2],
            "request_id": r[3],
        }
        for r in results
    ]


@app.post("/acceptrequest")
async def accept_request(
    userreq: AcceptRequest, db=Depends(get_db), user=Depends(get_current_user)
):
    req_id = userreq.request_id

    req = db.query(FreindRequests).filter(FreindRequests.request_id == req_id).first()

    if req is None:
        raise HTTPException(status_code=404, detail="Request Not Found")
    elif req.receiver_id != user.user_id:
        raise HTTPException(status_code=401, detail="REQUEST IS NOO LONGER PENDING")
    elif req.status != "pending":
        raise HTTPException(status_code=400, detail="Request Already Accepted")
    else:
        req.status = "accepted"

        new_chat = Chats(
            created_by=req.receiver_id, is_group=False, created_at=datetime.now()
        )

        db.add(new_chat)
        db.flush()
        user1 = ChatMembers(
            chat_id=new_chat.chat_id, user_id=req.sender_id, joined_at=datetime.now()
        )
        user2 = ChatMembers(
            chat_id=new_chat.chat_id, user_id=req.receiver_id, joined_at=datetime.now()
        )

        db.add(user1)
        db.add(user2)

        notif = Notifications(
            receiver_id=req.sender_id,
            sender_id=req.receiver_id,
            type="friend_request_accepted",
            message=f"{user.username} accepted your freind request",
            is_read=False,
            created_at=datetime.now(),
        )

        db.add(notif)

        db.commit()

        await manager.send_personal_message(req.sender_id, {"type": "notification"})

        return {"msg": "Request Accepted"}


@app.post("/rejectrequest")
def reject_request(
    userreq: RejectRequest, db=Depends(get_db), user=Depends(get_current_user)
):
    req_id = userreq.request_id

    req = db.query(FreindRequests).filter(FreindRequests.request_id == req_id).first()

    if req is None:
        raise HTTPException(status_code=404, detail="Request Not Found")
    elif req.receiver_id != user.user_id:
        raise HTTPException(status_code=401, detail="REQUEST IS NOO LONGER PENDING")
    elif req.status != "pending":
        raise HTTPException(status_code=400, detail="Request Already Rejcted")
    else:
        req.status = "rejected"

        db.commit()

        return {"msg": "Request Rejected"}


@app.get("/chats")
def get_chats(user=Depends(get_current_user), db=Depends(get_db)):

    uid = user.user_id

    results = (
        db.query(
            Users.user_id,
            Users.username,
            Users.profile_photo_url,
            ChatMembers.chat_id,
        )
        .join(
            ChatMembers,
            Users.user_id == ChatMembers.user_id,
        )
        .filter(
            ChatMembers.chat_id.in_(
                db.query(ChatMembers.chat_id).filter(ChatMembers.user_id == uid)
            ),
            Users.user_id != uid,
        )
        .all()
    )

    chats = []

    for r in results:
        last_msg = (
            db.query(Messages)
            .filter(Messages.chat_id == r.chat_id)
            .order_by(Messages.sent_at.desc())
            .first()
        )

        unread_count = (
            db.query(Messages)
            .filter(
                Messages.chat_id == r.chat_id,
                Messages.sender_id != uid,
                Messages.is_read == False,
            )
            .count()
        )

        chats.append(
            {
                "user_id": r.user_id,
                "username": r.username,
                "profile_photo_url": r.profile_photo_url,
                "chat_id": r.chat_id,
                "last_message_time": (last_msg.sent_at if last_msg else None),
                "unread_count": unread_count,
            }
        )

        chats.sort(
            key=lambda x: (x["last_message_time"] is not None, x["last_message_time"]),
            reverse=True,
        )

    return chats


@app.post("/sendmessage")
async def send_message(
    msg: SendMessage, user=Depends(get_current_user), db=Depends(get_db)
):
    chatid = msg.chat_id
    text = msg.message_text
    uid = user.user_id

    chat = db.query(Chats).filter(Chats.chat_id == chatid).first()

    if chat is None:
        raise HTTPException(status_code=404, detail="Chat Not Found")
    else:
        valid_user = (
            db.query(ChatMembers)
            .filter(and_(ChatMembers.chat_id == chatid, ChatMembers.user_id == uid))
            .first()
        )

        if valid_user is None:
            raise HTTPException(status_code=401, detail="Not Accesable")
        elif len(text.strip()) == 0:
            raise HTTPException(status_code=400, detail="TEXT EMPTY")
        else:
            new_msg = Messages(
                chat_id=chatid,
                sender_id=uid,
                message_text=text,
                sent_at=datetime.now(),
                is_read=False,
            )

            db.add(new_msg)

            db.commit()

            db.refresh(new_msg)

            result = (
                db.query(ChatMembers)
                .filter(and_(ChatMembers.chat_id == chatid, ChatMembers.user_id != uid))
                .first()
            )

            payload = {
                "msg_id": new_msg.msg_id,
                "chat_id": chatid,
                "sender_id": uid,
                "message_text": text,
                "sent_at": str(new_msg.sent_at),
                "is_read": False,
            }

            await manager.send_personal_message(result.user_id, payload)

            return {
                "msg_id": new_msg.msg_id,
                "chat_id": new_msg.chat_id,
                "sender_id": new_msg.sender_id,
                "message_text": new_msg.message_text,
                "sent_at": str(new_msg.sent_at),
                "is_read": False,
            }


@app.get("/messages/{chat_id}")
async def get_messages(chat_id, user=Depends(get_current_user), db=Depends(get_db)):

    chat = db.query(Chats).filter(Chats.chat_id == chat_id).first()

    if chat is None:
        raise HTTPException(status_code=404, detail="Chat Not Found")
    else:
        valid_mem = (
            db.query(ChatMembers)
            .filter(
                and_(
                    ChatMembers.chat_id == chat_id, ChatMembers.user_id == user.user_id
                )
            )
            .first()
        )

        if valid_mem is None:
            raise HTTPException(status_code=401, detail="Not Permitted")
        else:
            result = (
                db.query(Messages)
                .filter(Messages.chat_id == chat_id)
                .order_by(Messages.sent_at.asc())
                .all()
            )

            (
                db.query(Messages)
                .filter(Messages.chat_id == chat_id, Messages.sender_id != user.user_id)
                .update({"is_read": True})
            )

            db.commit()

            result2 = (
                db.query(ChatMembers)
                .filter(
                    and_(
                        ChatMembers.chat_id == chat_id,
                        ChatMembers.user_id != user.user_id,
                    )
                )
                .first()
            )

            await manager.send_personal_message(
                result2.user_id, {"type": "seen", "chat_id": chat_id}
            )

            return [
                {
                    "msg_id": m.msg_id,
                    "sender_id": m.sender_id,
                    "message_text": m.message_text,
                    "sent_at": m.sent_at,
                    "is_read": m.is_read,
                }
                for m in result
            ]


@app.get("/status/{userid}")
def getUserStatus(userid: int, db=Depends(get_db)):

    user = db.query(Users).filter(Users.user_id == userid).first()

    if user is None:
        raise HTTPException(status_code=404, detail="User Not Found Exception")
    else:
        return {"is_online": user.is_online, "last_seen": user.last_seen}


@app.get("/findusers")
def send_friend_request(user=Depends(get_current_user), db=Depends(get_db)):

    u = db.query(Users).filter(Users.user_id == user.user_id).first()

    if u is None:
        raise HTTPException(status_code=401, detail="User Not Found")
    else:
        excluded_users = db.query(
            case(
                (FreindRequests.sender_id == u.user_id, FreindRequests.receiver_id),
                else_=FreindRequests.sender_id,
            )
        ).filter(
            or_(
                FreindRequests.sender_id == u.user_id,
                FreindRequests.receiver_id == u.user_id,
            ),
            FreindRequests.status.in_(["accepted", "pending"]),
        )

        results = (
            db.query(Users.user_id, Users.username, Users.profile_photo_url)
            .filter(Users.user_id != u.user_id)
            .filter(~Users.user_id.in_(excluded_users))
            .all()
        )

        return [
            {
                "user_id": u.user_id,
                "username": u.username,
                "profile_photo_url": u.profile_photo_url,
            }
            for u in results
        ]


@app.get("/notifications")
def get_notifications(user=Depends(get_current_user), db=Depends(get_db)):

    u = db.query(Users).filter(Users.user_id == user.user_id).first()

    if u is None:
        raise HTTPException(status_code=401, detail="No Access")
    else:
        db.query(Notifications).filter(
            and_(Notifications.receiver_id == u.user_id, Notifications.is_read == False)
        ).update({"is_read": True}, synchronize_session=False)

        db.commit()

        result = (
            db.query(Notifications)
            .filter(Notifications.receiver_id == u.user_id)
            .order_by(Notifications.created_at.desc())
            .all()
        )

        return [
            {
                "notification_id": n.notification_id,
                "message": n.message,
                "type": n.type,
                "is_read": n.is_read,
                "created_at": n.created_at,
            }
            for n in result
        ]


@app.get("/notificationcount")
def get_notification_count(user=Depends(get_current_user), db=Depends(get_db)):

    count = (
        db.query(Notifications)
        .filter(
            and_(
                Notifications.receiver_id == user.user_id,
                Notifications.is_read == False,
            )
        )
        .count()
    )

    return {"count": count}


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, db=Depends(get_db)):
    token = websocket.query_params.get("token")

    if token is None:
        await websocket.close()
        return

    try:
        user = verify_token(token, db)

        user.is_online = True
        db.commit()
        await manager.connect(user.user_id, websocket)

        while True:
            data = await websocket.receive_json()
            if data["type"] == "typing":
                result = (
                    db.query(ChatMembers)
                    .filter(
                        and_(
                            ChatMembers.chat_id == data["chat_id"],
                            ChatMembers.user_id != user.user_id,
                        )
                    )
                    .first()
                )

                await manager.send_personal_message(
                    result.user_id,
                    {
                        "type": "typing",
                        "sender_id": user.user_id,
                    },
                )

    except WebSocketDisconnect:
        user.is_online = False
        user.last_seen = datetime.now()
        db.commit()
        manager.disconnect(user.user_id, websocket)


@app.post("/uploadprofilephoto")
async def upload_profile_photo(file: UploadFile = File(...)):

    result = cloudinary.uploader.upload(
        file.file,
        folder="chat_app_profiles",
        width=400,
        height=400,
        crop="fill",
        gravity="face",
        quality="auto",
        fetch_format="auto",
    )

    return {"image_url": result["secure_url"]}


@app.put("/updateprofile")
def update_profile(
    user_req: UpdateProfile,
    user=Depends(get_current_user),
    db=Depends(get_db),
):

    u = db.query(Users).filter(Users.user_id == user.user_id).first()

    if u is None:
        raise HTTPException(status_code=404, detail="User Not Found")

    u.username = user_req.username
    u.email = user_req.email
    u.profile_photo_url = user_req.profile_photo_url

    if user_req.password is not None and user_req.password.strip() != "":
        hashed_password = pwd_context.hash(user_req.password)

        u.password = hashed_password

    db.commit()

    db.refresh(u)

    return {"msg": "Profile Updated Successfully"}
