using BookStore.Core.Abstractions;
using BookStore.Core.Models;

namespace BookStorage.Application;

public class ReadingListService(
    IReadingListRepository readingListRepository,
    IBookRepository bookRepository,
    IUserRepository userRepository)
    : IReadingListService
{
    public async Task<List<ReadingList>> GetAllReadingLists()
    {
        return await readingListRepository.GetReadingLists();
    }

    public async Task<ReadingList?> GetReadingListById(Guid id)
    {
        return await readingListRepository.GetReadingListById(id);
    }

    public async Task<List<ReadingList>> GetReadingListsByUser(Guid userId)
    {
        var allLists = await readingListRepository.GetReadingLists();
        return allLists.Where(rl => rl.UserId == userId).ToList();
    }

    public async Task<Guid> CreateReadingList(ReadingList readingList)
    {
        var users = await userRepository.GetUsers();
        var user = users.FirstOrDefault(u => u.Id == readingList.UserId);
        if (user == null)
            throw new KeyNotFoundException($"User with ID {readingList.UserId} not found");
        
        return await readingListRepository.CreateReadingList(readingList);

    }

    public async Task<Guid> UpdateReadingList(Guid id, string name, string description, bool isPublic)
    {
        var existingList = await readingListRepository.GetReadingListById(id);
        if (existingList == null)
            throw new KeyNotFoundException($"Reading list with ID {id} not found");

        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Reading list name is required");

        return await readingListRepository.UpdateReadingList(id, name, description, isPublic);
    }

    public async Task DeleteReadingList(Guid id)
    {
        var existingList = await readingListRepository.GetReadingListById(id);
        if (existingList == null)
            throw new KeyNotFoundException($"Reading list with ID {id} not found");

        await readingListRepository.DeleteReadingList(id);
    }

    public async Task<ReadingList> AddBookToReadingList(Guid readingListId, Guid bookId)
    {
        var readingList = await readingListRepository.GetReadingListById(readingListId);
        if (readingList == null)
            throw new KeyNotFoundException($"Reading list with ID {readingListId} not found");

        var books = await bookRepository.GetBook();
        var book = books.FirstOrDefault(b => b.Id == bookId);
        if (book == null)
            throw new KeyNotFoundException($"Book with ID {bookId} not found");

        if (await readingListRepository.IsBookInReadingList(readingListId, bookId))
            throw new InvalidOperationException("Book is already in the reading list");
        
        await readingListRepository.AddBookToReadingList(readingListId, bookId);

        var updatedList = await readingListRepository.GetReadingListById(readingListId);
        return updatedList!;
    }

    public async Task<ReadingList> RemoveBookFromReadingList(Guid readingListId, Guid bookId)
    {
        var readingList = await readingListRepository.GetReadingListById(readingListId);
        if (readingList == null)
            throw new KeyNotFoundException($"Reading list with ID {readingListId} not found");

        if (!await readingListRepository.IsBookInReadingList(readingListId, bookId))
            throw new InvalidOperationException("Book is not in the reading list");

        await readingListRepository.RemoveBookFromReadingList(readingListId, bookId);

        var updatedList = await readingListRepository.GetReadingListById(readingListId);
        return updatedList!;
    }

    public async Task<List<Book>> GetBooksInReadingList(Guid readingListId)
    {
        var readingList = await readingListRepository.GetReadingListById(readingListId);
        if (readingList == null)
            throw new KeyNotFoundException($"Reading list with ID {readingListId} not found");

        var allBooks = await bookRepository.GetBook();
        var bookIds = readingList.BookIds;

        return allBooks.Where(b => bookIds.Contains(b.Id)).ToList();
    }

    public async Task<bool> IsBookInReadingList(Guid readingListId, Guid bookId)
    {
        return await readingListRepository.IsBookInReadingList(readingListId, bookId);
    }

    public async Task<int> GetReadingListBookCount(Guid readingListId)
    {
        var readingList = await readingListRepository.GetReadingListById(readingListId);
        return readingList?.BookIds.Count ?? 0;
    }
}