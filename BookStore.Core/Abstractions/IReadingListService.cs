using BookStore.Core.Models;

namespace BookStore.Core.Abstractions;

public interface IReadingListService
{
    Task<List<ReadingList>> GetAllReadingLists();
    Task<ReadingList?> GetReadingListById(Guid id);
    Task<List<ReadingList>> GetReadingListsByUser(Guid userId);
    Task<Guid> CreateReadingList(ReadingList readingList);
    Task<Guid> UpdateReadingList(Guid id, string name, string description, bool isPublic);
    Task DeleteReadingList(Guid id);
    
    // Методы для работы с книгами в списке
    Task<ReadingList> AddBookToReadingList(Guid readingListId, Guid bookId);
    Task<ReadingList> RemoveBookFromReadingList(Guid readingListId, Guid bookId);
    Task<List<Book>> GetBooksInReadingList(Guid readingListId);
    Task<bool> IsBookInReadingList(Guid readingListId, Guid bookId);
    Task<int> GetReadingListBookCount(Guid readingListId);
}