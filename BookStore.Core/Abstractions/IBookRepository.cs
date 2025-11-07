using BookStore.Core.Models;

namespace BookStore.Core.Abstractions;

public interface IBookRepository
{
    Task<Guid> CreateBook(Book book, List<Author>? authors);
    Task<Guid> DeleteBook(Guid id);
    Task<List<Book>> GetBook();
    Task<Guid> UpdateBook(Guid id, string title, string description, decimal price, List<Author>? authors);
    Task<List<Book>> GetBookByAuthor(string author);
}