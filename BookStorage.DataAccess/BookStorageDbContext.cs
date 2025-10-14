using BookStorage.DataAccess.Configurations;
using Microsoft.EntityFrameworkCore;
using BookStorage.DataAccess.Entites;

namespace BookStorage.DataAccess;

public class BookStorageDbContext : DbContext
{
    public BookStorageDbContext(DbContextOptions<BookStorageDbContext> options) : base(options)
    {
    }
    public DbSet<BookEntity> Books { get; set; }
    public DbSet<ReviewEntity> Reviews { get; set; }
    public DbSet<UserEntity> Users { get; set; }
    public DbSet<ReadingListEntity> ReadingLists { get; set; }
    public DbSet<ReadingListBookEntity> ReadingListBooks { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfiguration(new BookConfigurations());
        modelBuilder.ApplyConfiguration(new ReviewConfiguration());
        modelBuilder.ApplyConfiguration(new UserConfiguration());
        modelBuilder.ApplyConfiguration(new ReadingListConfiguration());
        modelBuilder.ApplyConfiguration(new ReadingListBookConfiguration());
    }
}