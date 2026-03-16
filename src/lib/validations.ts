import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerPatientSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  nationalId: z.string().min(6, "National ID is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  phone: z.string().min(10, "Valid phone number required"),
  bloodGroup: z
    .enum([
      "A_POSITIVE", "A_NEGATIVE", "B_POSITIVE", "B_NEGATIVE",
      "AB_POSITIVE", "AB_NEGATIVE", "O_POSITIVE", "O_NEGATIVE", "UNKNOWN",
    ])
    .optional(),
});

export const createVisitSchema = z.object({
  patientId: z.string().min(1, "Patient is required"),
  hospitalId: z.string().min(1, "Hospital is required"),
  visitType: z.enum(["OUTPATIENT", "INPATIENT", "EMERGENCY", "FOLLOW_UP", "TELEMEDICINE"]),
  chiefComplaint: z.string().min(5, "Chief complaint is required"),
  consultationNotes: z.string().optional(),
  examination: z.string().optional(),
  temperature: z.coerce.number().optional(),
  bloodPressure: z.string().optional(),
  pulse: z.coerce.number().optional(),
  weight: z.coerce.number().optional(),
  height: z.coerce.number().optional(),
  oxygenSat: z.coerce.number().optional(),
  followUpDate: z.string().optional(),
});

export const createAppointmentSchema = z.object({
  doctorId: z.string().min(1, "Doctor is required"),
  hospitalId: z.string().min(1, "Hospital is required"),
  scheduledAt: z.string().min(1, "Date and time is required"),
  reason: z.string().min(5, "Reason for visit is required"),
  notes: z.string().optional(),
});

export const addAllergySchema = z.object({
  patientId: z.string(),
  substance: z.string().min(2, "Substance is required"),
  reaction: z.string().optional(),
  severity: z.enum(["Mild", "Moderate", "Severe"]).default("Moderate"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterPatientInput = z.infer<typeof registerPatientSchema>;
export type CreateVisitInput = z.infer<typeof createVisitSchema>;
export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;