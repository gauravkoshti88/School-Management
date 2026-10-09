import {
  CalendarDays,
  GraduationCap,
  MapPin,
  Phone,
  UserRound,
} from "lucide-react";

import { useStudent } from "../../context/StudentContext";

const formatDate = (date) => {
  if (!date) {
    return "Not available";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Not available";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const getGenderLabel = (gender) => {
  if (!gender) {
    return "Not available";
  }

  return gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
};

const InfoItem = ({ icon: Icon, label, value }) => {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
        <Icon size={20} />
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
  );
};

const StudentProfile = () => {
  const { student, loading, fullName, initials, profileImage } = useStudent();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-32 animate-pulse rounded-3xl bg-white" />

        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-24 animate-pulse rounded-2xl bg-white" />
          <div className="h-24 animate-pulse rounded-2xl bg-white" />
          <div className="h-24 animate-pulse rounded-2xl bg-white" />
          <div className="h-24 animate-pulse rounded-2xl bg-white" />
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="rounded-3xl border border-slate-200 bg-white px-8 py-10 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
            <UserRound size={26} />
          </div>

          <h2 className="mt-4 text-lg font-bold text-slate-900">
            Student profile not found
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            We could not load your profile information.
          </p>
        </div>
      </div>
    );
  }

  const classData =
    student.classId && typeof student.classId === "object"
      ? student.classId
      : null;

  const className = classData?.name || student.className || "Not assigned";

  const section = classData?.section || student.section || "Not assigned";

  const academicYear =
    classData?.academicYear || student.academicYear || "Not available";

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          My Profile
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          View your personal and academic information.
        </p>
      </div>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="h-20 bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-500 sm:h-30" />

        <div className="px-5 pb-6 sm:px-8">
          <div className="-mt-14 flex flex-col gap-5 sm:-mt-16 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end">
              <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-3xl border-4 border-white bg-indigo-100 text-3xl font-bold text-indigo-600 shadow-lg sm:h-32 sm:w-32">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt={
                      student.profileImage?.alt || `${fullName} profile image`
                    }
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initials
                )}
              </div>

              <div className="pb-1">
                <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
                  {fullName}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {student.admissionNumber || "Admission number not available"}
                </p>
              </div>
            </div>

            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-600">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />

              {student.status
                ? student.status.charAt(0).toUpperCase() +
                  student.status.slice(1)
                : "Active"}
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <UserRound size={20} />
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Personal Information
            </h2>

            <p className="text-sm text-slate-500">
              Your basic personal details
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <InfoItem icon={UserRound} label="Full Name" value={fullName} />

          <InfoItem icon={Phone} label="Phone" value={student.phone} />

          <InfoItem
            icon={UserRound}
            label="Gender"
            value={getGenderLabel(student.gender)}
          />

          <InfoItem
            icon={CalendarDays}
            label="Date of Birth"
            value={formatDate(student.dateOfBirth)}
          />

          <InfoItem icon={MapPin} label="Address" value={student.address} />
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
            <GraduationCap size={20} />
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Academic Information
            </h2>

            <p className="text-sm text-slate-500">
              Your school and class details
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <InfoItem
            icon={GraduationCap}
            label="Admission Number"
            value={student.admissionNumber}
          />

          <InfoItem
            icon={UserRound}
            label="Roll Number"
            value={student.rollNumber}
          />

          <InfoItem icon={GraduationCap} label="Class" value={className} />

          <InfoItem icon={UserRound} label="Section" value={section} />

          <InfoItem
            icon={CalendarDays}
            label="Academic Year"
            value={academicYear}
          />

          <InfoItem
            icon={CalendarDays}
            label="Admission Date"
            value={formatDate(student.createdAt)}
          />
        </div>
      </section>

      {(student.fatherName || student.motherName || student.guardianName) && (
        <section>
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <UserRound size={20} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Family Information
              </h2>

              <p className="text-sm text-slate-500">
                Parent and guardian details
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {student.fatherName && (
              <InfoItem
                icon={UserRound}
                label="Father's Name"
                value={student.fatherName}
              />
            )}

            {student.motherName && (
              <InfoItem
                icon={UserRound}
                label="Mother's Name"
                value={student.motherName}
              />
            )}

            {student.guardianName && (
              <InfoItem
                icon={UserRound}
                label="Guardian Name"
                value={student.guardianName}
              />
            )}
          </div>
        </section>
      )}
    </div>
  );
};

export default StudentProfile;
