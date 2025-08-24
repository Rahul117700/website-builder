import { DefaultSession, DefaultUser } from 'next-auth';
import { JWT, DefaultJWT } from 'next-auth/jwt';

type Plan = {
  id: string;
  name: string;
  price: number;
  duration: string;
  features: string[];
};

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      planId?: string;
      planExpiryDate?: Date;
      plan?: Plan;
      role?: 'USER' | 'SUPER_ADMIN';
      preferredCurrency?: string;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    id: string;
    planId?: string;
    planExpiryDate?: Date;
    password?: string;
    role?: 'USER' | 'SUPER_ADMIN';
    preferredCurrency?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string;
    planId?: string;
    planExpiryDate?: Date;
    role?: 'USER' | 'SUPER_ADMIN';
    preferredCurrency?: string;
  }
}
