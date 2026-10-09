import { Loader2, UserCheck, Users, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";

import AttendanceFilters from "../../components/attendance/AttendanceFilters";
import AttendanceStats from "../../components/attendance/AttendanceStats";
import StaffAttendanceTable from "../../components/attendance/StaffAttendanceTable";

import {
  getStaffAttendance,
  saveStaffAttendance,
} from "../../service/staffAttendance.service";

const STAFF_TYPES = [
  {
    value: "teacher",
    label: "Teacher",
  },
  {
    value: "peon",
    label: "Peon",
  },
  {
    value: "library",
    label: "Librarian",
  },
];

const getTodayDate = () => {
  const date = new Date();

  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const normalizeStaff = (staff) => {
  return {
    ...staff,

    attendance: {
      _id: staff?.attendance?._id || null,

      status: staff?.attendance?.status || "present",

      checkIn: staff?.attendance?.checkIn || "",

      checkOut: staff?.attendance?.checkOut || "",

      remarks: staff?.attendance?.remarks || "",
    },
  };
};

const StaffAttendance = () => {
  const [staffType, setStaffType] = useState("");

  const [date, setDate] = useState(getTodayDate());

  const [staff, setStaff] = useState([]);

  const [loading, setLoading] = useState(false);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const selectedStaffType = useMemo(
    () => STAFF_TYPES.find((item) => item.value === staffType),
    [staffType],
  );

  const loadAttendance = useCallback(async () => {
    if (!staffType || !date) {
      setStaff([]);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await getStaffAttendance({
        staffType,
        date,
      });

      const staffList = response?.staff || response?.data?.staff || [];

      setStaff(staffList.map(normalizeStaff));
    } catch (error) {
      console.error("Load staff attendance error:", error);

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to load attendance.";

      setError(message);
      setStaff([]);

      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [staffType, date]);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  const handleStaffTypeChange = (value) => {
    setStaffType(value);
    setError("");
  };

  const handleDateChange = (value) => {
    setDate(value);
    setError("");
  };

  const updateStaffAttendance = (staffId, data) => {
    setStaff((currentStaff) =>
      currentStaff.map((member) => {
        if (member._id?.toString() !== staffId?.toString()) {
          return member;
        }

        return {
          ...member,

          attendance: {
            ...member.attendance,
            ...data,
          },
        };
      }),
    );
  };

  const handleStatusChange = (staffId, status) => {
    updateStaffAttendance(staffId, { status });
  };

  const handleCheckInChange = (staffId, checkIn) => {
    updateStaffAttendance(staffId, { checkIn });
  };

  const handleCheckOutChange = (staffId, checkOut) => {
    updateStaffAttendance(staffId, { checkOut });
  };

  const handleRemarksChange = (staffId, remarks) => {
    updateStaffAttendance(staffId, { remarks });
  };

  const handleMarkAllPresent = () => {
    setStaff((currentStaff) =>
      currentStaff.map((member) => ({
        ...member,

        attendance: {
          ...member.attendance,
          status: "present",
        },
      })),
    );

    toast.success("All staff marked as present.");
  };

  const handleSaveAttendance = async () => {
    if (!staffType) {
      toast.error("Please select a staff type.");

      return;
    }

    if (!date) {
      toast.error("Please select an attendance date.");

      return;
    }

    if (staff.length === 0) {
      toast.error("No staff available for attendance.");

      return;
    }

    try {
      setSaving(true);

      const attendance = staff.map((member) => ({
        staffId: member._id,

        status: member.attendance?.status || "present",

        checkIn: member.attendance?.checkIn || "",

        checkOut: member.attendance?.checkOut || "",

        remarks: member.attendance?.remarks || "",
      }));

      const response = await saveStaffAttendance({
        staffType,
        date,
        attendance,
      });

      toast.success(response?.message || "Attendance saved successfully.");

      await loadAttendance();
    } catch (error) {
      console.error("Save staff attendance error:", error);

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to save attendance.";

      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const stats = useMemo(() => {
    return staff.reduce(
      (result, member) => {
        const status = member.attendance?.status || "present";

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

        return result;
      },
      {
        present: 0,
        absent: 0,
        late: 0,
        leave: 0,
      },
    );
  }, [staff]);

  return (
    <div className="min-h-full bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm font-medium text-indigo-600">
            <UserCheck size={17} />
            Staff Management
          </div>

          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Staff Attendance
          </h1>

          <p className="mt-1 text-sm text-slate-500 sm:text-base">
            Manage daily attendance of school staff.
          </p>
        </div>

        <div className="mb-6">
          <AttendanceFilters
            date={date}
            staffType={staffType}
            staffTypes={STAFF_TYPES}
            onDateChange={handleDateChange}
            onStaffTypeChange={handleStaffTypeChange}
          />
        </div>

        {!staffType && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <Users size={30} />
            </div>

            <h2 className="mt-5 text-lg font-bold text-slate-900">
              Select Staff Type
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Select Teacher, Peon or Librarian to view and manage their
              attendance.
            </p>
          </div>
        )}

        {staffType && loading && (
          <div className="flex min-h-80 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col items-center gap-3">
              <Loader2 size={30} className="animate-spin text-indigo-600" />

              <p className="text-sm font-medium text-slate-500">
                Loading attendance...
              </p>
            </div>
          </div>
        )}

        {staffType && !loading && error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
            <X size={20} className="mt-0.5 shrink-0" />

            <div>
              <p className="text-sm font-semibold">Unable to load attendance</p>

              <p className="mt-1 text-sm">{error}</p>
            </div>
          </div>
        )}

        {staffType && !loading && !error && (
          <div className="space-y-6">
            <AttendanceStats
              present={stats.present}
              absent={stats.absent}
              late={stats.late}
              leave={stats.leave}
            />

            <StaffAttendanceTable
              staff={staff}
              staffTypeLabel={selectedStaffType?.label || "Staff"}
              saving={saving}
              onStatusChange={handleStatusChange}
              onCheckInChange={handleCheckInChange}
              onCheckOutChange={handleCheckOutChange}
              onRemarksChange={handleRemarksChange}
              onMarkAllPresent={handleMarkAllPresent}
              onSave={handleSaveAttendance}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffAttendance;
