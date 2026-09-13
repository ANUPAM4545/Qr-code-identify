import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/infrastructure/db";
import { AuditService } from "@/application/services/AuditService";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    }
  }
}

import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || "a_very_secret_key_12345",
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "dummy",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "dummy",
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;
        const client = await clientPromise;
        const users = client.db().collection("users");
        
        let user = await users.findOne({ email: credentials.email });
        if (!user) {
          const res = await users.insertOne({ 
            email: credentials.email, 
            name: credentials.email.split('@')[0],
            emailVerified: new Date()
          });
          user = await users.findOne({ _id: res.insertedId });
        }
        
        return {
          id: user?._id.toString(),
          email: user?.email,
          name: user?.name,
        } as { id: string; email?: string | null; name?: string | null };
      }
    })
  ],
  session: {
    strategy: "jwt" as const,
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async signIn({ user, account }: any) {
      if (account?.provider === "google" && user?.email) {
        try {
          const client = await clientPromise;
          const db = client.db();
          const users = db.collection("users");
          const accounts = db.collection("accounts");

          let dbUser = await users.findOne({ email: user.email });
          if (!dbUser) {
            const res = await users.insertOne({
              name: user.name || user.email.split("@")[0],
              email: user.email,
              image: user.image || null,
              emailVerified: new Date(),
            });
            dbUser = await users.findOne({ _id: res.insertedId });
          }

          if (dbUser) {
            user.id = dbUser._id.toString();
            const existingAccount = await accounts.findOne({
              provider: "google",
              providerAccountId: account.providerAccountId,
            });

            if (!existingAccount) {
              await accounts.insertOne({
                userId: dbUser._id,
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                access_token: account.access_token || null,
                expires_at: account.expires_at || null,
                token_type: account.token_type || null,
                scope: account.scope || null,
                id_token: account.id_token || null,
              });
            }
          }
        } catch (err) {
          console.error("Error in Google signIn callback:", err);
        }
      }
      return true;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, token }: any) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  events: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async signIn(message: any) {
      if (message.user?.id) {
        await AuditService.log(message.user.id, "USER_LOGIN", { email: message.user.email });
      }
    }
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
