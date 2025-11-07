using BookStore.Core.Abstractions;
using BookStore.Core.Models;

namespace BookStorage.Application;

public class BookService(IBookRepository bookRepository) : IBookService
{
    public async Task<List<Book>> GetAllBooks()
    {
        return await bookRepository.GetBook();
    }
    
    public async Task<Book?> GetBookById(Guid id)
    {
        var books = await bookRepository.GetBook();
        return books.FirstOrDefault(b => b.Id == id);
    }
    
    public async Task<List<Book>> GetBookByAuthor(string author)
    {
        return await bookRepository.GetBookByAuthor(author);
    }

    public async Task<Guid> CreateBooks(string title, string description, decimal price, List<string>? authorNames)
    {
        var authors = authorNames?
                          .Select(a =>
                          {
                              var (author, authorError) = Author.Create(Guid.NewGuid(), a);
                              if (!string.IsNullOrEmpty(authorError))
                                  throw new ArgumentException($"Invalid author '{a}': {authorError}");
                              return author;
                          })
                          .ToList() 
                      ?? new List<Author>();
        
        var (book, error) = Book.Create(Guid.NewGuid(), title, description, price, authors);
        if (!string.IsNullOrEmpty(error))
            throw new ArgumentException(error);

        return await bookRepository.CreateBook(book, authors);
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
        
        authors ??= [];

        return await bookRepository.UpdateBook(id, title, description, price, authors);
    }

    public async Task<Guid> DeleteBooks(Guid id)
    {
        var existingBook = await GetBookById(id);
        if (existingBook == null)
            throw new KeyNotFoundException($"Book with ID {id} not found");

        await bookRepository.DeleteBook(id);
        return id;
    }

}