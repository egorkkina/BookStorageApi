using BookStore.Core.Models;

namespace BookStore.Core.Abstractions;

public interface IReadingListRepository
{
    Task<List<ReadingList>> GetReadingLists();
    Task<ReadingList?> GetReadingListById(Guid id);
    Task<Guid> CreateReadingList(ReadingList readingList);
    Task<Guid> UpdateReadingList(Guid id, string name, string description, bool isPublic);
    Task<Guid> DeleteReadingList(Guid id);
    
    Task<Guid> AddBookToReadingList(Guid readingListId, Guid bookId);
    Task<Guid> RemoveBookFromReadingList(Guid readingListId, Guid bookId);
    Task<List<Guid>> GetBooksInReadingList(Guid readingListId);
    Task<bool> IsBookInReadingList(Guid readingListId, Guid bookId);
}