import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const hashedAdmin = await bcrypt.hash("Admin@123", 12);
  const hashedDoctor = await bcrypt.hash("Doctor@123", 12);
  const hashedPatient = await bcrypt.hash("Patient@123", 12);

  // ── Super Admin ──────────────────────────────────────────
  await prisma.user.upsert({
    where: { email: "admin@uhrs.health" },
    update: {},
    create: {
      email: "admin@uhrs.health",
      password: hashedAdmin,
      role: "SUPER_ADMIN",
    },
  });

  // ── Hospital 1 ───────────────────────────────────────────
  const hospitalAdminUser = await prisma.user.upsert({
    where: { email: "hospitaladmin@cityhospital.ke" },
    update: {},
    create: {
      email: "hospitaladmin@cityhospital.ke",
      password: hashedAdmin,
      role: "HOSPITAL_ADMIN",
    },
  });

  const cityHospital = await prisma.hospital.upsert({
    where: { slug: "city-general-hospital" },
    update: {},
    create: {
      adminUserId: hospitalAdminUser.id,
      name: "City General Hospital",
      slug: "city-general-hospital",
      licenseNumber: "KE-HOSP-001-2020",
      type: "PUBLIC",
      status: "APPROVED",
      phone: "+254 20 123 4567",
      email: "info@cityhospital.ke",
      address: "Hospital Road, Upper Hill",
      city: "Nairobi",
      county: "Nairobi",
      description: "A leading public referral hospital.",
      bedCapacity: 500,
      established: 1952,
      emergencyLine: "+254 20 999 0001",
      approvedAt: new Date(),
    },
  });

  // Services
  for (const name of [
    "Emergency Care", "Surgery", "Radiology",
    "Laboratory", "Maternity", "Pediatrics",
  ]) {
    await prisma.service.upsert({
      where: { id: `${cityHospital.id}-${name}` },
      update: {},
      create: { id: `${cityHospital.id}-${name}`, hospitalId: cityHospital.id, name },
    });
  }

  // Department
  const generalMed = await prisma.department.upsert({
    where: { id: `${cityHospital.id}-dept-general` },
    update: {},
    create: {
      id: `${cityHospital.id}-dept-general`,
      hospitalId: cityHospital.id,
      name: "General Medicine",
    },
  });

  // ── Hospital 2 ───────────────────────────────────────────
  const agaKhan = await prisma.hospital.upsert({
    where: { slug: "aga-khan-hospital-nairobi" },
    update: {},
    create: {
      name: "Aga Khan Hospital Nairobi",
      slug: "aga-khan-hospital-nairobi",
      licenseNumber: "KE-HOSP-002-2018",
      type: "PRIVATE",
      status: "APPROVED",
      phone: "+254 20 366 2000",
      email: "info@agakhanhospitals.org",
      address: "3rd Parklands Avenue",
      city: "Nairobi",
      county: "Nairobi",
      description: "World-class private hospital.",
      bedCapacity: 300,
      established: 1958,
      emergencyLine: "+254 20 366 2222",
      approvedAt: new Date(),
    },
  });

  for (const name of [
    "Emergency Care", "Cardiac Care",
    "Cancer Centre", "Dialysis",
  ]) {
    await prisma.service.upsert({
      where: { id: `${agaKhan.id}-${name}` },
      update: {},
      create: { id: `${agaKhan.id}-${name}`, hospitalId: agaKhan.id, name },
    });
  }

  // ── Doctor ───────────────────────────────────────────────
  const doctorUser = await prisma.user.upsert({
    where: { email: "dr.jane@cityhospital.ke" },
    update: {},
    create: {
      email: "dr.jane@cityhospital.ke",
      password: hashedDoctor,
      role: "DOCTOR",
    },
  });

  const doctor = await prisma.doctor.upsert({
    where: { licenseNumber: "KE-MED-2015-001" },
    update: {},
    create: {
      userId: doctorUser.id,
      licenseNumber: "KE-MED-2015-001",
      firstName: "Jane",
      lastName: "Mwangi",
      specialisation: "General Practitioner",
      qualifications: "MBChB (UoN), MMed (Family Medicine)",
      yearsExperience: 9,
      phone: "+254 722 000 001",
      bio: "Compassionate GP with experience in chronic disease management.",
      isVerified: true,
      verifiedAt: new Date(),
    },
  });

  await prisma.hospitalDoctor.upsert({
    where: { doctorId_hospitalId: { doctorId: doctor.id, hospitalId: cityHospital.id } },
    update: {},
    create: {
      doctorId: doctor.id,
      hospitalId: cityHospital.id,
      departmentId: generalMed.id,
      isPrimary: true,
    },
  });

  await prisma.hospitalDoctor.upsert({
    where: { doctorId_hospitalId: { doctorId: doctor.id, hospitalId: agaKhan.id } },
    update: {},
    create: {
      doctorId: doctor.id,
      hospitalId: agaKhan.id,
      isPrimary: false,
    },
  });

  // ── Patient ───────────────────────────────────────────────
  const patientUser = await prisma.user.upsert({
    where: { email: "john.doe@email.com" },
    update: {},
    create: {
      email: "john.doe@email.com",
      password: hashedPatient,
      role: "PATIENT",
    },
  });

  const patient = await prisma.patient.upsert({
    where: { nationalId: "12345678" },
    update: {},
    create: {
      userId: patientUser.id,
      nationalId: "12345678",
      patientNumber: "UHRS-2024-00001",
      firstName: "John",
      lastName: "Doe",
      dateOfBirth: new Date("1985-03-15"),
      gender: "MALE",
      bloodGroup: "O_POSITIVE",
      phone: "+254 700 123 456",
      email: "john.doe@email.com",
      city: "Nairobi",
      emergencyName: "Mary Doe",
      emergencyPhone: "+254 700 654 321",
      emergencyRel: "Spouse",
      insuranceProvider: "NHIF",
    },
  });

  // Allergy
  await prisma.allergy.upsert({
    where: { id: "allergy-penicillin" },
    update: {},
    create: {
      id: "allergy-penicillin",
      patientId: patient.id,
      substance: "Penicillin",
      reaction: "Skin rash and difficulty breathing",
      severity: "Severe",
    },
  });

  // ── Visit 1 — City Hospital ───────────────────────────────
  const visit1 = await prisma.visit.create({
    data: {
      patientId: patient.id,
      doctorId: doctor.id,
      hospitalId: cityHospital.id,
      visitDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
      visitType: "OUTPATIENT",
      chiefComplaint: "Persistent cough and fever for 5 days",
      consultationNotes:
        "Patient presents with productive cough and low-grade fever. Lungs clear on auscultation.",
      temperature: 38.1,
      bloodPressure: "118/76",
      pulse: 88,
      weight: 72,
      height: 175,
      isCompleted: true,
    },
  });

  await prisma.diagnosis.create({
    data: {
      visitId: visit1.id,
      icdCode: "J06.9",
      description: "Acute upper respiratory infection",
      isPrimary: true,
    },
  });

  await prisma.prescription.create({
    data: {
      visitId: visit1.id,
      medication: "Amoxicillin",
      dosage: "500mg",
      frequency: "Three times daily",
      duration: "7 days",
      route: "Oral",
    },
  });

  await prisma.prescription.create({
    data: {
      visitId: visit1.id,
      medication: "Paracetamol",
      dosage: "1000mg",
      frequency: "Every 6 hours as needed",
      duration: "5 days",
      route: "Oral",
    },
  });

  // ── Visit 2 — Aga Khan (different hospital!) ─────────────
  const visit2 = await prisma.visit.create({
    data: {
      patientId: patient.id,
      doctorId: doctor.id,
      hospitalId: agaKhan.id,
      visitDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      visitType: "OUTPATIENT",
      chiefComplaint: "Chest palpitations and shortness of breath",
      consultationNotes:
        "Patient reports intermittent palpitations for 3 weeks. ECG shows sinus tachycardia.",
      temperature: 36.8,
      bloodPressure: "130/85",
      pulse: 96,
      weight: 73,
      oxygenSat: 98,
      isCompleted: true,
    },
  });

  await prisma.diagnosis.create({
    data: {
      visitId: visit2.id,
      icdCode: "I49.9",
      description: "Sinus tachycardia",
      isPrimary: true,
    },
  });

  await prisma.labResult.create({
    data: {
      visitId: visit2.id,
      testName: "ECG",
      result: "Sinus tachycardia, rate 96 bpm",
      isAbnormal: false,
    },
  });

  await prisma.labResult.create({
    data: {
      visitId: visit2.id,
      testName: "TSH",
      result: "5.8",
      unit: "mIU/L",
      normalRange: "0.4-4.0",
      isAbnormal: true,
      notes: "Mildly elevated — repeat in 3 months",
    },
  });

  await prisma.prescription.create({
    data: {
      visitId: visit2.id,
      medication: "Metoprolol",
      dosage: "25mg",
      frequency: "Once daily",
      duration: "30 days",
      route: "Oral",
      instructions: "Take in the morning. Do not stop abruptly.",
    },
  });

  // ── Upcoming appointment ──────────────────────────────────
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 7);
  futureDate.setHours(10, 0, 0, 0);

  await prisma.appointment.create({
    data: {
      patientId: patient.id,
      doctorId: doctor.id,
      hospitalId: agaKhan.id,
      scheduledAt: futureDate,
      reason: "Follow-up on TSH result and palpitations",
      status: "CONFIRMED",
    },
  });

  console.log("Seeding complete!\n");
  console.log("Test accounts:");
  console.log("  Admin:   admin@uhrs.health / Admin@123");
  console.log("  Doctor:  dr.jane@cityhospital.ke / Doctor@123");
  console.log("  Patient: john.doe@email.com / Patient@123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });