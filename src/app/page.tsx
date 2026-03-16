import Link from "next/link";
import {
  Heart,
  Shield,
  Users,
  Building2,
  Search,
  FileText,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-slate-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">UHRS</span>
            <span className="text-sm text-slate-400 hidden sm:block">
              Universal Healthcare Records
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/hospitals"
              className="text-sm text-slate-600 hover:text-slate-900 transition-colors hidden sm:block"
            >
              Find Hospitals
            </Link>
            <Link
              href="/doctors"
              className="text-sm text-slate-600 hover:text-slate-900 transition-colors hidden sm:block"
            >
              Find Doctors
            </Link>
            <Link
              href="/login"
              className="text-sm text-slate-700 hover:text-blue-600 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Register
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-sm px-3 py-1 rounded-full mb-6">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            Connecting Healthcare Across Kenya
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
            Your health records,{" "}
            <span className="text-blue-600">everywhere you go</span>
          </h1>
          <p className="text-xl text-slate-500 leading-relaxed mb-10">
            UHRS gives any registered doctor at any registered hospital instant
            access to your complete medical history — diagnoses, prescriptions,
            lab results, and more — no matter where you were previously treated.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors text-base"
            >
              Create Patient Account
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/hospitals"
              className="inline-flex items-center justify-center gap-2 border border-slate-200 text-slate-700 px-6 py-3 rounded-xl font-semibold hover:bg-slate-50 transition-colors text-base"
            >
              <Search className="w-4 h-4" />
              Find a Hospital
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-slate-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "500+", label: "Registered Hospitals" },
              { value: "12,000+", label: "Verified Doctors" },
              { value: "2M+", label: "Patient Records" },
              { value: "47", label: "Counties Covered" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-4xl font-extrabold text-white">
                  {stat.value}
                </p>
                <p className="text-slate-400 text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h2 className="text-3xl font-bold text-center text-slate-900 mb-4">
          One platform for the entire care journey
        </h2>
        <p className="text-center text-slate-500 mb-16 max-w-2xl mx-auto">
          Whether you are a patient, a doctor, or a hospital administrator —
          UHRS has a dedicated experience designed for your role.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: FileText,
              title: "Universal Medical Records",
              description:
                "All your visits, diagnoses, prescriptions, and lab results in one place — accessible by any authorised doctor.",
              color: "text-blue-600 bg-blue-50",
            },
            {
              icon: Building2,
              title: "Hospital Directory",
              description:
                "Browse registered hospitals, see available services, departments, doctors on staff, and operating hours.",
              color: "text-emerald-600 bg-emerald-50",
            },
            {
              icon: Users,
              title: "Doctor Profiles",
              description:
                "Find verified doctors by specialisation or location. See their qualifications, hospital affiliations, and availability.",
              color: "text-purple-600 bg-purple-50",
            },
            {
              icon: Shield,
              title: "Role-Based Access",
              description:
                "Doctors only see records for patients in their current care. All access is logged and auditable.",
              color: "text-rose-600 bg-rose-50",
            },
            {
              icon: Search,
              title: "Instant Patient Lookup",
              description:
                "Doctors can look up a patient by their UHRS number and instantly see their full cross-hospital history.",
              color: "text-amber-600 bg-amber-50",
            },
            {
              icon: Heart,
              title: "Appointments & Follow-ups",
              description:
                "Book appointments, receive reminders, and track follow-up schedules with your care team.",
              color: "text-cyan-600 bg-cyan-50",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="bg-white border border-slate-100 rounded-2xl p-6 hover:shadow-md transition-shadow"
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${feature.color}`}
              >
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-slate-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-16">
            How it works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Patient registers once",
                description:
                  "Create a free UHRS account with your national ID. You get a unique patient number that follows you for life.",
              },
              {
                step: "02",
                title: "Doctor looks you up",
                description:
                  "When you visit any hospital, the doctor searches your UHRS number and instantly sees your complete history.",
              },
              {
                step: "03",
                title: "Records updated automatically",
                description:
                  "Every new visit, diagnosis, prescription, and lab result is added to your universal record in real time.",
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-4">
                <span className="text-5xl font-extrabold text-blue-100 shrink-0">
                  {item.step}
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="bg-blue-600 rounded-3xl p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to take control of your health?
          </h2>
          <p className="text-blue-100 mb-8 max-w-xl mx-auto">
            Register for free and get your universal patient ID today. It only
            takes 2 minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
            >
              Register as Patient <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/register?role=doctor"
              className="inline-flex items-center justify-center gap-2 border border-blue-400 text-white px-6 py-3 rounded-xl font-semibold hover:border-white transition-colors"
            >
              Register as Doctor
            </Link>
          </div>
          <div className="flex flex-wrap justify-center gap-6 mt-8">
            {[
              "Free to join",
              "Secure and private",
              "Accessible 24/7",
              "All counties",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 text-blue-100 text-sm"
              >
                <CheckCircle className="w-4 h-4" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
              <Heart className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-semibold text-slate-900">UHRS</span>
          </div>
          <p className="text-sm text-slate-400">
            © {new Date().getFullYear()} Universal Healthcare Records System.
            All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
