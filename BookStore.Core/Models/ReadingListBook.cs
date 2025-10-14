namespace BookStore.Core.Models;

public class ReadingListBook
{
    public Guid ReadingListId { get; }
    public Guid BookId { get; }
    
    private ReadingListBook(Guid readingListId, Guid bookId)
    {
        ReadingListId = readingListId;
        BookId = bookId;
    }

    public static ReadingListBook CreateReadingListBook(Guid readingListId, Guid bookId)
    {
        return new ReadingListBook(readingListId, bookId);
    }
}