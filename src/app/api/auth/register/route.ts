import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerPatientSchema } from "@/lib/validations";
import { generatePatientNumber } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerPatientSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const {
      email, password, firstName, lastName,
      nationalId, dateOfBirth, gender, phone, bloodGroup,
    } = parsed.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 409 }
      );
    }

    const existingPatient = await prisma.patient.findUnique({
      where: { nationalId },
    });
    if (existingPatient) {
      return NextResponse.json(
        { error: "National ID already registered" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const patientNumber = generatePatientNumber();

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          role: "PATIENT",
        },
      });

      const patient = await tx.patient.create({
        data: {
          userId: user.id,
          nationalId,
          patientNumber,
          firstName,
          lastName,
          dateOfBirth: new Date(dateOfBirth),
          gender,
          phone,
          email,
          bloodGroup: bloodGroup ?? "UNKNOWN",
        },
      });

      return { userId: user.id, patientId: patient.id, patientNumber };
    });

    return NextResponse.json(
      { message: "Registration successful", ...result },
      { status: 201 }
    );
  } catch (error) {
    console.error("[REGISTER_POST]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}