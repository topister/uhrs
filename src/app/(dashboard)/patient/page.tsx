import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatDate, formatBloodGroup, getInitials } from "@/lib/utils";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Calendar,
  FileText,
  Building2,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";

export default async function PatientDashboard() {
  const session = await auth();
  if (!session?.user?.patientId) redirect("/login");

  const patientId = session.user.patientId;

  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    include: {
      allergies: true,
      visits: {
        orderBy: { visitDate: "desc" },
        take: 5,
        include: {
          hospital: { select: { name: true, city: true } },
          doctor: {
            select: {
              firstName: true,
              lastName: true,
              specialisation: true,
            },
          },
          diagnoses: { where: { isPrimary: true }, take: 1 },
        },
      },
      appointments: {
        where: {
          status: { in: ["SCHEDULED", "CONFIRMED"] },
          scheduledAt: { gte: new Date() },
        },
        orderBy: { scheduledAt: "asc" },
        take: 3,
        include: {
          doctor: {
            select: {
              firstName: true,
              lastName: true,
              specialisation: true,
            },
          },
          hospital: { select: { name: true } },
        },
      },
    },
  });

  if (!patient) redirect("/login");

  const uniqueHospitals = new Set(patient.visits.map((v) => v.hospital.name))
    .size;

  return (
    <DashboardLayout
      role="PATIENT"
      userName={`${patient.firstName} ${patient.lastName}`}
      userRole="Patient"
      userInitials={getInitials(patient.firstName, patient.lastName)}
      patientNumber={patient.patientNumber}
    >
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back, {patient.firstName}
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Here is a summary of your health records
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "Blood Group",
            value: formatBloodGroup(patient.bloodGroup),
            color: "text-red-600 bg-red-50",
          },
          {
            label: "Total Visits",
            value: patient.visits.length,
            color: "text-blue-600 bg-blue-50",
          },
          {
            label: "Hospitals",
            value: uniqueHospitals,
            color: "text-emerald-600 bg-emerald-50",
          },
          {
            label: "Allergies",
            value: patient.allergies.length,
            color: "text-amber-600 bg-amber-50",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-xl border border-slate-100 p-4"
          >
            <p className={`text-2xl font-bold ${s.color.split(" ")[0]}`}>
              {s.value}
            </p>
            <p className="text-slate-500 text-xs mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Patient number card */}
      <div className="bg-blue-600 rounded-xl p-4 text-white mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs text-blue-200 uppercase tracking-wider mb-1">
            Your Patient Number
          </p>
          <p className="font-mono text-xl font-bold">{patient.patientNumber}</p>
        </div>
        <p className="text-white text-xs max-w-[160px] text-right font-bold">
          Show this number to your doctor at any hospital
        </p>
      </div>

      {/* Allergies warning */}
      {patient.allergies.length > 0 && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <h2 className="font-semibold text-red-800 text-sm">
              Registered Allergies
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {patient.allergies.map((a) => (
              <span
                key={a.id}
                className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full"
              >
                {a.substance} ({a.severity})
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upcoming appointments */}
        <div className="bg-white rounded-xl border border-slate-100 p-6">
          <h2 className="font-semibold text-slate-900 mb-4">
            Upcoming Appointments
          </h2>
          {patient.appointments.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <Calendar className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No upcoming appointments</p>
              <Link
                href="/hospitals"
                className="text-xs text-blue-600 hover:underline mt-2 block"
              >
                Book an appointment →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {patient.appointments.map((apt) => (
                <div
                  key={apt.id}
                  className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg"
                >
                  <Calendar className="w-5 h-5 text-blue-500 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">
                      Dr. {apt.doctor.firstName} {apt.doctor.lastName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {apt.doctor.specialisation} · {apt.hospital.name}
                    </p>
                  </div>
                  <div className="text-right text-xs text-slate-500 shrink-0">
                    <p className="font-medium text-slate-700">
                      {formatDate(apt.scheduledAt)}
                    </p>
                    <p>
                      {new Date(apt.scheduledAt).toLocaleTimeString("en-KE", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent visits */}
        <div className="bg-white rounded-xl border border-slate-100 p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Recent Visits</h2>
          {patient.visits.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No visits recorded yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {patient.visits.map((visit) => (
                <div
                  key={visit.id}
                  className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg"
                >
                  <Building2 className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900">
                      {visit.hospital.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      Dr. {visit.doctor.firstName} {visit.doctor.lastName} ·{" "}
                      {visit.doctor.specialisation}
                    </p>
                    {visit.diagnoses[0] && (
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        {visit.diagnoses[0].description}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-slate-500">
                      {formatDate(visit.visitDate)}
                    </p>
                    <ChevronRight className="w-3 h-3 text-slate-300 ml-auto mt-1" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
