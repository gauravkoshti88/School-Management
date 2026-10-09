import { Mail, MapPin, Phone, School } from "lucide-react";

import { useWebsite } from "../../context/WebsiteContext";

const Footer = () => {
  const { website } = useWebsite();

  const logo = website.darkLogo?.url || website.lightLogo?.url || "";

  return (
    <footer
      id="contact"
      className="border-t border-slate-800 bg-slate-950 text-white"
    >
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-indigo-600">
                {logo ? (
                  <img
                    src={logo}
                    alt={website.darkLogo?.alt || website.websiteName}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <School size={20} />
                )}
              </div>

              <div>
                <h2 className="text-base font-bold">{website.websiteName}</h2>

                <p className="text-[11px] text-slate-500">
                  School Management System
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white">
              Quick Links
            </h3>

            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
              <a
                href="#home"
                className="text-sm text-slate-400 transition hover:text-white"
              >
                Home
              </a>

              <a
                href="#about"
                className="text-sm text-slate-400 transition hover:text-white"
              >
                About
              </a>

              <a
                href="#services"
                className="text-sm text-slate-400 transition hover:text-white"
              >
                Services
              </a>

              <a
                href="#contact"
                className="text-sm text-slate-400 transition hover:text-white"
              >
                Contact
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white">
              Contact
            </h3>

            <div className="mt-3 space-y-2.5">
              {website.contact?.address && (
                <div className="flex items-start gap-2.5">
                  <MapPin
                    size={16}
                    className="mt-0.5 shrink-0 text-indigo-400"
                  />

                  <p className="text-sm leading-5 text-slate-400">
                    {website.contact.address}
                  </p>
                </div>
              )}

              {website.contact?.phone && (
                <a
                  href={`tel:${website.contact.phone}`}
                  className="flex items-center gap-2.5 text-sm text-slate-400 transition hover:text-white"
                >
                  <Phone size={16} className="shrink-0 text-indigo-400" />
                  {website.contact.phone}
                </a>
              )}

              {website.contact?.email && (
                <a
                  href={`mailto:${website.contact.email}`}
                  className="flex items-center gap-2.5 text-sm text-slate-400 transition hover:text-white"
                >
                  <Mail size={16} className="shrink-0 text-indigo-400" />
                  <span className="break-all">{website.contact.email}</span>
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="mt-7 border-t border-slate-800 pt-5 text-center">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} {website.websiteName}. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
