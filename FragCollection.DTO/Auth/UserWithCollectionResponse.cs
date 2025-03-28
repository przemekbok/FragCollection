using FragCollection.Core.Models;

namespace FragCollection.DTO.Auth
{
    public class UserWithCollectionResponse
    {
        public Guid Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string CollectionName { get; set; } = string.Empty;
        public string CollectionDescription { get; set; } = string.Empty;
        
        public UserWithCollectionResponse(User user)
        {
            Id = user.Id;
            Username = user.Username;
            CollectionName = user.CollectionName;
            CollectionDescription = user.CollectionDescription;
        }
    }
}