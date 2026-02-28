import NextAuth, { type NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { login } from '@/lib/api'

export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email dan password wajib diisi')
        }

        try {
          // Call Laravel API for login
          const response = await login(
            credentials.email as string,
            credentials.password as string
          )

          if (!response || !response.user) {
            throw new Error('Akun tidak ditemukan')
          }

          // Return user data from Laravel response
          return {
            id: response.user.id,
            email: response.user.email,
            name: response.user.name,
            role: response.user.role,
            phone: response.user.phone,
            isVerified: response.user.is_verified || response.user.isVerified,
            image: response.user.avatar,
            token: response.token, // Store token for API calls
          } as any
        } catch (error: any) {
          // Laravel returns error message
          throw new Error(error.message || 'Login gagal')
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
        token.phone = (user as any).phone
        token.isVerified = (user as any).isVerified
        token.token = (user as any).token // Store Laravel token
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.phone = token.phone as string
        session.user.isVerified = token.isVerified as boolean
        ;(session as any).token = token.token // Add token to session
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Redirect to role-based dashboard after login
      if (url === baseUrl || url === `${baseUrl}/`) {
        return `${baseUrl}/dashboard`
      }
      // If URL starts with baseUrl, check if it's a role-based redirect
      if (url.startsWith(baseUrl)) {
        return url
      }
      return baseUrl
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
