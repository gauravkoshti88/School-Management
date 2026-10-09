import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const PortalCard = ({ icon: Icon, title, description, buttonText, to }) => {
  return (
    <Link
      to={to}
      className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl sm:p-8"
    >
      <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-indigo-50 transition duration-300 group-hover:scale-150" />

      <div className="relative">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-100">
          <Icon size={26} />
        </div>

        <h3 className="mt-6 text-xl font-bold text-slate-900">{title}</h3>

        <p className="mt-3 text-sm leading-6 text-slate-500">{description}</p>

        <div className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600">
          {buttonText}

          <ArrowRight
            size={17}
            className="transition-transform duration-300 group-hover:translate-x-1"
          />
        </div>
      </div>
    </Link>
  );
};

export default PortalCard;
