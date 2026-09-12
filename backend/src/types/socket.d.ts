import { Role } from '@prisma/client';

declare module 'socket.io' {
  interface Socket {
    data: {
      user: {
        id: string;
        name: string;
        role: Role;
        email: string;
      };
    };
  }
}
