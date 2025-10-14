using BookStore.Core.Models;

namespace BookStore.Core.Abstractions;

public interface IBookRepository
{
    Task<Guid> CreateBook(Book book);
    Task<Guid> DeleteBook(Guid id);
    Task<List<Book>> GetBook();
    Task<Guid> UpdateBook(Guid id, string title, string description, string author, decimal price);
}