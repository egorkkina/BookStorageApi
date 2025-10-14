using BookStore.Core.Abstractions;
using BookStore.Core.Models;

namespace BookStorage.Application;

public class BookService : IBookService
{
    private readonly IBookRepository _bookRepository;
    
    public BookService(IBookRepository bookRepository)
    {
        _bookRepository = bookRepository;
    }

    public async Task<List<Book>> GetAllBooks()
    {
        return await _bookRepository.GetBook();
    }
    
    public async Task<Book?> GetBookById(Guid id)
    {
        var books = await _bookRepository.GetBook();
        return books.FirstOrDefault(b => b.Id == id);
    }

    public async Task<Guid> CreateBooks(Book book)
    {
        if (string.IsNullOrWhiteSpace(book.Title))
            throw new ArgumentException("Title is required");

        if (string.IsNullOrWhiteSpace(book.Author))
            throw new ArgumentException("Author is required");

        if (book.Price < 0)
            throw new ArgumentException("Price cannot be negative");

        return await _bookRepository.CreateBook(book);
    }

    public async Task<Guid> UpdateBooks(Guid id, string title, string description, string author, decimal price)
    {
        var existingBook = await GetBookById(id);
        if (existingBook == null)
            throw new KeyNotFoundException($"Book with ID {id} not found");

        if (string.IsNullOrWhiteSpace(title))
            throw new ArgumentException("Title is required");

        if (string.IsNullOrWhiteSpace(author))
            throw new ArgumentException("Author is required");

        if (price < 0)
            throw new ArgumentException("Price cannot be negative");

        return await _bookRepository.UpdateBook(id, title, description, author, price);
    }

    public async Task<Guid> DeleteBooks(Guid id)
    {
        return await _bookRepository.DeleteBook(id);
    }
}