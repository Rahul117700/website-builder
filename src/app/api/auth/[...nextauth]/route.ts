import NextAuth from 'next-auth';
import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import GithubProvider from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { compare } from 'bcryptjs';
import{ prisma } from '@/lib/prisma';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID || '',
      clientSecret: process.env.GITHUB_SECRET || '',
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await compare(credentials.password, user.password);

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          preferredCurrency: user.preferredCurrency,
        };
      },
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
  },
  callbacks: {
    async session({ session, token, user }) {
      console.log('=== NextAuth session callback ===');
      console.log('Session input:', session);
      console.log('Token input:', token);
      console.log('User input:', user);
      
      if (session.user && token) {
        session.user.id = token.id;
        session.user.role = token.role;
        
        // Include currency preferences in session
        if (token.preferredCurrency) {
          session.user.preferredCurrency = token.preferredCurrency;
        }
        
        console.log('Session updated with user ID:', session.user.id);
        console.log('Session updated with user role:', session.user.role);
        console.log('Session updated with preferred currency:', session.user.preferredCurrency);
      }
      
      console.log('Final session output:', session);
      return session;
    },
    async jwt({ token, user }) {
      console.log('=== NextAuth JWT callback ===');
      console.log('Token input:', token);
      console.log('User input:', user);
      
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.preferredCurrency = user.preferredCurrency;
        console.log('JWT updated with user ID:', user.id);
        console.log('JWT updated with user role:', user.role);
        console.log('JWT updated with preferred currency:', user.preferredCurrency);
      } else if (!token.role && token.id) {
        console.log('Fetching user role from DB for token ID:', token.id);
        // Fetch user role from DB if not present (for refreshes)
        const dbUser = await prisma.user.findUnique({ where: { id: token.id } });
        console.log('DB user found:', dbUser);
        token.role = dbUser?.role || 'USER';
        token.preferredCurrency = dbUser?.preferredCurrency || 'USD';
        console.log('JWT role set to:', token.role);
        console.log('JWT preferred currency set to:', token.preferredCurrency);
      }
      
      console.log('Final JWT output:', token);
      return token;
    },
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
