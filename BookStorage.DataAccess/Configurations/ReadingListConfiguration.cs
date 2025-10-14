using BookStore.Core.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using BookStorage.DataAccess.Entites;

namespace BookStorage.DataAccess.Configurations;

public class ReadingListConfiguration : IEntityTypeConfiguration<ReadingListEntity>
{
    public void Configure(EntityTypeBuilder<ReadingListEntity> builder)
    {
        builder.HasKey(x => x.Id);
        
        builder.Property(x => x.ReadingListName)
            .IsRequired();
        
        builder.Property(x => x.ReadingListDescription)
            .IsRequired();
        
        builder.Property(x => x.IsPublic)
            .IsRequired()
            .HasDefaultValue(true);
        
        builder.Property(x => x.UserId)
            .IsRequired();

        builder.HasOne(rl => rl.User)
            .WithMany()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);
        
        builder.HasIndex(x => x.UserId);
        builder.HasIndex(x => x.IsPublic);
    }
}