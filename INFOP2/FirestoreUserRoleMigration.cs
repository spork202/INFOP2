using Google.Cloud.Firestore;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace INFOP2
{
    /// <summary>
    /// Migration script to standardize Firestore user roles and document keys.
    /// Usage: Run as a .NET console app or from a one-off entry point.
    /// </summary>
    public class FirestoreUserRoleMigration
    {
        private static FirestoreDb _firestoreDb;

        public static async Task RunAsync()
        {
            // TODO: Set your Firestore project ID and credentials path
            string projectId = "your-project-id";
            string credentialsPath = "Credentials/firebase-key.json";
            Environment.SetEnvironmentVariable("GOOGLE_APPLICATION_CREDENTIALS", credentialsPath);
            _firestoreDb = FirestoreDb.Create(projectId);

            var usersRef = _firestoreDb.Collection("users");
            var snapshot = await usersRef.GetSnapshotAsync();

            foreach (var doc in snapshot.Documents)
            {
                var data = doc.ToDictionary();
                string email = doc.Id;
                string role = data.ContainsKey("role") ? data["role"].ToString() : "User";

                // Standardize role
                if (role.ToLower() == "admin")
                    role = "Admin";
                else if (role.ToLower() == "user")
                    role = "User";
                else
                    role = "User"; // Default

                // If the document key is not an email, try to find the email field in the data
                if (!email.Contains("@") && data.ContainsKey("email"))
                {
                    string actualEmail = data["email"].ToString();
                    // Copy to new doc keyed by email
                    var newDocRef = usersRef.Document(actualEmail);
                    data["role"] = role;
                    await newDocRef.SetAsync(data);
                    await doc.Reference.DeleteAsync();
                    Console.WriteLine($"Moved user {actualEmail} and set role to {role}");
                }
                else
                {
                    // Just update the role if needed
                    await doc.Reference.UpdateAsync("role", role);
                    Console.WriteLine($"Updated user {email} role to {role}");
                }
            }

            Console.WriteLine("Migration complete.");
        }
    }
} 