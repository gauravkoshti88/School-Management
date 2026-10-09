import { useEffect, useMemo, useState } from "react";
import {
  GraduationCap,
  LoaderCircle,
  RefreshCw,
  Search,
  Users,
} from "lucide-react";

import { showToast } from "../../components/Toast";
import { getAllStudents } from "../../service/student.service";

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchStudents = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await getAllStudents();

      setStudents(response.students || []);
    } catch (error) {
      console.error("Get all students error:", error);

      showToast.error(
        error.response?.data?.message || "Unable to load students.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const classOptions = useMemo(() => {
    const classes = students
      .map((student) => {
        if (!student.classId) {
          return null;
        }

        return {
          id: student.classId._id,
          name: student.classId.name,
          section: student.classId.section,
          academicYear: student.classId.academicYear,
        };
      })
      .filter(Boolean);

    const uniqueClasses = new Map();

    classes.forEach((item) => {
      uniqueClasses.set(item.id, item);
    });

    return Array.from(uniqueClasses.values()).sort((a, b) => {
      const first = Number(String(a.name).replace(/\D/g, ""));

      const second = Number(String(b.name).replace(/\D/g, ""));

      if (!Number.isNaN(first) && !Number.isNaN(second) && first !== second) {
        return first - second;
      }

      return String(a.name).localeCompare(String(b.name));
    });
  }, [students]);

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return students.filter((student) => {
      const fullName = `${student.firstName || ""} ${student.lastName || ""}`
        .trim()
        .toLowerCase();

      const admissionNumber = String(
        student.admissionNumber || "",
      ).toLowerCase();

      const rollNumber = String(student.rollNumber || "").toLowerCase();

      const phone = String(student.phone || "").toLowerCase();

      const matchesSearch =
        !query ||
        fullName.includes(query) ||
        admissionNumber.includes(query) ||
        rollNumber.includes(query) ||
        phone.includes(query);

      const matchesClass =
        classFilter === "all" || student.classId?._id === classFilter;

      const matchesStatus =
        statusFilter === "all" || student.status === statusFilter;

      return matchesSearch && matchesClass && matchesStatus;
    });
  }, [students, search, classFilter, statusFilter]);

  const activeStudents = students.filter(
    (student) => student.status === "active",
  ).length;

  const inactiveStudents = students.filter(
    (student) => student.status === "inactive",
  ).length;

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-sm font-semibold text-indigo-600">
            Student Management
          </p>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            All Students
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-slate-500 sm:text-base">
            View and manage all students registered in the school.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchStudents(true)}
          disabled={loading || refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw size={17} className={refreshing ? "animate-spin" : ""} />

          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard
          icon={Users}
          label="Total Students"
          value={students.length}
          loading={loading}
          iconClass="bg-indigo-100 text-indigo-600"
        />

        <SummaryCard
          icon={GraduationCap}
          label="Active Students"
          value={activeStudents}
          loading={loading}
          iconClass="bg-emerald-100 text-emerald-600"
        />

        <SummaryCard
          icon={Users}
          label="Inactive Students"
          value={inactiveStudents}
          loading={loading}
          iconClass="bg-red-100 text-red-600"
        />
      </div>

      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[1fr_220px_180px]">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, admission no, roll no..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <select
            value={classFilter}
            onChange={(event) => setClassFilter(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          >
            <option value="all">All Classes</option>

            {classOptions.map((schoolClass) => (
              <option key={schoolClass.id} value={schoolClass.id}>
                {schoolClass.name} - Section {schoolClass.section}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          >
            <option value="all">All Status</option>

            <option value="active">Active</option>

            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="font-bold text-slate-900">Student Records</h2>

            <p className="mt-1 text-xs text-slate-500">
              Showing {filteredStudents.length} of {students.length} students
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-80 items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <LoaderCircle
                size={30}
                className="animate-spin text-indigo-600"
              />

              <p className="text-sm text-slate-500">Loading students...</p>
            </div>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="flex min-h-80 flex-col items-center justify-center px-5 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <Users size={26} />
            </div>

            <h3 className="mt-4 font-semibold text-slate-900">
              No students found
            </h3>

            <p className="mt-1 max-w-md text-sm text-slate-500">
              {students.length === 0
                ? "No students have been added to the school yet."
                : "Try changing your search or filter."}
            </p>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[1050px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Student
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Admission No.
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Roll No.
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Class
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Parent
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Phone
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((student) => (
                    <StudentRow key={student._id} student={student} />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-slate-100 lg:hidden">
              {filteredStudents.map((student) => (
                <StudentMobileCard key={student._id} student={student} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const SummaryCard = ({ icon: Icon, label, value, loading, iconClass }) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div
        className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${iconClass}`}
      >
        <Icon size={21} />
      </div>

      <p className="text-sm text-slate-500">{label}</p>

      {loading ? (
        <div className="mt-2 h-8 w-16 animate-pulse rounded-lg bg-slate-200" />
      ) : (
        <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
      )}
    </div>
  );
};

const StudentRow = ({ student }) => {
  const fullName =
    `${student.firstName || ""} ${student.lastName || ""}`.trim();

  const className = student.classId
    ? `${student.classId.name} - ${student.classId.section}`
    : "Not Assigned";

  return (
    <tr className="transition hover:bg-slate-50">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <StudentAvatar
            firstName={student.firstName}
            lastName={student.lastName}
          />

          <div>
            <p className="font-semibold text-slate-900">{fullName}</p>

            <p className="mt-0.5 text-xs text-slate-500">
              {student.gender || "Gender not available"}
            </p>
          </div>
        </div>
      </td>

      <td className="px-5 py-4">
        <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
          {student.admissionNumber || "-"}
        </span>
      </td>

      <td className="px-5 py-4 text-sm font-semibold text-slate-700">
        {student.rollNumber || "-"}
      </td>

      <td className="px-5 py-4">
        <p className="text-sm font-medium text-slate-800">{className}</p>

        {student.classId?.academicYear && (
          <p className="mt-0.5 text-xs text-slate-400">
            {student.classId.academicYear}
          </p>
        )}
      </td>

      <td className="px-5 py-4">
        <p className="text-sm font-medium text-slate-700">
          {student.fatherName || "-"}
        </p>

        <p className="mt-0.5 text-xs text-slate-400">Father</p>
      </td>

      <td className="px-5 py-4 text-sm text-slate-600">
        {student.phone || "-"}
      </td>

      <td className="px-5 py-4">
        <StatusBadge status={student.status} />
      </td>
    </tr>
  );
};

const StudentMobileCard = ({ student }) => {
  const fullName =
    `${student.firstName || ""} ${student.lastName || ""}`.trim();

  const className = student.classId
    ? `${student.classId.name} - ${student.classId.section}`
    : "Not Assigned";

  return (
    <div className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <StudentAvatar
            firstName={student.firstName}
            lastName={student.lastName}
          />

          <div className="min-w-0">
            <p className="truncate font-semibold text-slate-900">{fullName}</p>

            <p className="mt-0.5 text-xs text-slate-500">
              {student.admissionNumber}
            </p>
          </div>
        </div>

        <StatusBadge status={student.status} />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <InfoItem label="Roll Number" value={student.rollNumber} />

        <InfoItem label="Class" value={className} />

        <InfoItem label="Father" value={student.fatherName} />

        <InfoItem label="Phone" value={student.phone} />
      </div>
    </div>
  );
};

const InfoItem = ({ label, value }) => {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 truncate text-sm font-semibold text-slate-700">
        {value || "-"}
      </p>
    </div>
  );
};

const StudentAvatar = ({ firstName, lastName }) => {
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
      {firstName?.charAt(0)?.toUpperCase()}
      {lastName?.charAt(0)?.toUpperCase()}
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const isActive = status === "active";

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
        isActive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
      }`}
    >
      {isActive ? "Active" : "Inactive"}
    </span>
  );
};

export default Students;
