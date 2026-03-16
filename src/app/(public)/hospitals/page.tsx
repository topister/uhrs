import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  Heart,
  Building2,
  MapPin,
  Phone,
  Stethoscope,
  Search,
  ArrowRight,
} from "lucide-react";

interface PageProps {
  searchParams: Promise<{ search?: string; type?: string }>;
}

const typeColors: { [key: string]: string } = {
  PUBLIC: "bg-blue-50 text-blue-700",
  PRIVATE: "bg-purple-50 text-purple-700",
  MISSION: "bg-emerald-50 text-emerald-700",
  CLINIC: "bg-amber-50 text-amber-700",
  SPECIALIST: "bg-rose-50 text-rose-700",
};

export default async function HospitalsPage({ searchParams }: PageProps) {
  const { search = "", type = "" } = await searchParams;

  const hospitals = await prisma.hospital.findMany({
    where: {
      status: "APPROVED",
      isActive: true,
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { city: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(type && {
        type: type as
          | "PUBLIC"
          | "PRIVATE"
          | "MISSION"
          | "CLINIC"
          | "SPECIALIST",
      }),
    },
    orderBy: { name: "asc" },
    include: {
      services: {
        where: { isAvailable: true },
        take: 4,
      },
      _count: {
        select: { doctors: { where: { isActive: true } } },
      },
    },
  });

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
              href="/doctors"
              className="text-sm text-slate-600 hover:text-blue-600"
            >
              Find Doctors
            </Link>
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Hospital Directory
          </h1>
          <p className="text-slate-500 mt-1">
            {hospitals.length} registered and verified hospital
            {hospitals.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Search and filter */}
        <form method="GET" className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              name="search"
              defaultValue={search}
              placeholder="Search by hospital name or city..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            name="type"
            defaultValue={type}
            className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All types</option>
            <option value="PUBLIC">Public</option>
            <option value="PRIVATE">Private</option>
            <option value="MISSION">Mission</option>
            <option value="CLINIC">Clinic</option>
            <option value="SPECIALIST">Specialist</option>
          </select>
          <button
            type="submit"
            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Search
          </button>
        </form>

        {/* No results */}
        {hospitals.length === 0 && (
          <div className="text-center py-20 text-slate-400">
            <Building2 className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="font-medium text-slate-600">No hospitals found</p>
            <p className="text-sm mt-1">Try a different search term</p>
          </div>
        )}

        {/* Hospital grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {hospitals.map((hospital) => (
            <div
              key={hospital.id}
              className="bg-white border border-slate-100 rounded-2xl p-6 hover:shadow-md transition-shadow flex flex-col"
            >
              {/* Top row */}
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                  <Building2 className="w-6 h-6 text-slate-500" />
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    typeColors[hospital.type] ?? "bg-slate-100 text-slate-600"
                  }`}
                >
                  {hospital.type}
                </span>
              </div>

              {/* Name */}
              <h3 className="font-semibold text-slate-900 mb-1">
                {hospital.name}
              </h3>

              {/* Location */}
              <div className="flex items-center gap-1 text-xs text-slate-500 mb-2">
                <MapPin className="w-3 h-3 shrink-0" />
                {hospital.city}
                {hospital.county && `, ${hospital.county}`}
              </div>

              {/* Description */}
              {hospital.description && (
                <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                  {hospital.description}
                </p>
              )}

              {/* Services */}
              {hospital.services.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {hospital.services.map((s) => (
                    <span
                      key={s.id}
                      className="text-xs bg-slate-50 text-slate-500 px-2 py-0.5 rounded-full border border-slate-100"
                    >
                      {s.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Footer */}
              <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Stethoscope className="w-3 h-3" />
                    {hospital._count.doctors} doctor
                    {hospital._count.doctors !== 1 ? "s" : ""}
                  </span>
                  {hospital.emergencyLine && (
                    <span className="flex items-center gap-1 text-emerald-600">
                      <Phone className="w-3 h-3" />
                      24h emergency
                    </span>
                  )}
                </div>
                <Link
                  href={`/hospitals/${hospital.slug}`}
                  className="text-xs text-blue-600 hover:underline flex items-center gap-0.5"
                >
                  View <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
