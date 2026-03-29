import NextAuth from 'next-auth';
import { UserRole } from '@prisma/client';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      children?: { id: string; name: string | null; email: string | null }[];
      name?: string | null;
      email?: string | null;
      image?: string | null;
      banner?: string | null;
      level?: string | null;
      role: UserRole;
      username?: string | null;
      completedLessonsCount?: string | null;
    };
  }

  interface User {
    role: UserRole;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: UserRole;
  }
}
