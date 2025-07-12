using Google.Cloud.Firestore;
using System.Threading.Tasks;
using System.Collections.Generic; // Added for Dictionary

namespace INFOP2.Services
{
    public class FirestoreService
    {
        private readonly FirestoreDb _firestoreDb;

        public FirestoreService(string projectId, string jsonPath)
        {
            Environment.SetEnvironmentVariable("GOOGLE_APPLICATION_CREDENTIALS", jsonPath);
            _firestoreDb = FirestoreDb.Create(projectId);
        }

        public async Task<string> GetUserRoleByEmailAsync(string email)
        {
            var docRef = _firestoreDb.Collection("users").Document(email);
            var snapshot = await docRef.GetSnapshotAsync();
            if (snapshot.Exists && snapshot.ContainsField("role"))
            {
                return snapshot.GetValue<string>("role");
            }
            return "Member"; // Default role
        }

        public async Task EnsureUserDocumentAsync(string email)
        {
            var docRef = _firestoreDb.Collection("users").Document(email);
            var snapshot = await docRef.GetSnapshotAsync();
            if (!snapshot.Exists)
            {
                var userData = new Dictionary<string, object>
                {
                    { "role", "Member" }
                };
                await docRef.SetAsync(userData);
            }
        }

        public async Task CreateUserWithRoleAsync(string uid, string role)
        {
            var docRef = _firestoreDb.Collection("users").Document(uid);
            var userData = new Dictionary<string, object>
            {
                { "role", role }
            };
            await docRef.SetAsync(userData);
        }

        public async Task<int> GetPeopleCountAsync()
        {
            var snapshot = await _firestoreDb.Collection("people").GetSnapshotAsync();
            return snapshot.Count;
        }

        public async Task<int> GetAssetsCountAsync()
        {
            var snapshot = await _firestoreDb.Collection("assets").GetSnapshotAsync();
            return snapshot.Count;
        }

        public async Task<decimal> GetFinanceTotalAsync()
        {
            var snapshot = await _firestoreDb.Collection("transactions").GetSnapshotAsync();
            decimal total = 0;
            foreach (var doc in snapshot.Documents)
            {
                var data = doc.ToDictionary();
                if (data.TryGetValue("Category", out var categoryObj) && data.TryGetValue("Amount", out var amountObj))
                {
                    string category = categoryObj?.ToString();
                    decimal amount = Convert.ToDecimal(amountObj);
                    if (category == "Income")
                        total += amount;
                    else if (category == "Expense")
                        total -= amount;
                }
            }
            return total;
        }
    }
} 