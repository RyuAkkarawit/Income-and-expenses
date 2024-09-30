import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoClient } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env");
}
const client = new MongoClient(process.env.MONGODB_URI);
const dbName = "your-database-name";

interface User {
  email: string;
  
}

export default NextAuth({
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        if (!credentials || !credentials.email || !credentials.password) {
          throw new Error("Invalid credentials");
        }

        await client.connect();
        const db = client.db(dbName);
        const user = await db.collection("users").findOne({ email: credentials.email });

        
        if (user && user.password === credentials.password) {
          return { email: user.email } as User; 
        }

        return null; 
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
});
