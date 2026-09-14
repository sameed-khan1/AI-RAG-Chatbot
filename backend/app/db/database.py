from sqlalchemy import create_engine, Column, String, Integer, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime

DATABASE_URL = "sqlite:///./rag.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


class Document(Base):
    __tablename__ = "documents"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_type = Column(String, nullable=False)
    status = Column(String, default="processing")
    chunk_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)


Base.metadata.create_all(bind=engine)