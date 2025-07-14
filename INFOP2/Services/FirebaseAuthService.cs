using Firebase.Auth;
using Microsoft.Extensions.Configuration;
using System.Threading.Tasks;

namespace INFOP2.Services
{
    using System;

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

        public async Task<string> RegisterAsync(string email, string password)
        {
            try
            {
                var auth = await _authProvider.CreateUserWithEmailAndPasswordAsync(email, password, null, true);
                return auth.User.LocalId; // Firebase UID
            }
            catch (FirebaseAuthException ex)
            {
                throw new Exception($"Registration failed: {ex.Message}");
            }
        }

        public async Task<string> SignInWithGoogleAsync(string idToken)
        {
            try
            {
                var auth = await _authProvider.SignInWithOAuthAsync(FirebaseAuthType.Google, idToken);
                return auth.FirebaseToken;
            }
            catch (FirebaseAuthException ex)
            {
                throw new Exception($"Google authentication failed: {ex.Message}");
            }
        }
    }
}