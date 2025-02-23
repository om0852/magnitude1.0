import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { connectDB } from '../../../lib/mongodb';
import User from '../../../models/User';

const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "select_account"
        }
      }
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV === 'development',
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account.provider === "google") {
        try {
          await connectDB();
          
          // Check if user exists
          let existingUser = await User.findOne({ email: profile.email });
          
          if (!existingUser) {
            // Create new user if doesn't exist
            existingUser = await User.create({
              name: profile.name,
              email: profile.email,
              image: profile.picture,
              emailVerified: profile.email_verified,
              provider: account.provider,
              role: 'rider', // Default role
              profileCompleted: false
            });
          }
          
          // Always return true to allow sign in
          return true;
        } catch (error) {
          console.error('Database Error:', error);
          // Still return true to allow sign in even if DB operation fails
          return true;
        }
      }
      return true;
    },
    
    async redirect({ url, baseUrl }) {
      // Always allow callback URLs on the same origin
      if (url.startsWith(baseUrl)) {
        return url;
      }
      // Allow redirects to relative URLs
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      return baseUrl;
    },

    async session({ session, token }) {
      if (session?.user) {
        try {
          await connectDB();
          // Get user from database
          const user = await User.findOne({ email: session.user.email });
          if (user) {
            session.user.id = user._id.toString();
            session.user.role = user.role || 'rider';
            session.user.profileCompleted = user.profileCompleted || false;
          }
        } catch (error) {
          console.error('Session Error:', error);
        }
      }
      return session;
    },

    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token;
        token.provider = account.provider;
      }
      return token;
    },
  },
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }; 