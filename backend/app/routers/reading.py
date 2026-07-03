from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from app.database import get_db
from app.models.user import User
from app.models.reading import Book, ReadingSession
from app.schemas.tracking import BookCreate, BookUpdate, BookResponse, ReadingSessionCreate, ReadingSessionResponse
from app.auth import get_current_user

router = APIRouter()


@router.get("/books", response_model=List[BookResponse])
def get_books(
    status: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Book).filter(Book.user_id == current_user.id)
    if status:
        query = query.filter(Book.status == status)
    return query.order_by(Book.created_at.desc()).all()


@router.post("/books", response_model=BookResponse, status_code=201)
def create_book(
    data: BookCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    book = Book(**data.model_dump(), user_id=current_user.id)
    db.add(book)
    db.commit()
    db.refresh(book)
    return book


@router.put("/books/{book_id}", response_model=BookResponse)
def update_book(
    book_id: int,
    data: BookUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    book = db.query(Book).filter(Book.id == book_id, Book.user_id == current_user.id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(book, k, v)
    if book.total_pages > 0:
        book.completion_percent = (book.pages_read / book.total_pages) * 100
    db.commit()
    db.refresh(book)
    return book


@router.delete("/books/{book_id}")
def delete_book(
    book_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    book = db.query(Book).filter(Book.id == book_id, Book.user_id == current_user.id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    db.delete(book)
    db.commit()
    return {"message": "Book deleted"}


@router.post("/sessions", response_model=ReadingSessionResponse, status_code=201)
def create_reading_session(
    data: ReadingSessionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    book = db.query(Book).filter(Book.id == data.book_id, Book.user_id == current_user.id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    session = ReadingSession(**data.model_dump(), user_id=current_user.id)
    db.add(session)
    book.pages_read += data.pages_read
    if book.total_pages > 0:
        book.completion_percent = min((book.pages_read / book.total_pages) * 100, 100)
    db.commit()
    db.refresh(session)
    return session


@router.get("/stats")
def get_reading_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    books = db.query(Book).filter(Book.user_id == current_user.id).all()
    completed = [b for b in books if b.status == "completed"]
    reading = [b for b in books if b.status == "reading"]
    total_pages = sum(b.pages_read for b in books)
    return {
        "total_books": len(books),
        "books_completed": len(completed),
        "currently_reading": len(reading),
        "total_pages_read": total_pages,
    }
