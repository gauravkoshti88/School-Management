import {
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Clock3,
  GraduationCap,
  Hash,
  Mail,
  MapPin,
  Phone,
  School,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { useStaff } from "../../context/StaffContext";

const formatDate = (date) => {
  if (!date) {
    return "Not available";
  }

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const DetailItem = ({ icon: Icon, label, value, fullWidth = false }) => {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white p-4 ${
        fullWidth ? "md:col-span-2" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
          <Icon size={18} />
        </div>

        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            {label}
          </p>

          <p className="mt-1 break-words text-sm font-semibold text-slate-800">
            {value || "Not available"}
          </p>
        </div>
      </div>
    </div>
  );
};

const StaffProfile = () => {
  const { staff, loading, error, fullName, initials } = useStaff();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-32 animate-pulse rounded-3xl bg-slate-200" />

        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <div className="mb-6 h-6 w-40 animate-pulse rounded bg-slate-200" />

          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="h-20 animate-pulse rounded-2xl bg-slate-100"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="w-full max-w-md rounded-3xl border border-red-100 bg-red-50 p-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
            <ShieldCheck size={22} />
          </div>

          <h2 className="mt-4 text-lg font-bold text-slate-900">
            Unable to Load Profile
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            {error?.response?.data?.message ||
              error?.message ||
              "Unable to load your profile."}
          </p>
        </div>
      </div>
    );
  }

  if (!staff?._id) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <UserRound size={42} className="mx-auto text-slate-300" />

          <h2 className="mt-4 text-lg font-bold text-slate-800">
            Profile Not Found
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Your staff profile could not be found.
          </p>
        </div>
      </div>
    );
  }

  const assignedClass = staff.assignedClass;

  const staffType =
    staff.staffType === "teacher"
      ? "Teacher"
      : staff.staffType === "peon"
        ? "Peon Staff"
        : staff.staffType === "library"
          ? "Library Staff"
          : "Staff";

  const isTeacher = staff.staffType === "teacher";
  const isPeonStaff = staff.staffType === "peon";
  const isLibraryStaff = staff.staffType === "library";

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          My Profile
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          View your staff account and professional information.
        </p>
      </div>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="h-20 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700" />

        <div className="px-5 pb-6 sm:px-7">
          <div className="-mt-12 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-3xl border-4 border-white bg-slate-100 text-2xl font-bold text-slate-700 shadow-lg">
                {staff.profileImage?.url ? (
                  <img
                    src={staff.profileImage.url}
                    alt={
                      staff.profileImage.alt ||
                      `${fullName || "Staff"} profile image`
                    }
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initials || <UserRound size={32} />
                )}
              </div>

              <div className="pb-1 md:mt-15">
                <h2 className="text-xl font-bold text-slate-900">
                  {fullName || "Staff Member"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">{staffType}</p>
              </div>
            </div>

            <div
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
                staff.status === "active"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              <CheckCircle2 size={17} />

              {staff.status === "active"
                ? "Active Account"
                : "Inactive Account"}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
            <UserRound size={19} />
          </div>

          <div>
            <h2 className="font-bold text-slate-900">Personal Information</h2>

            <p className="text-xs text-slate-500">
              Your registered personal details
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <DetailItem
            icon={UserRound}
            label="First Name"
            value={staff.firstName}
          />

          <DetailItem
            icon={UserRound}
            label="Last Name"
            value={staff.lastName}
          />

          <DetailItem icon={Mail} label="Email Address" value={staff.email} />

          <DetailItem icon={Phone} label="Phone Number" value={staff.phone} />

          <DetailItem icon={UserRound} label="Gender" value={staff.gender} />

          <DetailItem
            icon={CalendarDays}
            label="Date of Birth"
            value={formatDate(staff.dateOfBirth)}
          />

          <DetailItem
            icon={MapPin}
            label="Address"
            value={staff.address}
            fullWidth
          />
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
            <BriefcaseBusiness size={19} />
          </div>

          <div>
            <h2 className="font-bold text-slate-900">
              Professional Information
            </h2>

            <p className="text-xs text-slate-500">
              Your employment and qualification details
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <DetailItem
            icon={Hash}
            label="Employee ID"
            value={staff.employeeId}
          />

          {isTeacher && (
            <>
              <DetailItem
                icon={GraduationCap}
                label="Qualification"
                value={staff.qualification}
              />

              <DetailItem
                icon={GraduationCap}
                label="Specialization"
                value={staff.specialization}
              />

              <DetailItem
                icon={Clock3}
                label="Experience"
                value={staff.experience || "Not specified"}
              />

              <DetailItem
                icon={BriefcaseBusiness}
                label="Department"
                value={staff.department || "Not specified"}
              />
            </>
          )}

          {isLibraryStaff && (
            <>
              <DetailItem
                icon={GraduationCap}
                label="Qualification"
                value={staff.qualification}
              />

              <DetailItem
                icon={BriefcaseBusiness}
                label="Library Role"
                value={staff.libraryRole}
              />

              <DetailItem
                icon={Clock3}
                label="Experience"
                value={staff.experience || "Not specified"}
              />
            </>
          )}

          {isPeonStaff && (
            <>
              <DetailItem icon={Clock3} label="Shift" value={staff.shift} />

              <DetailItem
                icon={Phone}
                label="Emergency Contact"
                value={staff.emergencyContact || "Not specified"}
              />
            </>
          )}

          <DetailItem
            icon={CalendarDays}
            label="Joining Date"
            value={formatDate(staff.joiningDate)}
          />
        </div>
      </section>

      {isTeacher && (
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <School size={19} />
            </div>

            <div>
              <h2 className="font-bold text-slate-900">Assigned Class</h2>

              <p className="text-xs text-slate-500">
                Class currently assigned to you
              </p>
            </div>
          </div>

          {assignedClass ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Class
                  </p>

                  <h3 className="mt-1 text-xl font-bold text-slate-900">
                    {assignedClass.name}
                    {assignedClass.section ? ` - ${assignedClass.section}` : ""}
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Academic Year:{" "}
                    {assignedClass.academicYear || "Not available"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:min-w-[260px]">
                  <div className="rounded-xl bg-white p-3">
                    <p className="text-xs text-slate-400">Room</p>

                    <p className="mt-1 text-sm font-bold text-slate-800">
                      {assignedClass.roomNumber || "Not assigned"}
                    </p>
                  </div>

                  <div className="rounded-xl bg-white p-3">
                    <p className="text-xs text-slate-400">Capacity</p>

                    <p className="mt-1 text-sm font-bold text-slate-800">
                      {assignedClass.capacity || 0}
                    </p>
                  </div>
                </div>
              </div>

              {assignedClass.subjects?.length > 0 && (
                <div className="mt-5 border-t border-slate-200 pt-5">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Subjects
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {assignedClass.subjects.map((subject) => (
                      <span
                        key={subject._id || subject.code}
                        className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600"
                      >
                        {subject.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <School size={32} className="mx-auto text-slate-300" />

              <h3 className="mt-3 font-semibold text-slate-800">
                No Class Assigned
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                You currently don't have a class assigned to you.
              </p>
            </div>
          )}
        </section>
      )}

      <div className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4">
        <ShieldCheck size={20} className="shrink-0 text-blue-600" />

        <p className="text-sm text-blue-700">
          Your profile information is managed by the school administrator.
          Contact the administrator if any information needs to be changed.
        </p>
      </div>
    </div>
  );
};

export default StaffProfile;
