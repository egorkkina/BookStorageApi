using BookStore.Core.Models;
namespace BookStore.Core.Abstractions;

public interface IBookService
{
    Task<Book?> GetBookById(Guid id);
    Task<Guid> CreateBooks(Book book);
    Task<List<Book>> GetAllBooks();
    Task<Guid> UpdateBooks(Guid id, string title, string description, List<Author>? authors, decimal price);
    Task<Guid> DeleteBooks(Guid id);
}