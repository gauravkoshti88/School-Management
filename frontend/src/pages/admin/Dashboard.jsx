import { useEffect, useState } from "react";
import {
  BriefcaseBusiness,
  CalendarCheck2,
  CheckCircle2,
  Clock3,
  GraduationCap,
  Library,
  LoaderCircle,
  UserRoundPlus,
  Users,
  UserX,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import StaffForm from "../../components/staff/StaffForm";
import { showToast } from "../../components/Toast";

import {
  createLibraryStaff,
  createPeonStaff,
  createTeacher,
  getAdminDashboard,
} from "../../service/staff.service";

import { getStaffAttendance } from "../../service/staffAttendance.service";

const staffOptions = [
  {
    id: "teacher",
    title: "Create Teacher Staff",
    description: "Add a new teacher with academic and contact details.",
    icon: GraduationCap,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    fields: [
      {
        name: "firstName",
        label: "First Name",
        placeholder: "Enter first name",
        section: "personal",
        required: true,
      },
      {
        name: "lastName",
        label: "Last Name",
        placeholder: "Enter last name",
        section: "personal",
        required: true,
      },
      {
        name: "email",
        label: "Email Address",
        type: "email",
        placeholder: "teacher@example.com",
        section: "personal",
        required: true,
      },
      {
        name: "phone",
        label: "Phone Number",
        type: "tel",
        placeholder: "Enter phone number",
        section: "personal",
        required: true,
      },
      {
        name: "gender",
        label: "Gender",
        type: "select",
        options: ["Male", "Female", "Other"],
        section: "personal",
        required: true,
      },
      {
        name: "dateOfBirth",
        label: "Date of Birth",
        type: "date",
        section: "personal",
        required: true,
      },
      {
        name: "qualification",
        label: "Highest Qualification",
        placeholder: "e.g. M.Sc, B.Ed",
        section: "employment",
        required: true,
      },
      {
        name: "specialization",
        label: "Subject Specialization",
        placeholder: "e.g. Mathematics",
        section: "employment",
        required: true,
      },
      {
        name: "experience",
        label: "Experience",
        placeholder: "e.g. 5 Years",
        section: "employment",
      },
      {
        name: "joiningDate",
        label: "Joining Date",
        type: "date",
        section: "employment",
        required: true,
      },
      {
        name: "employeeId",
        label: "Employee ID",
        placeholder: "e.g. TCH-001",
        section: "employment",
        required: true,
      },
      {
        name: "department",
        label: "Department",
        placeholder: "e.g. Science",
        section: "employment",
      },
      {
        name: "address",
        label: "Address",
        type: "textarea",
        placeholder: "Enter complete address",
        section: "employment",
        fullWidth: true,
      },
    ],
  },

  {
    id: "peon",
    title: "Create Peon Staff",
    description: "Add school support staff with personal and job details.",
    icon: BriefcaseBusiness,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    fields: [
      {
        name: "firstName",
        label: "First Name",
        placeholder: "Enter first name",
        section: "personal",
        required: true,
      },
      {
        name: "lastName",
        label: "Last Name",
        placeholder: "Enter last name",
        section: "personal",
        required: true,
      },
      {
        name: "phone",
        label: "Phone Number",
        type: "tel",
        placeholder: "Enter phone number",
        section: "personal",
        required: true,
      },
      {
        name: "email",
        label: "Email Address",
        type: "email",
        placeholder: "peon@example.com",
        section: "personal",
      },
      {
        name: "gender",
        label: "Gender",
        type: "select",
        options: ["Male", "Female", "Other"],
        section: "personal",
        required: true,
      },
      {
        name: "dateOfBirth",
        label: "Date of Birth",
        type: "date",
        section: "personal",
      },
      {
        name: "employeeId",
        label: "Employee ID",
        placeholder: "e.g. PON-001",
        section: "employment",
        required: true,
      },
      {
        name: "joiningDate",
        label: "Joining Date",
        type: "date",
        section: "employment",
        required: true,
      },
      {
        name: "shift",
        label: "Work Shift",
        type: "select",
        options: ["Morning", "Afternoon", "Full Day"],
        section: "employment",
        required: true,
      },
      {
        name: "emergencyContact",
        label: "Emergency Contact",
        type: "tel",
        placeholder: "Emergency contact number",
        section: "employment",
      },
      {
        name: "address",
        label: "Address",
        type: "textarea",
        placeholder: "Enter complete address",
        section: "employment",
        fullWidth: true,
        required: true,
      },
    ],
  },

  {
    id: "library",
    title: "Create Library Staff",
    description: "Add library staff with library and contact information.",
    icon: Library,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    fields: [
      {
        name: "firstName",
        label: "First Name",
        placeholder: "Enter first name",
        section: "personal",
        required: true,
      },
      {
        name: "lastName",
        label: "Last Name",
        placeholder: "Enter last name",
        section: "personal",
        required: true,
      },
      {
        name: "email",
        label: "Email Address",
        type: "email",
        placeholder: "library@example.com",
        section: "personal",
        required: true,
      },
      {
        name: "phone",
        label: "Phone Number",
        type: "tel",
        placeholder: "Enter phone number",
        section: "personal",
        required: true,
      },
      {
        name: "gender",
        label: "Gender",
        type: "select",
        options: ["Male", "Female", "Other"],
        section: "personal",
        required: true,
      },
      {
        name: "dateOfBirth",
        label: "Date of Birth",
        type: "date",
        section: "personal",
      },
      {
        name: "employeeId",
        label: "Employee ID",
        placeholder: "e.g. LIB-001",
        section: "employment",
        required: true,
      },
      {
        name: "joiningDate",
        label: "Joining Date",
        type: "date",
        section: "employment",
        required: true,
      },
      {
        name: "libraryRole",
        label: "Library Role",
        placeholder: "e.g. Librarian",
        section: "employment",
        required: true,
      },
      {
        name: "qualification",
        label: "Qualification",
        placeholder: "e.g. B.Lib / M.Lib",
        section: "employment",
        required: true,
      },
      {
        name: "experience",
        label: "Experience",
        placeholder: "e.g. 3 Years",
        section: "employment",
      },
      {
        name: "address",
        label: "Address",
        type: "textarea",
        placeholder: "Enter complete address",
        section: "employment",
        fullWidth: true,
      },
    ],
  },
];

const emptyStats = {
  totalStaff: 0,
  totalTeachers: 0,
  totalPeonStaff: 0,
  totalLibraryStaff: 0,
  activeStaff: 0,
  inactiveStaff: 0,
};

const emptyAttendance = {
  total: 0,
  present: 0,
  absent: 0,
  late: 0,
  leave: 0,
  marked: 0,
  percentage: 0,
};

const getTodayDate = () => {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const calculateAttendance = (staff = []) => {
  const result = {
    total: staff.length,
    present: 0,
    absent: 0,
    late: 0,
    leave: 0,
    marked: 0,
    percentage: 0,
  };

  staff.forEach((member) => {
    const status = member.attendance?.status || "present";

    if (member.attendanceMarked) {
      result.marked += 1;
    }

    if (status === "present") {
      result.present += 1;
    }

    if (status === "absent") {
      result.absent += 1;
    }

    if (status === "late") {
      result.late += 1;
    }

    if (status === "leave") {
      result.leave += 1;
    }
  });

  const total = result.total;

  if (total > 0) {
    result.percentage = Math.round(
      ((result.present + result.late) / total) * 100,
    );
  }

  return result;
};

const Dashboard = () => {
  const navigate = useNavigate();

  const [activeForm, setActiveForm] = useState(null);

  const [formData, setFormData] = useState({
    teacher: {},
    peon: {},
    library: {},
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const [dashboardData, setDashboardData] = useState({
    stats: emptyStats,
    recentStaff: [],
  });

  const [attendance, setAttendance] = useState(emptyAttendance);

  const [loadingDashboard, setLoadingDashboard] = useState(true);

  const [loadingAttendance, setLoadingAttendance] = useState(true);

  const selectedStaff = staffOptions.find((staff) => staff.id === activeForm);

  const fetchDashboard = async () => {
    try {
      setLoadingDashboard(true);

      const response = await getAdminDashboard();

      setDashboardData({
        stats: response.stats || emptyStats,
        recentStaff: response.recentStaff || [],
      });
    } catch (error) {
      console.error("Get admin dashboard error:", error);

      showToast.error(
        error.response?.data?.message || "Unable to load dashboard data.",
      );
    } finally {
      setLoadingDashboard(false);
    }
  };

  const fetchAttendance = async () => {
    try {
      setLoadingAttendance(true);

      const date = getTodayDate();

      const staffTypes = ["teacher", "peon", "library"];

      const responses = await Promise.all(
        staffTypes.map((staffType) =>
          getStaffAttendance({
            staffType,
            date,
          }),
        ),
      );

      const allStaff = responses.flatMap((response) => response?.staff || []);

      setAttendance(calculateAttendance(allStaff));
    } catch (error) {
      console.error("Get staff attendance dashboard error:", error);

      setAttendance(emptyAttendance);
    } finally {
      setLoadingAttendance(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    fetchAttendance();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [activeForm]: {
        ...previous[activeForm],
        [name]: value,
      },
    }));

    setFieldErrors((previous) => {
      if (!previous[name]) {
        return previous;
      }

      const updatedErrors = {
        ...previous,
      };

      delete updatedErrors[name];

      return updatedErrors;
    });
  };

  const preparePayload = (data) => {
    const payload = {
      ...data,
    };

    Object.keys(payload).forEach((key) => {
      if (payload[key] === "") {
        delete payload[key];
      }
    });

    return payload;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!activeForm) {
      return;
    }

    try {
      setSubmitting(true);
      setFieldErrors({});

      const payload = preparePayload(formData[activeForm]);

      let response;

      if (activeForm === "teacher") {
        response = await createTeacher(payload);
      }

      if (activeForm === "peon") {
        response = await createPeonStaff(payload);
      }

      if (activeForm === "library") {
        response = await createLibraryStaff(payload);
      }

      if (!response) {
        throw new Error("No response received from server.");
      }

      showToast.success(response.message || "Staff created successfully.");

      setFormData((previous) => ({
        ...previous,
        [activeForm]: {},
      }));

      setFieldErrors({});
      setActiveForm(null);

      await Promise.all([fetchDashboard(), fetchAttendance()]);
    } catch (error) {
      console.error("Create staff error:", error);

      const errorData = error.response?.data;

      if (
        error.response?.status === 409 &&
        errorData?.code === "DUPLICATE_FIELD"
      ) {
        const field = errorData.field;

        const message = errorData.message || "This value already exists.";

        setFieldErrors({
          [field]: message,
        });

        showToast.error(message);

        return;
      }

      showToast.error(
        errorData?.message ||
          error.message ||
          "Unable to create staff. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseForm = () => {
    if (submitting) {
      return;
    }

    setFieldErrors({});
    setActiveForm(null);
  };

  const handleOpenForm = (staffId) => {
    if (submitting) {
      return;
    }

    setFieldErrors({});
    setActiveForm(staffId);
  };

  if (activeForm && selectedStaff) {
    return (
      <StaffForm
        staff={selectedStaff}
        formData={formData[activeForm]}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onClose={handleCloseForm}
        submitting={submitting}
        fieldErrors={fieldErrors}
      />
    );
  }

  const stats = dashboardData.stats;

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <p className="mb-2 text-sm font-semibold text-indigo-600">
          School Administration
        </p>

        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Welcome to Admin Dashboard
        </h1>

        <p className="mt-2 max-w-2xl text-sm text-slate-500 sm:text-base">
          Manage your school staff and daily administration from one place.
        </p>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <DashboardStat
          icon={Users}
          label="Total Staff"
          value={stats.totalStaff}
          iconClass="bg-indigo-100 text-indigo-600"
          loading={loadingDashboard}
        />

        <DashboardStat
          icon={GraduationCap}
          label="Teachers"
          value={stats.totalTeachers}
          iconClass="bg-blue-100 text-blue-600"
          loading={loadingDashboard}
        />

        <DashboardStat
          icon={BriefcaseBusiness}
          label="Support Staff"
          value={stats.totalPeonStaff}
          iconClass="bg-amber-100 text-amber-600"
          loading={loadingDashboard}
        />

        <DashboardStat
          icon={Library}
          label="Library Staff"
          value={stats.totalLibraryStaff}
          iconClass="bg-emerald-100 text-emerald-600"
          loading={loadingDashboard}
        />
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
          <p className="text-sm font-medium text-emerald-700">Active Staff</p>

          <div className="mt-2 flex items-end justify-between gap-4">
            <h3 className="text-3xl font-bold text-emerald-800">
              {loadingDashboard ? (
                <span className="inline-block h-9 w-14 animate-pulse rounded-lg bg-emerald-200" />
              ) : (
                stats.activeStaff
              )}
            </h3>

            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-700">
              Currently Active
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-red-100 bg-red-50 p-5">
          <p className="text-sm font-medium text-red-700">Inactive Staff</p>

          <div className="mt-2 flex items-end justify-between gap-4">
            <h3 className="text-3xl font-bold text-red-800">
              {loadingDashboard ? (
                <span className="inline-block h-9 w-14 animate-pulse rounded-lg bg-red-200" />
              ) : (
                stats.inactiveStaff
              )}
            </h3>

            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-red-700">
              Not Active
            </span>
          </div>
        </div>
      </div>

      <div className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <CalendarCheck2 size={21} />
              </div>

              <div>
                <h2 className="font-bold text-slate-900">
                  Today's Staff Attendance
                </h2>

                <p className="text-xs text-slate-500">
                  Attendance summary for all active staff
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate("/admin/staff-attendance")}
            className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Manage Attendance
          </button>
        </div>

        <div className="p-5 sm:p-6">
          {loadingAttendance ? (
            <div className="flex min-h-32 items-center justify-center">
              <LoaderCircle
                size={27}
                className="animate-spin text-indigo-600"
              />
            </div>
          ) : attendance.total === 0 ? (
            <div className="rounded-xl bg-slate-50 px-5 py-10 text-center">
              <Users size={30} className="mx-auto text-slate-300" />

              <p className="mt-3 text-sm font-semibold text-slate-600">
                No active staff found.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm text-slate-500">Overall Attendance</p>

                  <div className="mt-1 flex items-end gap-2">
                    <h3 className="text-3xl font-bold text-slate-900">
                      {attendance.percentage}%
                    </h3>

                    <span className="mb-1 text-xs font-medium text-slate-500">
                      Present + Late
                    </span>
                  </div>
                </div>

                <p className="text-xs font-medium text-slate-500">
                  {attendance.marked} of {attendance.total} marked
                </p>
              </div>

              <div className="mb-6 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                  style={{
                    width: `${attendance.percentage}%`,
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <AttendanceSummaryCard
                  icon={CheckCircle2}
                  label="Present"
                  value={attendance.present}
                  className="border-emerald-100 bg-emerald-50 text-emerald-700"
                />

                <AttendanceSummaryCard
                  icon={XCircle}
                  label="Absent"
                  value={attendance.absent}
                  className="border-red-100 bg-red-50 text-red-700"
                />

                <AttendanceSummaryCard
                  icon={Clock3}
                  label="Late"
                  value={attendance.late}
                  className="border-amber-100 bg-amber-50 text-amber-700"
                />

                <AttendanceSummaryCard
                  icon={UserX}
                  label="Leave"
                  value={attendance.leave}
                  className="border-blue-100 bg-blue-50 text-blue-700"
                />
              </div>
            </>
          )}
        </div>
      </div>

      <div className="mb-5">
        <h2 className="text-lg font-bold text-slate-900">
          Quick Staff Actions
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Select the staff type you want to create.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {staffOptions.map((staff) => {
          const Icon = staff.icon;

          return (
            <button
              key={staff.id}
              type="button"
              onClick={() => handleOpenForm(staff.id)}
              className="group rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl ${staff.iconBg}`}
                >
                  <Icon size={27} className={staff.iconColor} />
                </div>

                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition group-hover:bg-indigo-50 group-hover:text-indigo-600">
                  <UserRoundPlus size={18} />
                </div>
              </div>

              <h3 className="mt-6 text-lg font-bold text-slate-900">
                {staff.title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                {staff.description}
              </p>

              <div className="mt-6 text-sm font-semibold text-indigo-600">
                Create Staff →
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-5">
          <h2 className="font-bold text-slate-900">Recent Staff</h2>

          <p className="mt-1 text-sm text-slate-500">
            Recently added staff members.
          </p>
        </div>

        {loadingDashboard ? (
          <div className="flex items-center justify-center px-6 py-12">
            <LoaderCircle size={25} className="animate-spin text-indigo-600" />
          </div>
        ) : dashboardData.recentStaff.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Users size={30} className="mx-auto text-slate-300" />

            <p className="mt-3 text-sm font-medium text-slate-500">
              No staff members found.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {dashboardData.recentStaff.map((staff) => (
              <div
                key={`${staff.staffType}-${staff._id}`}
                className="flex flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-sm font-bold text-indigo-600">
                    {staff.firstName?.charAt(0)}
                    {staff.lastName?.charAt(0)}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {staff.firstName} {staff.lastName}
                    </p>

                    <p className="truncate text-xs text-slate-500">
                      {staff.email || staff.phone || "No contact information"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:shrink-0">
                  <div className="text-left sm:text-right">
                    <p className="text-xs font-medium capitalize text-slate-500">
                      {staff.staffType}
                    </p>

                    <p className="mt-0.5 text-xs text-slate-400">
                      {staff.employeeId}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      staff.status === "active"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {staff.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-bold text-slate-900">Staff Management</h2>

            <p className="mt-1 text-sm text-slate-500">
              Create and manage your school staff from the dashboard.
            </p>
          </div>

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
            <Users size={21} />
          </div>
        </div>
      </div>
    </div>
  );
};

const DashboardStat = ({ icon: Icon, label, value, iconClass, loading }) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div
        className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${iconClass}`}
      >
        <Icon size={21} />
      </div>

      <p className="text-sm text-slate-500">{label}</p>

      {loading ? (
        <div className="mt-2 h-8 w-14 animate-pulse rounded-lg bg-slate-200" />
      ) : (
        <h3 className="mt-1 text-2xl font-bold text-slate-900">{value}</h3>
      )}
    </div>
  );
};

const AttendanceSummaryCard = ({ icon: Icon, label, value, className }) => {
  return (
    <div className={`rounded-xl border p-4 ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold">{label}</p>

          <p className="mt-1 text-2xl font-bold">{value}</p>
        </div>

        <Icon size={21} />
      </div>
    </div>
  );
};

export default Dashboard;
