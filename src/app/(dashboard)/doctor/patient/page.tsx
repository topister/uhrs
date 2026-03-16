import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatDate, formatBloodGroup, getInitials } from "@/lib/utils";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Search,
  User,
  AlertTriangle,
  Building2,
  Calendar,
  Pill,
  FlaskConical,
  FileText,
  Heart,
  ChevronLeft,
} from "lucide-react";

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function PatientLookupPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user?.doctorId) redirect("/login");

  const doctor = await prisma.doctor.findUnique({
    where: { id: session.user.doctorId },
    select: { firstName: true, lastName: true, specialisation: true },
  });

  if (!doctor) redirect("/login");

  const resolvedParams = await searchParams;
  const query = resolvedParams.q?.trim() ?? "";

  // Search patient by UHRS number, name, or national ID
  let patient = null;
  if (query) {
    patient = await prisma.patient.findFirst({
      where: {
        OR: [
          { patientNumber: { equals: query, mode: "insensitive" } },
          { nationalId: query },
          {
            AND: [
              {
                firstName: {
                  contains: query.split(" ")[0],
                  mode: "insensitive",
                },
              },
              query.split(" ")[1]
                ? {
                    lastName: {
                      contains: query.split(" ")[1],
                      mode: "insensitive",
                    },
                  }
                : {},
            ],
          },
        ],
      },
      include: {
        allergies: true,
        visits: {
          orderBy: { visitDate: "desc" },
          include: {
            hospital: true,
            doctor: {
              select: {
                firstName: true,
                lastName: true,
                specialisation: true,
                licenseNumber: true,
                phone: true,
              },
            },
            diagnoses: true,
            prescriptions: true,
            labResults: true,
            documents: true,
          },
        },
      },
    });
  }

  const hospitalsCount = patient
    ? new Set(patient.visits.map((v) => v.hospitalId)).size
    : 0;

  return (
    <DashboardLayout
      role="DOCTOR"
      userName={`Dr. ${doctor.firstName} ${doctor.lastName}`}
      userRole={doctor.specialisation}
      userInitials={getInitials(doctor.firstName, doctor.lastName)}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/doctor"
          className="p-2 rounded-lg hover:bg-slate-200 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-slate-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Patient Record Lookup
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Search by UHRS number, full name, or national ID
          </p>
        </div>
      </div>

      {/* Search bar */}
      <form method="GET" className="flex gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            name="q"
            defaultValue={query}
            placeholder="Search by UHRS number (UHRS-2024-00001), name, or national ID..."
            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium text-sm hover:bg-blue-700 transition-colors"
        >
          Search
        </button>
      </form>

      {/* Empty state */}
      {!query && (
        <div className="text-center py-24 text-slate-400">
          <User className="w-14 h-14 mx-auto mb-4 opacity-30" />
          <p className="font-medium text-slate-500">Search for a patient</p>
          <p className="text-sm mt-1">
            Enter their UHRS number, full name, or national ID above
          </p>
          <div className="mt-6 inline-flex items-center gap-2 bg-blue-50 text-blue-600 text-sm px-4 py-2 rounded-lg">
            <span>Try searching:</span>
            <Link
              href="/doctor/patient?q=UHRS-2024-00001"
              className="font-mono font-semibold hover:underline"
            >
              UHRS-2024-00001
            </Link>
          </div>
        </div>
      )}

      {/* Not found */}
      {query && !patient && (
        <div className="text-center py-24 text-slate-400">
          <AlertTriangle className="w-14 h-14 mx-auto mb-4 opacity-30" />
          <p className="font-medium text-slate-600">No patient found</p>
          <p className="text-sm mt-1">
            No registered patient matches &quot;{query}&quot;
          </p>
        </div>
      )}

      {/* Patient found — full medical record */}
      {patient && (
        <div className="space-y-6">
          {/* Identity card */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-700 text-xl font-bold shrink-0">
                  {getInitials(patient.firstName, patient.lastName)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {patient.firstName} {patient.lastName}
                  </h2>
                  <p className="text-blue-600 font-mono text-sm">
                    {patient.patientNumber}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-slate-500">
                    <span>{patient.gender}</span>
                    <span>·</span>
                    <span>DOB: {formatDate(patient.dateOfBirth)}</span>
                    <span>·</span>
                    <span>
                      {new Date().getFullYear() -
                        new Date(patient.dateOfBirth).getFullYear()}{" "}
                      years
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-red-50 text-red-700">
                  {formatBloodGroup(patient.bloodGroup)}
                </span>
                <div className="mt-2 text-xs text-slate-400 space-y-0.5">
                  <p>Phone: {patient.phone}</p>
                  {patient.insuranceProvider && (
                    <p>Insurance: {patient.insuranceProvider}</p>
                  )}
                  {patient.emergencyName && (
                    <p>
                      Emergency: {patient.emergencyName} ({patient.emergencyRel}
                      )
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
              {[
                { label: "Total Visits", value: patient.visits.length },
                { label: "Hospitals Visited", value: hospitalsCount },
                {
                  label: "Diagnoses",
                  value: patient.visits.flatMap((v) => v.diagnoses).length,
                },
                {
                  label: "Last Visit",
                  value: patient.visits[0]
                    ? formatDate(patient.visits[0].visitDate)
                    : "Never",
                },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-xl font-bold text-slate-900">{s.value}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Allergies alert */}
          {patient.allergies.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <h3 className="font-semibold text-red-800">Known Allergies</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {patient.allergies.map((a) => (
                  <div
                    key={a.id}
                    className="px-3 py-1.5 bg-white border border-red-200 rounded-lg"
                  >
                    <span className="font-medium text-red-700 text-sm">
                      {a.substance}
                    </span>
                    {a.reaction && (
                      <span className="text-red-400 text-xs ml-1">
                        → {a.reaction}
                      </span>
                    )}
                    <span
                      className={`ml-1.5 text-xs px-1.5 py-0.5 rounded font-medium ${
                        a.severity === "Severe"
                          ? "bg-red-100 text-red-700"
                          : a.severity === "Moderate"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {a.severity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Visit history */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Complete Visit History — {patient.visits.length} visits across{" "}
              {hospitalsCount} hospital{hospitalsCount !== 1 ? "s" : ""}
            </h3>

            <div className="space-y-4">
              {patient.visits.map((visit) => (
                <div
                  key={visit.id}
                  className="bg-white rounded-xl border border-slate-100 overflow-hidden"
                >
                  {/* Visit header */}
                  <div className="p-4 border-b border-slate-50 flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                        <Building2 className="w-5 h-5 text-slate-500" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold text-slate-900">
                            {visit.hospital.name}
                          </h4>
                          <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">
                            {visit.visitType.replace("_", " ")}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(visit.visitDate)}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            Dr. {visit.doctor.firstName} {visit.doctor.lastName}{" "}
                            · {visit.doctor.specialisation}
                            {visit.doctor.phone && (
                              <span className="text-slate-400">
                                · {visit.doctor.phone}
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-slate-400 shrink-0">
                      {visit.hospital.city}
                    </span>
                  </div>

                  <div className="p-4 space-y-4">
                    {/* Chief complaint */}
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
                        Chief Complaint
                      </p>
                      <p className="text-sm text-slate-700">
                        {visit.chiefComplaint}
                      </p>
                    </div>

                    {/* Vitals */}
                    {(visit.bloodPressure ||
                      visit.temperature ||
                      visit.pulse ||
                      visit.weight) && (
                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                          Vitals
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {visit.bloodPressure && (
                            <span className="text-xs bg-slate-50 border border-slate-100 px-2 py-1 rounded">
                              BP: {visit.bloodPressure}
                            </span>
                          )}
                          {visit.temperature && (
                            <span className="text-xs bg-slate-50 border border-slate-100 px-2 py-1 rounded">
                              Temp: {visit.temperature}°C
                            </span>
                          )}
                          {visit.pulse && (
                            <span className="text-xs bg-slate-50 border border-slate-100 px-2 py-1 rounded">
                              Pulse: {visit.pulse} bpm
                            </span>
                          )}
                          {visit.weight && (
                            <span className="text-xs bg-slate-50 border border-slate-100 px-2 py-1 rounded">
                              Weight: {visit.weight} kg
                            </span>
                          )}
                          {visit.oxygenSat && (
                            <span className="text-xs bg-slate-50 border border-slate-100 px-2 py-1 rounded">
                              SpO₂: {visit.oxygenSat}%
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Diagnoses */}
                    {visit.diagnoses.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                          <Heart className="w-3 h-3" /> Diagnoses
                        </p>
                        <div className="space-y-1">
                          {visit.diagnoses.map((d) => (
                            <div key={d.id} className="flex items-center gap-2">
                              {d.isPrimary && (
                                <span className="text-xs bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded font-medium">
                                  Primary
                                </span>
                              )}
                              {d.icdCode && (
                                <span className="font-mono text-xs text-slate-400">
                                  {d.icdCode}
                                </span>
                              )}
                              <span className="text-sm text-slate-700">
                                {d.description}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Prescriptions */}
                    {visit.prescriptions.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                          <Pill className="w-3 h-3" /> Prescriptions
                        </p>
                        <div className="grid sm:grid-cols-2 gap-2">
                          {visit.prescriptions.map((p) => (
                            <div
                              key={p.id}
                              className="text-xs bg-emerald-50 border border-emerald-100 rounded-lg p-2.5"
                            >
                              <p className="font-semibold text-emerald-800">
                                {p.medication} {p.dosage}
                              </p>
                              <p className="text-emerald-600 mt-0.5">
                                {p.frequency} · {p.duration} · {p.route}
                              </p>
                              {p.instructions && (
                                <p className="text-emerald-500 mt-0.5">
                                  {p.instructions}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Lab results */}
                    {visit.labResults.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                          <FlaskConical className="w-3 h-3" /> Lab Results
                        </p>
                        <div className="space-y-1.5">
                          {visit.labResults.map((lab) => (
                            <div
                              key={lab.id}
                              className={`flex items-center justify-between text-xs px-3 py-2 rounded-lg ${
                                lab.isAbnormal
                                  ? "bg-red-50 border border-red-100"
                                  : "bg-slate-50 border border-slate-100"
                              }`}
                            >
                              <span className="font-medium text-slate-700">
                                {lab.testName}
                              </span>
                              <div className="flex items-center gap-2">
                                {lab.result && (
                                  <span
                                    className={
                                      lab.isAbnormal
                                        ? "text-red-600 font-semibold"
                                        : "text-slate-600"
                                    }
                                  >
                                    {lab.result} {lab.unit}
                                  </span>
                                )}
                                {lab.normalRange && (
                                  <span className="text-slate-400">
                                    (Normal: {lab.normalRange})
                                  </span>
                                )}
                                {lab.isAbnormal && (
                                  <AlertTriangle className="w-3 h-3 text-red-500" />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Consultation notes */}
                    {visit.consultationNotes && (
                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
                          Consultation Notes
                        </p>
                        <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3 leading-relaxed">
                          {visit.consultationNotes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Start new consultation button */}
          <div className="sticky bottom-6 flex justify-center pt-4">
            <Link
              href={`/doctor/consult/new?patientId=${patient.id}`}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:bg-blue-700 transition-colors"
            >
              <FileText className="w-4 h-4" />
              Start new consultation for this patient
            </Link>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
