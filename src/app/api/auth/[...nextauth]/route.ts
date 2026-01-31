import NextAuth from 'next-auth';
import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import GithubProvider from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { compare } from 'bcryptjs';
import { prisma } from '@/lib/prisma';

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
          role: user.role,
          // preferredCurrency: user.preferredCurrency, // TODO: Add this field to User model
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
    async redirect({ url, baseUrl }) {
      // If url is a relative URL, make it absolute
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      // If url is on the same origin, allow it
      if (new URL(url).origin === baseUrl) {
        return url;
      }
      // Otherwise, redirect to baseUrl
      return baseUrl;
    },
    async session({ session, token, user }) {
      console.log('=== NextAuth session callback ===');
      console.log('Session input:', session);
      console.log('Token input:', token);
      console.log('User input:', user);

      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.role = token.role as any;
        session.user.email = (token.email as string) || session.user.email;
        session.user.name = (token.name as string) || session.user.name;
        session.user.image = (token.picture as string) || session.user.image;

        console.log('Session updated with user ID:', session.user.id);
        console.log('Session updated with user role:', session.user.role);
        console.log('Session updated with user email:', session.user.email);
        console.log('Session updated with user image:', session.user.image);
      }

      console.log('Final session output:', session);
      return session;
    },
    async jwt({ token, user, trigger, session }) {
      console.log('=== NextAuth JWT callback ===');
      console.log('Token input:', token);
      console.log('User input:', user);

      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
        console.log('JWT updated with user ID:', user.id);
      } else if (trigger === 'update' && session?.user?.image) {
        // Handle session update
        token.picture = session.user.image;
        console.log('JWT updated via session update with image:', token.picture);
      } else if (!token.role && token.id) {
        console.log('Fetching user role from DB for token ID:', token.id);
        const dbUser = await prisma.user.findUnique({ where: { id: token.id as string } });
        console.log('DB user found:', dbUser);
        if (dbUser) {
          token.role = dbUser.role || 'USER';
          token.email = dbUser.email;
          token.name = dbUser.name;
          token.picture = dbUser.image;
        }
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
