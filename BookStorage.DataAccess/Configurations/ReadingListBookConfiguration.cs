using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using BookStorage.DataAccess.Entites;
using BookStore.Core.Models;

namespace BookStorage.DataAccess.Configurations;

public class ReadingListBookConfiguration : IEntityTypeConfiguration<ReadingListBookEntity>
{
    public void Configure(EntityTypeBuilder<ReadingListBookEntity> builder)
    {
        builder.HasKey(r => new { r.ReadingListId, r.BookId });
        
        builder.HasOne(rlb => rlb.ReadingList)
            .WithMany(rl => rl.ReadingListBooks)
            .HasForeignKey(rlb => rlb.ReadingListId)
            .OnDelete(DeleteBehavior.Cascade);
        
        builder.HasOne(rlb => rlb.Book)
            .WithMany(b => b.ReadingListBooks)
            .HasForeignKey(rlb => rlb.BookId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}