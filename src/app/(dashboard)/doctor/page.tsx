import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatDate, getInitials } from "@/lib/utils";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Calendar,
  FileText,
  Users,
  Clock,
  CheckCircle,
  Search,
} from "lucide-react";

export default async function DoctorDashboard() {
  const session = await auth();
  if (!session?.user?.doctorId) redirect("/login");

  const doctorId = session.user.doctorId;

  const doctor = await prisma.doctor.findUnique({
    where: { id: doctorId },
    include: {
      hospitals: {
        where: { isActive: true },
        include: {
          hospital: {
            select: { id: true, name: true, city: true },
          },
        },
      },
    },
  });

  if (!doctor) redirect("/login");

  // Today's appointments
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const todayAppointments = await prisma.appointment.findMany({
    where: {
      doctorId,
      scheduledAt: { gte: today, lt: tomorrow },
      status: { in: ["SCHEDULED", "CONFIRMED"] },
    },
    orderBy: { scheduledAt: "asc" },
    include: {
      patient: {
        select: {
          firstName: true,
          lastName: true,
          patientNumber: true,
          dateOfBirth: true,
        },
      },
      hospital: { select: { name: true } },
    },
  });

  // Recent visits
  const recentVisits = await prisma.visit.findMany({
    where: { doctorId },
    orderBy: { visitDate: "desc" },
    take: 5,
    include: {
      patient: {
        select: {
          firstName: true,
          lastName: true,
          patientNumber: true,
        },
      },
      hospital: { select: { name: true } },
      diagnoses: {
        where: { isPrimary: true },
        take: 1,
      },
    },
  });

  // Stats
  const totalPatients = await prisma.visit
    .groupBy({ by: ["patientId"], where: { doctorId } })
    .then((r) => r.length);

  const thisMonthVisits = await prisma.visit.count({
    where: {
      doctorId,
      visitDate: {
        gte: new Date(today.getFullYear(), today.getMonth(), 1),
      },
    },
  });

  function getTimeOfDay() {
    const hour = new Date().getHours();
    if (hour < 12) return "morning";
    if (hour < 17) return "afternoon";
    return "evening";
  }

  return (
    <DashboardLayout
      role="DOCTOR"
      userName={`Dr. ${doctor.firstName} ${doctor.lastName}`}
      userRole={doctor.specialisation}
      userInitials={getInitials(doctor.firstName, doctor.lastName)}
    >
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          Good {getTimeOfDay()}, Dr. {doctor.firstName}
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          {formatDate(new Date())} · {doctor.specialisation}
        </p>
      </div>

      {/* Patient lookup — core feature */}
      <div className="bg-blue-600 rounded-xl p-5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Search className="w-5 h-5 text-blue-200" />
          <h2 className="font-semibold text-white">Patient Record Lookup</h2>
        </div>
        <p className="text-blue-100 text-sm mb-4">
          Enter a patient UHRS number to view their complete medical history
          across all hospitals
        </p>
        <form action="/doctor/patient" method="GET" className="flex gap-2">
          <input
            name="q"
            placeholder="e.g. UHRS-2024-00001 or patient name..."
            className="flex-1 px-4 py-2.5 rounded-lg bg-white/20 border border-white/30 text-white placeholder-blue-200 text-sm focus:outline-none focus:bg-white/30"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-white text-blue-600 rounded-lg font-medium text-sm hover:bg-blue-50 transition-colors shrink-0"
          >
            Search
          </button>
        </form>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          {
            label: "Today's Appointments",
            value: todayAppointments.length,
            icon: Calendar,
            color: "text-blue-600 bg-blue-50",
          },
          {
            label: "Visits This Month",
            value: thisMonthVisits,
            icon: FileText,
            color: "text-emerald-600 bg-emerald-50",
          },
          {
            label: "Total Patients",
            value: totalPatients,
            icon: Users,
            color: "text-purple-600 bg-purple-50",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-slate-100 p-5"
          >
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${stat.color}`}
            >
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-slate-500 text-sm mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Today's appointments */}
        <div className="bg-white rounded-xl border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">
              Today&apos;s Appointments
            </h2>
            <span className="text-xs text-slate-400">
              {formatDate(new Date())}
            </span>
          </div>
          {todayAppointments.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <Calendar className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No appointments today</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <span className="text-blue-700 text-xs font-semibold">
                      {apt.patient.firstName[0]}
                      {apt.patient.lastName[0]}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900">
                      {apt.patient.firstName} {apt.patient.lastName}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {apt.reason}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-medium text-slate-700 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(apt.scheduledAt).toLocaleTimeString("en-KE", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <Link
                      href={`/doctor/patient?q=${apt.patient.patientNumber}`}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      View records →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent consultations */}
        <div className="bg-white rounded-xl border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">
              Recent Consultations
            </h2>
          </div>
          {recentVisits.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No consultations yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentVisits.map((visit) => (
                <div
                  key={visit.id}
                  className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg"
                >
                  <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900">
                      {visit.patient.firstName} {visit.patient.lastName}
                      <span className="text-xs text-slate-400 ml-1">
                        #{visit.patient.patientNumber}
                      </span>
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {visit.chiefComplaint}
                    </p>
                    {visit.diagnoses[0] && (
                      <p className="text-xs text-slate-400 truncate">
                        Dx: {visit.diagnoses[0].description}
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 shrink-0">
                    {formatDate(visit.visitDate)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Hospital affiliations */}
      <div className="mt-6 bg-white rounded-xl border border-slate-100 p-6">
        <h2 className="font-semibold text-slate-900 mb-4">
          Hospital Affiliations
        </h2>
        <div className="flex flex-wrap gap-3">
          {doctor.hospitals.map((aff) => (
            <div
              key={aff.id}
              className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-100"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
              <div>
                <p className="text-sm font-medium text-slate-700">
                  {aff.hospital.name}
                </p>
                <p className="text-xs text-slate-400">{aff.hospital.city}</p>
              </div>
              {aff.isPrimary && (
                <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">
                  Primary
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
