using BookStore.Core.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using BookStorage.DataAccess.Entites;

namespace BookStorage.DataAccess.Configurations;

public class ReviewConfiguration : IEntityTypeConfiguration<ReviewEntity>
{
    public void Configure(EntityTypeBuilder<ReviewEntity> builder)
    {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.ReviewText)
            .HasMaxLength(BookReview.MAX_REVIEW_LENGTH);
        
        builder.Property(x => x.Rating)
            .IsRequired()
            .HasAnnotation("Range", new[] { 1, 5 });
        
        builder.Property(x => x.BookId)
            .IsRequired();
        
        builder.Property(x => x.Created)
            .IsRequired()
            .HasDefaultValueSql("datetime('now')");
        
        builder.Property(x => x.Updated)
            .IsRequired(false);
        
        builder.Property(x => x.IsVerified)
            .IsRequired()
            .HasDefaultValue(false);
        
        builder.HasOne(r => r.Book)
            .WithMany()
            .HasForeignKey(r => r.BookId)
            .OnDelete(DeleteBehavior.Cascade);
        
        builder.HasOne(r => r.User)
            .WithMany()
            .HasForeignKey(r => r.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}