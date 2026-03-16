import "next-auth";

declare module "next-auth" {
  interface User {
    role: string;
    patientId: string | null;
    doctorId: string | null;
    hospitalId: string | null;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      role: string;
      patientId: string | null;
      doctorId: string | null;
      hospitalId: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string;
    patientId: string | null;
    doctorId: string | null;
    hospitalId: string | null;
  }
}