namespace BookStorage.DataAccess.Entites;

public class ReadingListBookEntity
{
    public Guid ReadingListId { get; set; }
    public Guid BookId { get; set; }
    
    public ReadingListEntity ReadingList { get; set; } = null!;
    public BookEntity Book { get; set; } = null!;
}