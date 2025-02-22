import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import connectDB from '../../../../app/lib/mongodb';
import User from '../../../../app/models/User';

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
    async signIn({ user, account, profile, credentials }) {
      if (account.provider === "google") {
        try {
          await connectDB();
          
          // Get the role from the credentials
          const role = credentials?.role || 'rider';
          
          // Check if user exists
          const existingUser = await User.findOne({ email: profile.email });
          
          if (!existingUser) {
            // Create new user if doesn't exist
            await User.create({
              name: profile.name,
              email: profile.email,
              image: profile.picture,
              emailVerified: profile.email_verified,
              provider: account.provider,
              role: role,
            });
          } else {
            // Update existing user
            await User.findOneAndUpdate(
              { email: profile.email },
              {
                $set: {
                  name: profile.name,
                  image: profile.picture,
                  emailVerified: profile.email_verified,
                  role: role, // Update role if changed
                }
              }
            );
          }
          
          return true;
        } catch (error) {
          console.error('Database Error:', error);
          return false;
        }
      }
      return true;
    },
    async redirect({ url, baseUrl }) {
      try {
        await connectDB();
        const user = await User.findOne({ email: url.split('=')[1] });
        
        // If user hasn't completed their profile, redirect to user-details page
        if (user && !user.profileCompleted) {
          return `${baseUrl}/user-details`;
        }
        
        // Default redirect to dashboard
        return `${baseUrl}/dashboard`;
      } catch (error) {
        console.error('Redirect Error:', error);
        return baseUrl;
      }
    },
    async session({ session, token }) {
      try {
        await connectDB();
        // Get user from database
        const user = await User.findOne({ email: session.user.email });
        if (user) {
          session.user.id = user._id.toString();
          session.user.provider = user.provider;
          session.user.profileCompleted = user.profileCompleted;
          session.user.role = user.role; // Add role to session
        }
        return session;
      } catch (error) {
        console.error('Session Error:', error);
        return session;
      }
    },
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token;
        token.provider = account.provider;
      }
      return token;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 