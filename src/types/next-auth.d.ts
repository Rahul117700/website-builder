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
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    id: string;
    planId?: string;
    planExpiryDate?: Date;
    password?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string;
    planId?: string;
    planExpiryDate?: Date;
  }
}
