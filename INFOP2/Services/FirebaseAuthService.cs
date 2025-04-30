using Firebase.Auth;
using Microsoft.Extensions.Configuration;
using System.Threading.Tasks;

namespace INFOP2.Services
{
    public class FirebaseAuthService
    {
        private readonly FirebaseAuthProvider _authProvider;
        private readonly IConfiguration _configuration;

        public FirebaseAuthService(IConfiguration configuration)
        {
            _configuration = configuration;
            var apiKey = configuration["Firebase:apiKey"];
            _authProvider = new FirebaseAuthProvider(new FirebaseConfig(apiKey));
        }

        public async Task<string> SignInAsync(string email, string password)
        {
            try
            {
                var auth = await _authProvider.SignInWithEmailAndPasswordAsync(email, password);
                return auth.FirebaseToken;
            }
            catch (FirebaseAuthException ex)
            {
                throw new Exception($"Authentication failed: {ex.Message}");
            }
        }

        public async Task CreateUserAsync(string email, string password)
        {
            try
            {
                await _authProvider.CreateUserWithEmailAndPasswordAsync(email, password);
            }
            catch (FirebaseAuthException ex)
            {
                throw new Exception($"User creation failed: {ex.Message}");
            }
        }
    }
}