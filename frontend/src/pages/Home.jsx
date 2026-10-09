import {
  ArrowRight,
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  ExternalLink,
  GraduationCap,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Users,
} from "lucide-react";
import { FaFacebook, FaInstagram, FaYoutube } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { Link } from "react-router-dom";

import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import PortalCard from "../components/home/PortalCard";
import { useWebsite } from "../context/WebsiteContext";

const Home = () => {
  const { website, loading } = useWebsite();

  const hasContact =
    website.contact?.phone ||
    website.contact?.email ||
    website.contact?.address ||
    website.contact?.mapUrl ||
    website.contact?.whatsapp;

  const hasSocial =
    website.socialLinks?.facebook ||
    website.socialLinks?.instagram ||
    website.socialLinks?.youtube ||
    website.socialLinks?.twitter;

  const services = [
    {
      icon: Users,
      title: "Staff Management",
      text: "Manage teachers and other school staff efficiently.",
    },
    {
      icon: GraduationCap,
      title: "Students",
      text: "Maintain complete student records.",
    },
    {
      icon: CalendarCheck,
      title: "Attendance",
      text: "Track and manage daily attendance.",
    },
    {
      icon: BookOpen,
      title: "Classes",
      text: "Organize classes, subjects and teachers.",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />

        <main>
          <section className="bg-white">
            <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-3xl animate-pulse text-center">
                <div className="mx-auto h-8 w-56 rounded-full bg-slate-200" />

                <div className="mx-auto mt-6 h-14 max-w-2xl rounded-xl bg-slate-200" />

                <div className="mx-auto mt-4 h-5 max-w-xl rounded bg-slate-200" />
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <main>
        <section id="home" className="relative overflow-hidden bg-slate-950">
          {website.mainPoster?.url ? (
            <div className="relative min-h-[560px] sm:min-h-[620px] lg:min-h-[700px]">
              <img
                src={website.mainPoster.url}
                alt={
                  website.mainPoster.alt || `${website.websiteName} main poster`
                }
                className="absolute inset-0 h-full w-full object-cover"
              />

              <div className="absolute inset-0 bg-black/45" />

              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/10" />

              <div className="relative mx-auto flex min-h-[560px] max-w-7xl items-center px-4 py-20 sm:min-h-[620px] sm:px-6 lg:min-h-[700px] lg:px-8">
                <div className="max-w-3xl text-white">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white backdrop-blur-md">
                    {website.favicon?.url ? (
                      <img
                        src={website.favicon.url}
                        alt={website.favicon.alt || ""}
                        className="h-5 w-5 object-contain"
                      />
                    ) : (
                      <ShieldCheck size={15} />
                    )}

                    {website.websiteName}
                  </div>

                  {website.lightLogo?.url && (
                    <div className="mt-7">
                      <img
                        src={website.lightLogo.url}
                        alt={website.lightLogo.alt || website.websiteName}
                        className="max-h-20 max-w-xs object-contain"
                      />
                    </div>
                  )}

                  <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-7xl">
                    Welcome to {website.websiteName}
                  </h1>

                  <p className="mt-6 max-w-2xl text-base leading-7 text-white/80 sm:text-lg">
                    Empowering students, supporting teachers, and creating a
                    better learning experience through modern school management.
                  </p>

                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <a
                      href="#portal"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-xl transition hover:bg-indigo-700 sm:w-auto"
                    >
                      Access Portal
                      <ArrowRight size={17} />
                    </a>

                    <a
                      href="#about"
                      className="inline-flex w-full items-center justify-center rounded-xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/20 sm:w-auto"
                    >
                      About Us
                    </a>
                  </div>
                </div>
              </div>

              <div
                id="portal"
                className="relative mx-auto -mt-10 max-w-5xl px-4 pb-10 sm:px-6 lg:px-8"
              >
                <div className="grid gap-5 md:grid-cols-2">
                  <PortalCard
                    icon={Users}
                    title="Staff Portal"
                    description="Teachers and school staff can access their dashboard, manage students, mark attendance and view class information."
                    buttonText="Go to Staff Dashboard"
                    to="/staff/dashboard"
                  />

                  <PortalCard
                    icon={GraduationCap}
                    title="Student Portal"
                    description="Students can access their personal dashboard, academic information, attendance and other school activities."
                    buttonText="Go to Student Dashboard"
                    to="/student/dashboard"
                  />
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-indigo-100/60 blur-3xl" />

              <div className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-blue-100/50 blur-3xl" />

              <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
                <div className="mx-auto max-w-4xl text-center">
                  <div className="inline-flex items-center gap-3 rounded-full border border-indigo-100 bg-indigo-50 px-4 py-2 text-xs font-semibold text-indigo-600">
                    {website.favicon?.url ? (
                      <img
                        src={website.favicon.url}
                        alt={website.favicon.alt || ""}
                        className="h-5 w-5 object-contain"
                      />
                    ) : (
                      <ShieldCheck size={15} />
                    )}

                    {website.websiteName}
                  </div>

                  {website.lightLogo?.url && (
                    <div className="mt-8 flex justify-center">
                      <img
                        src={website.lightLogo.url}
                        alt={website.lightLogo.alt || website.websiteName}
                        className="max-h-20 max-w-xs object-contain"
                      />
                    </div>
                  )}

                  <h1 className="mt-8 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                    Welcome to {website.websiteName}
                  </h1>

                  <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-500 sm:text-lg">
                    Empowering students, supporting teachers, and creating a
                    better learning experience through modern school management.
                  </p>

                  <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                    <a
                      href="#portal"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-100 transition hover:bg-indigo-700 sm:w-auto"
                    >
                      Access Portal
                      <ArrowRight size={17} />
                    </a>

                    <a
                      href="#about"
                      className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:w-auto"
                    >
                      About Us
                    </a>
                  </div>
                </div>

                <div
                  id="portal"
                  className="mx-auto mt-16 grid max-w-4xl gap-5 md:grid-cols-2"
                >
                  <PortalCard
                    icon={Users}
                    title="Staff Portal"
                    description="Teachers and school staff can access their dashboard, manage students, mark attendance and view class information."
                    buttonText="Go to Staff Dashboard"
                    to="/staff/dashboard"
                  />

                  <PortalCard
                    icon={GraduationCap}
                    title="Student Portal"
                    description="Students can access their personal dashboard, academic information, attendance and other school activities."
                    buttonText="Go to Student Dashboard"
                    to="/student/dashboard"
                  />
                </div>
              </div>
            </>
          )}
        </section>

        <section id="about" className="border-y border-slate-200 bg-slate-50">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <span className="text-sm font-semibold text-indigo-600">
                  About Our School
                </span>

                <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                  {website.about?.title || `Welcome to ${website.websiteName}`}
                </h2>

                <p className="mt-5 whitespace-pre-line text-base leading-7 text-slate-500">
                  {website.about?.description ||
                    "Our school is committed to providing quality education and creating a positive learning environment for every student."}
                </p>

                <div className="mt-7 grid grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                      <CheckCircle2 size={20} />
                    </div>

                    <p className="mt-4 text-sm font-semibold text-slate-900">
                      Easy Access
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Access school information anytime.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                      <ShieldCheck size={20} />
                    </div>

                    <p className="mt-4 text-sm font-semibold text-slate-900">
                      Secure Platform
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Organized and secure school management.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                {website.about?.image?.url ? (
                  <div className="aspect-[3/2] w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                    <img
                      src={website.about.image.url}
                      alt={
                        website.about.image.alt ||
                        `About ${website.websiteName}`
                      }
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-3xl bg-indigo-600 p-6 text-white shadow-lg shadow-indigo-100">
                      <Users size={30} />

                      <h3 className="mt-8 font-bold">Staff Management</h3>

                      <p className="mt-2 text-sm leading-6 text-indigo-100">
                        Manage teachers and school staff efficiently.
                      </p>
                    </div>

                    <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6">
                      <GraduationCap size={30} className="text-indigo-600" />

                      <h3 className="mt-8 font-bold text-slate-900">
                        Student Management
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        Keep student information organized and secure.
                      </p>
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-white p-6">
                      <CalendarCheck size={30} className="text-indigo-600" />

                      <h3 className="mt-8 font-bold text-slate-900">
                        Attendance
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        Track daily student attendance with ease.
                      </p>
                    </div>

                    <div className="mt-8 rounded-3xl bg-slate-900 p-6 text-white">
                      <BookOpen size={30} />

                      <h3 className="mt-8 font-bold">Academic Management</h3>

                      <p className="mt-2 text-sm leading-6 text-slate-400">
                        Manage classes and academic information.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section id="services" className="bg-white">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <span className="text-sm font-semibold text-indigo-600">
                Our Services
              </span>

              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                Built for modern school management
              </h2>

              <p className="mt-4 text-sm leading-6 text-slate-500 sm:text-base">
                Manage important school operations from a single, organized
                platform.
              </p>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {services.map((service) => {
                const Icon = service.icon;

                return (
                  <div
                    key={service.title}
                    className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                      <Icon size={23} />
                    </div>

                    <h3 className="mt-5 font-bold text-slate-900">
                      {service.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {service.text}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {hasContact && (
          <section
            id="contact"
            className="border-t border-slate-200 bg-slate-50"
          >
            <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-2xl text-center">
                <span className="text-sm font-semibold text-indigo-600">
                  Contact Us
                </span>

                <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                  Get in touch with us
                </h2>

                <p className="mt-4 text-sm leading-6 text-slate-500 sm:text-base">
                  Have a question? Contact our school using the information
                  below.
                </p>
              </div>

              <div className="mx-auto mt-12 grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {website.contact.phone && (
                  <a
                    href={`tel:${website.contact.phone}`}
                    className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-indigo-200 hover:shadow-lg"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                      <Phone size={20} />
                    </div>

                    <h3 className="mt-4 font-semibold text-slate-900">Phone</h3>

                    <p className="mt-2 break-words text-sm text-slate-500">
                      {website.contact.phone}
                    </p>
                  </a>
                )}

                {website.contact.email && (
                  <a
                    href={`mailto:${website.contact.email}`}
                    className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-indigo-200 hover:shadow-lg"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                      <Mail size={20} />
                    </div>

                    <h3 className="mt-4 font-semibold text-slate-900">Email</h3>

                    <p className="mt-2 break-words text-sm text-slate-500">
                      {website.contact.email}
                    </p>
                  </a>
                )}

                {website.contact.whatsapp && (
                  <a
                    href={`https://wa.me/${website.contact.whatsapp.replace(
                      /\D/g,
                      "",
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-emerald-200 hover:shadow-lg"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                      <MessageCircle size={20} />
                    </div>

                    <h3 className="mt-4 font-semibold text-slate-900">
                      WhatsApp
                    </h3>

                    <p className="mt-2 break-words text-sm text-slate-500">
                      {website.contact.whatsapp}
                    </p>
                  </a>
                )}

                {website.contact.mapUrl && (
                  <a
                    href={website.contact.mapUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-indigo-200 hover:shadow-lg"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                      <MapPin size={20} />
                    </div>

                    <h3 className="mt-4 font-semibold text-slate-900">
                      Location
                    </h3>

                    <p className="mt-2 flex items-center gap-1 text-sm text-indigo-600">
                      View on Google Maps
                      <ExternalLink size={13} />
                    </p>
                  </a>
                )}
              </div>

              {website.contact.address && (
                <div className="mx-auto mt-5 max-w-5xl rounded-2xl border border-slate-200 bg-white p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                      <MapPin size={20} />
                    </div>

                    <div>
                      <h3 className="font-semibold text-slate-900">
                        School Address
                      </h3>

                      <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-500">
                        {website.contact.address}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {hasSocial && (
          <section className="bg-white">
            <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
              <span className="text-sm font-semibold text-indigo-600">
                Follow Us
              </span>

              <h2 className="mt-3 text-2xl font-bold text-slate-950 sm:text-3xl">
                Stay connected with {website.websiteName}
              </h2>

              <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                {website.socialLinks.facebook && (
                  <SocialLink
                    href={website.socialLinks.facebook}
                    icon={FaFacebook}
                    label="Facebook"
                    className="text-[#1877F2]"
                  />
                )}

                {website.socialLinks.instagram && (
                  <SocialLink
                    href={website.socialLinks.instagram}
                    icon={FaInstagram}
                    label="Instagram"
                    className="text-[#E4405F]"
                  />
                )}

                {website.socialLinks.youtube && (
                  <SocialLink
                    href={website.socialLinks.youtube}
                    icon={FaYoutube}
                    label="YouTube"
                    className="text-[#FF0000]"
                  />
                )}

                {website.socialLinks.twitter && (
                  <SocialLink
                    href={website.socialLinks.twitter}
                    icon={FaXTwitter}
                    label="Twitter / X"
                    className="text-slate-900"
                  />
                )}
              </div>
            </div>
          </section>
        )}

        <section className="bg-indigo-600">
          <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-white">
              Ready to access your portal?
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-indigo-100">
              Choose your portal below and continue to your personalized
              dashboard.
            </p>

            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                to="/staff/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50"
              >
                Staff Dashboard
                <ArrowRight size={17} />
              </Link>

              <Link
                to="/student/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-400 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
              >
                Student Dashboard
                <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

const SocialLink = ({ href, icon: Icon, label, className }) => (
  <a
    href={href}
    target="_blank"
    rel="noreferrer"
    aria-label={label}
    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
  >
    <Icon size={18} className={className} />

    {label}

    <ExternalLink size={13} className="text-slate-400" />
  </a>
);

export default Home;
