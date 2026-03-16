import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Heart, Search, User, Building2, Star } from "lucide-react";

interface PageProps {
  searchParams: Promise<{ search?: string; specialisation?: string }>;
}

export default async function DoctorsPage({ searchParams }: PageProps) {
  const { search = "", specialisation = "" } = await searchParams;

  const doctors = await prisma.doctor.findMany({
    where: {
      isVerified: true,
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: "insensitive" } },
          { lastName: { contains: search, mode: "insensitive" } },
          { specialisation: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(specialisation && {
        specialisation: { contains: specialisation, mode: "insensitive" },
      }),
    },
    orderBy: { lastName: "asc" },
    include: {
      hospitals: {
        where: { isActive: true },
        include: {
          hospital: {
            select: { name: true, city: true },
          },
        },
      },
    },
  });

  // Get unique specialisations for the filter dropdown
  const allSpecialisations = await prisma.doctor.findMany({
    where: { isVerified: true },
    select: { specialisation: true },
    distinct: ["specialisation"],
    orderBy: { specialisation: "asc" },
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
              href="/hospitals"
              className="text-sm text-slate-600 hover:text-blue-600"
            >
              Find Hospitals
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
            Doctor Directory
          </h1>
          <p className="text-slate-500 mt-1">
            {doctors.length} verified doctor{doctors.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Search and filter */}
        <form method="GET" className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              name="search"
              defaultValue={search}
              placeholder="Search by name or specialisation..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            name="specialisation"
            defaultValue={specialisation}
            className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All specialisations</option>
            {allSpecialisations.map((s) => (
              <option key={s.specialisation} value={s.specialisation}>
                {s.specialisation}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Search
          </button>
        </form>

        {/* No results */}
        {doctors.length === 0 && (
          <div className="text-center py-20 text-slate-400">
            <User className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="font-medium text-slate-600">No doctors found</p>
            <p className="text-sm mt-1">Try a different search term</p>
          </div>
        )}

        {/* Doctors grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor) => (
            <div
              key={doctor.id}
              className="bg-white border border-slate-100 rounded-2xl p-6 hover:shadow-md transition-shadow flex flex-col"
            >
              {/* Avatar and name */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-700 text-lg font-bold shrink-0">
                  {doctor.firstName[0]}
                  {doctor.lastName[0]}
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-slate-900">
                    Dr. {doctor.firstName} {doctor.lastName}
                  </h3>
                  <p className="text-sm text-blue-600 mt-0.5">
                    {doctor.specialisation}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {doctor.qualifications}
                  </p>
                </div>
              </div>

              {/* Experience and availability */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  {doctor.yearsExperience} years experience
                </div>
                <span
                  className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium ${
                    doctor.isAvailable
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {doctor.isAvailable ? "Available" : "Unavailable"}
                </span>
              </div>

              {/* Bio */}
              {doctor.bio && (
                <p className="text-xs text-slate-500 line-clamp-2 mb-4">
                  {doctor.bio}
                </p>
              )}

              {/* Hospital affiliations */}
              {doctor.hospitals.length > 0 && (
                <div className="space-y-1.5 mb-4">
                  {doctor.hospitals.slice(0, 2).map((aff) => (
                    <div
                      key={aff.id}
                      className="flex items-center gap-2 text-xs text-slate-500"
                    >
                      <Building2 className="w-3 h-3 shrink-0 text-slate-400" />
                      <span className="truncate">{aff.hospital.name}</span>
                      <span className="text-slate-300">·</span>
                      <span className="shrink-0">{aff.hospital.city}</span>
                    </div>
                  ))}
                  {doctor.hospitals.length > 2 && (
                    <p className="text-xs text-slate-400 pl-5">
                      +{doctor.hospitals.length - 2} more hospital
                      {doctor.hospitals.length - 2 !== 1 ? "s" : ""}
                    </p>
                  )}
                </div>
              )}

              {/* Footer */}
              <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  License: {doctor.licenseNumber}
                </span>
                <Link
                  href={`/hospitals?search=${doctor.hospitals[0]?.hospital.name ?? ""}`}
                  className="text-xs text-blue-600 hover:underline"
                >
                  View hospital →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
