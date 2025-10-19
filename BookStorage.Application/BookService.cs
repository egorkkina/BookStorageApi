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

        if (book.Price < 0)
            throw new ArgumentException("Price cannot be negative");

        var authors = book.Authors ?? new List<Author>();
        return await _bookRepository.CreateBook(book, authors);
    }

    public async Task<Guid> UpdateBooks(Guid id, string title, string description, List<Author>? authors, decimal price)
    {
        var existingBook = await GetBookById(id);
        if (existingBook == null)
            throw new KeyNotFoundException($"Book with ID {id} not found");

        if (string.IsNullOrWhiteSpace(title))
            throw new ArgumentException("Title is required");

        if (price < 0)
            throw new ArgumentException("Price cannot be negative");
        
        authors ??= new List<Author>();

        return await _bookRepository.UpdateBook(id, title, description, price, authors);
    }

    public async Task<Guid> DeleteBooks(Guid id)
    {
        return await _bookRepository.DeleteBook(id);
    }
}