using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FragCollection.DAL.Migrations
{
    /// <inheritdoc />
    public partial class ModelsRefactor : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PerfumeEntries_Collections_CollectionId",
                table: "PerfumeEntries");

            migrationBuilder.RenameColumn(
                name: "CollectionId",
                table: "PerfumeEntries",
                newName: "UserId");

            migrationBuilder.RenameIndex(
                name: "IX_PerfumeEntries_CollectionId",
                table: "PerfumeEntries",
                newName: "IX_PerfumeEntries_UserId");

            migrationBuilder.AddColumn<string>(
                name: "CollectionDescription",
                table: "Users",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "CollectionName",
                table: "Users",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddForeignKey(
                name: "FK_PerfumeEntries_Users_UserId",
                table: "PerfumeEntries",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PerfumeEntries_Users_UserId",
                table: "PerfumeEntries");

            migrationBuilder.DropColumn(
                name: "CollectionDescription",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "CollectionName",
                table: "Users");

            migrationBuilder.RenameColumn(
                name: "UserId",
                table: "PerfumeEntries",
                newName: "CollectionId");

            migrationBuilder.RenameIndex(
                name: "IX_PerfumeEntries_UserId",
                table: "PerfumeEntries",
                newName: "IX_PerfumeEntries_CollectionId");

            migrationBuilder.AddForeignKey(
                name: "FK_PerfumeEntries_Collections_CollectionId",
                table: "PerfumeEntries",
                column: "CollectionId",
                principalTable: "Collections",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
