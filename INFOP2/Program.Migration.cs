using System.Threading.Tasks;

namespace INFOP2
{
    public class Program
    {
        public static async Task Main(string[] args)
        {
            await FirestoreUserRoleMigration.RunAsync();
        }
    }
} 