from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.orm import declarative_base
import os
import os
from dotenv import load_dotenv

load_dotenv()


engine = create_engine(os.getenv("MYSQL_URL"))

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():

    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()
