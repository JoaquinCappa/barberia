import "next-auth";
import "next-auth/jwt";

import type { UserRole } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      businessId: string | null;
      role: UserRole;
    } & NonNullable<Session["user"]>;
  }

  interface User {
    id: string;
    businessId?: string | null;
    role: UserRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    businessId?: string | null;
    role?: UserRole;
  }
}