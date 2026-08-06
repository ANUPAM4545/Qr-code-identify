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
