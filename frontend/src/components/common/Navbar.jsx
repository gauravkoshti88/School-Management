import { Menu, School, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { useWebsite } from "../../context/WebsiteContext";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  const { website } = useWebsite();

  const closeMenu = () => {
    setOpen(false);
  };

  const logo = website.lightLogo?.url || website.darkLogo?.url || "";

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" onClick={closeMenu} className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-indigo-600 text-white">
            {logo ? (
              <img
                src={logo}
                alt={website.lightLogo?.alt || website.websiteName}
                className="h-full w-full object-contain"
              />
            ) : (
              <School size={22} />
            )}
          </div>

          <div>
            <h1 className="text-lg font-bold leading-none text-slate-900">
              {website.websiteName}
            </h1>

            <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-slate-400">
              School Management
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <a
            href="#home"
            className="text-sm font-medium text-slate-600 transition hover:text-indigo-600"
          >
            Home
          </a>

          <a
            href="#about"
            className="text-sm font-medium text-slate-600 transition hover:text-indigo-600"
          >
            About
          </a>

          <a
            href="#services"
            className="text-sm font-medium text-slate-600 transition hover:text-indigo-600"
          >
            Services
          </a>

          <a
            href="#contact"
            className="text-sm font-medium text-slate-600 transition hover:text-indigo-600"
          >
            Contact
          </a>

          <Link
            to="/admin/login"
            className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          >
            Admin Login
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-100 bg-white md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col px-4 py-3">
            <a
              href="#home"
              onClick={closeMenu}
              className="rounded-lg px-3 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-indigo-600"
            >
              Home
            </a>

            <a
              href="#about"
              onClick={closeMenu}
              className="rounded-lg px-3 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-indigo-600"
            >
              About
            </a>

            <a
              href="#services"
              onClick={closeMenu}
              className="rounded-lg px-3 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-indigo-600"
            >
              Services
            </a>

            <a
              href="#contact"
              onClick={closeMenu}
              className="rounded-lg px-3 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-indigo-600"
            >
              Contact
            </a>

            <Link
              to="/admin/login"
              onClick={closeMenu}
              className="mt-2 rounded-xl bg-indigo-600 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              Admin Login
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
