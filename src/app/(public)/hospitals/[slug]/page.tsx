import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Heart,
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Stethoscope,
  BedDouble,
  CalendarDays,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function HospitalDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const hospital = await prisma.hospital.findUnique({
    where: { slug, status: "APPROVED", isActive: true },
    include: {
      services: { where: { isAvailable: true } },
      departments: { where: { isActive: true } },
      doctors: {
        where: { isActive: true },
        include: {
          doctor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              specialisation: true,
              qualifications: true,
              yearsExperience: true,
              isAvailable: true,
              photoUrl: true,
            },
          },
        },
      },
    },
  });

  if (!hospital) notFound();

  const typeColors: { [key: string]: string } = {
    PUBLIC: "bg-blue-50 text-blue-700 border-blue-100",
    PRIVATE: "bg-purple-50 text-purple-700 border-purple-100",
    MISSION: "bg-emerald-50 text-emerald-700 border-emerald-100",
    CLINIC: "bg-amber-50 text-amber-700 border-amber-100",
    SPECIALIST: "bg-rose-50 text-rose-700 border-rose-100",
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Nav */}
      <nav className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-900">UHRS</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-slate-600 hover:text-blue-600"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Register
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back link */}
        <Link
          href="/hospitals"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to hospitals
        </Link>

        {/* Hero card */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 mb-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center shrink-0">
                <Building2 className="w-8 h-8 text-slate-500" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h1 className="text-2xl font-bold text-slate-900">
                    {hospital.name}
                  </h1>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium border ${
                      typeColors[hospital.type] ??
                      "bg-slate-100 text-slate-600 border-slate-200"
                    }`}
                  >
                    {hospital.type}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-sm text-slate-500">
                  <MapPin className="w-4 h-4 shrink-0" />
                  {hospital.address}, {hospital.city}
                  {hospital.county && `, ${hospital.county}`}
                </div>
              </div>
            </div>

            {/* Quick stats */}
            <div className="flex gap-4 flex-wrap">
              {hospital.bedCapacity && (
                <div className="text-center">
                  <p className="text-xl font-bold text-slate-900">
                    {hospital.bedCapacity}
                  </p>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <BedDouble className="w-3 h-3" /> Beds
                  </p>
                </div>
              )}
              <div className="text-center">
                <p className="text-xl font-bold text-slate-900">
                  {hospital.doctors.length}
                </p>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <Stethoscope className="w-3 h-3" /> Doctors
                </p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-slate-900">
                  {hospital.departments.length}
                </p>
                <p className="text-xs text-slate-500">Departments</p>
              </div>
              {hospital.established && (
                <div className="text-center">
                  <p className="text-xl font-bold text-slate-900">
                    {hospital.established}
                  </p>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <CalendarDays className="w-3 h-3" /> Est.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {hospital.description && (
            <p className="text-slate-600 text-sm mt-4 leading-relaxed">
              {hospital.description}
            </p>
          )}

          {/* Contact row */}
          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-slate-100">
            <a
              href={`tel:${hospital.phone}`}
              className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 transition-colors"
            >
              <Phone className="w-4 h-4" />
              {hospital.phone}
            </a>
            <a
              href={`mailto:${hospital.email}`}
              className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 transition-colors"
            >
              <Mail className="w-4 h-4" />
              {hospital.email}
            </a>
            {hospital.website && (
              <a
                href={hospital.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 transition-colors"
              >
                <Globe className="w-4 h-4" />
                Website
              </a>
            )}
            {hospital.emergencyLine && (
              <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
                <Phone className="w-4 h-4" />
                Emergency: {hospital.emergencyLine}
              </div>
            )}
            {/* {hospital.openingHours && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Clock className="w-4 h-4" />
                {hospital.openingHours}
              </div>
            )} */}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="space-y-6">
            {/* Services */}
            <div className="bg-white rounded-xl border border-slate-100 p-6">
              <h2 className="font-semibold text-slate-900 mb-4">
                Services Offered
              </h2>
              {hospital.services.length === 0 ? (
                <p className="text-sm text-slate-400">No services listed</p>
              ) : (
                <div className="space-y-2">
                  {hospital.services.map((s) => (
                    <div key={s.id} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span className="text-sm text-slate-700">{s.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Departments */}
            <div className="bg-white rounded-xl border border-slate-100 p-6">
              <h2 className="font-semibold text-slate-900 mb-4">Departments</h2>
              {hospital.departments.length === 0 ? (
                <p className="text-sm text-slate-400">No departments listed</p>
              ) : (
                <div className="space-y-2">
                  {hospital.departments.map((d) => (
                    <div
                      key={d.id}
                      className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg"
                    >
                      <div className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
                      <span className="text-sm text-slate-700">{d.name}</span>
                      {d.floor && (
                        <span className="text-xs text-slate-400 ml-auto">
                          Floor {d.floor}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right column — doctors */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-slate-100 p-6">
              <h2 className="font-semibold text-slate-900 mb-4">
                Doctors on Staff ({hospital.doctors.length})
              </h2>
              {hospital.doctors.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Stethoscope className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No doctors listed yet</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {hospital.doctors.map((aff) => (
                    <div
                      key={aff.id}
                      className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100"
                    >
                      <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm shrink-0">
                        {aff.doctor.firstName[0]}
                        {aff.doctor.lastName[0]}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-slate-900">
                            Dr. {aff.doctor.firstName} {aff.doctor.lastName}
                          </p>
                          {aff.isPrimary && (
                            <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded font-medium">
                              Primary
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {aff.doctor.specialisation}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {aff.doctor.qualifications}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-xs text-slate-400">
                            {aff.doctor.yearsExperience} yrs exp
                          </span>
                          <span
                            className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                              aff.doctor.isAvailable
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {aff.doctor.isAvailable
                              ? "Available"
                              : "Unavailable"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
