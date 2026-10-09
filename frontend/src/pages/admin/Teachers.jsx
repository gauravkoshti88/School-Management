import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, RefreshCw, Search, UserRound, X } from "lucide-react";

import {
  createTeacher,
  deleteTeacher,
  getTeachers,
  updateTeacher,
  uploadTeacherProfileImage,
} from "../../service/staff.service";

import StaffCard from "../../components/staff/StaffCard";
import StaffForm from "../../components/staff/StaffForm";
import ConfirmModal from "../../components/common/ConfirmModal";
import { showToast } from "../../components/Toast";
import { staffConfigs } from "../../config/staff.config";

const extractTeacherList = (response) => {
  const candidates = [
    response,
    response?.teachers,
    response?.staff,
    response?.data,
    response?.data?.teachers,
    response?.data?.staff,
  ];

  return candidates.find((item) => Array.isArray(item)) || [];
};

const normalizeDate = (value) => {
  if (!value) {
    return "";
  }

  return String(value).slice(0, 10);
};

const extractTeacher = (response) => {
  return (
    response?.teacher ||
    response?.data?.teacher ||
    response?.staff ||
    response?.data?.staff ||
    response?.data ||
    response
  );
};

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);

  const [activeForm, setActiveForm] = useState(null);
  const [formData, setFormData] = useState({});
  const [profileImage, setProfileImage] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const fetchTeachers = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await getTeachers();

      setTeachers(extractTeacherList(response));
    } catch (error) {
      console.error("Fetch teachers error:", error);

      showToast.error(
        error.response?.data?.message || "Unable to load teachers.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  const filteredTeachers = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return teachers;
    }

    return teachers.filter((teacher) => {
      const fullName = `${teacher.firstName || ""} ${
        teacher.lastName || ""
      }`.toLowerCase();

      return (
        fullName.includes(value) ||
        teacher.email?.toLowerCase().includes(value) ||
        teacher.phone?.includes(value) ||
        teacher.employeeId?.toLowerCase().includes(value) ||
        teacher.department?.toLowerCase().includes(value) ||
        teacher.specialization?.toLowerCase().includes(value) ||
        teacher.qualification?.toLowerCase().includes(value)
      );
    });
  }, [teachers, search]);

  const activeCount = useMemo(
    () => teachers.filter((teacher) => teacher.status !== "inactive").length,
    [teachers],
  );

  const handleAdd = () => {
    setFormData({});
    setProfileImage(null);
    setFieldErrors({});

    setActiveForm({
      mode: "create",
      id: null,
      staff: staffConfigs.teacher,
    });
  };

  const handleEdit = (teacher) => {
    setFormData({
      ...teacher,
      dateOfBirth: normalizeDate(teacher.dateOfBirth),
      joiningDate: normalizeDate(teacher.joiningDate),
    });

    // Keep existing Cloudinary image for edit preview.
    setProfileImage(teacher.profileImage || null);

    setFieldErrors({});

    setActiveForm({
      mode: "edit",
      id: teacher._id,
      staff: staffConfigs.teacher,
    });
  };

  const handleCloseForm = () => {
    if (submitting) {
      return;
    }

    setActiveForm(null);
    setFormData({});
    setProfileImage(null);
    setFieldErrors({});
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setFieldErrors((previous) => {
      if (!previous[name]) {
        return previous;
      }

      const updated = {
        ...previous,
      };

      delete updated[name];

      return updated;
    });
  };

  const handleProfileImageChange = (file) => {
    setProfileImage(file);
  };

  const handleRemoveProfileImage = () => {
    setProfileImage(null);
  };

  const validateForm = () => {
    const errors = {};

    const fields = staffConfigs.teacher?.fields || [];

    fields.forEach((field) => {
      if (!field.required) {
        return;
      }

      const value = formData[field.name];

      if (
        value === undefined ||
        value === null ||
        String(value).trim() === ""
      ) {
        errors[field.name] = `${field.label || field.name} is required.`;
      }
    });

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      const firstError = Object.values(errors)[0];

      showToast.error(firstError);

      return false;
    }

    return true;
  };

  const preparePayload = () => {
    const payload = {
      ...formData,
    };

    delete payload._id;
    delete payload.__v;
    delete payload.createdAt;
    delete payload.updatedAt;
    delete payload.profileImage;

    // Never send an existing populated object as assignedClass.
    if (payload.assignedClass && typeof payload.assignedClass === "object") {
      payload.assignedClass =
        payload.assignedClass._id || payload.assignedClass.id || "";
    }

    // Remove only empty optional values.
    // Required fields are validated before this function.
    Object.keys(payload).forEach((key) => {
      const value = payload[key];

      if (value === null || value === undefined || value === "") {
        delete payload[key];
      }
    });

    return payload;
  };

  const uploadTeacherImage = async (teacherId, teacher, file) => {
    if (!(file instanceof File)) {
      return teacher;
    }

    const fullName = `${teacher?.firstName || formData.firstName || ""} ${
      teacher?.lastName || formData.lastName || ""
    }`.trim();

    const imageResponse = await uploadTeacherProfileImage(
      teacherId,
      file,
      `${fullName || "Teacher"} profile image`,
    );

    const uploadedTeacher = extractTeacher(imageResponse);

    return {
      ...teacher,
      ...uploadedTeacher,
      profileImage:
        uploadedTeacher?.profileImage ||
        imageResponse?.profileImage ||
        imageResponse?.data?.profileImage ||
        teacher?.profileImage ||
        null,
    };
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!activeForm || submitting) {
      return;
    }

    const isValid = validateForm();

    if (!isValid) {
      return;
    }

    try {
      setSubmitting(true);
      setFieldErrors({});

      const payload = preparePayload();

      let response;
      let savedTeacher;

      if (activeForm.mode === "edit") {
        response = await updateTeacher(activeForm.id, payload);

        savedTeacher = extractTeacher(response);

        if (!savedTeacher?._id) {
          savedTeacher = {
            ...formData,
            _id: activeForm.id,
          };
        }
      } else {
        response = await createTeacher(payload);

        savedTeacher = extractTeacher(response);

        if (!savedTeacher?._id) {
          throw new Error(
            "Teacher was saved but teacher ID was not returned by the server.",
          );
        }
      }

      const savedTeacherId = savedTeacher?._id || activeForm.id;

      // Upload image only after teacher exists in MongoDB.
      let finalTeacher = savedTeacher;

      if (profileImage instanceof File) {
        finalTeacher = await uploadTeacherImage(
          savedTeacherId,
          savedTeacher,
          profileImage,
        );
      }

      if (activeForm.mode === "edit") {
        setTeachers((previous) =>
          previous.map((teacher) =>
            teacher._id === savedTeacherId
              ? {
                  ...teacher,
                  ...finalTeacher,
                }
              : teacher,
          ),
        );

        showToast.success(response?.message || "Teacher updated successfully.");
      } else {
        setTeachers((previous) => [finalTeacher, ...previous]);

        showToast.success(response?.message || "Teacher created successfully.");
      }

      handleCloseForm();
    } catch (error) {
      console.error("Save teacher error:", error);

      const status = error.response?.status;
      const data = error.response?.data;

      if (status === 409) {
        if (data?.field) {
          setFieldErrors({
            [data.field]: data.message,
          });
        }

        showToast.error(data?.message || "This information already exists.");

        return;
      }

      if (status === 400) {
        if (data?.errors) {
          setFieldErrors(data.errors);
        }

        showToast.error(
          data?.message || "Please check the entered information.",
        );

        return;
      }

      showToast.error(
        data?.message || error.message || "Unable to save teacher.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (teacher) => {
    setDeleteTarget(teacher);
  };

  const handleCancelDelete = () => {
    if (deletingId) {
      return;
    }

    setDeleteTarget(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget?._id || deletingId) {
      return;
    }

    const teacherId = deleteTarget._id;

    try {
      setDeletingId(teacherId);

      const response = await deleteTeacher(teacherId);

      setTeachers((previous) =>
        previous.filter((item) => item._id !== teacherId),
      );

      showToast.success(response?.message || "Teacher deleted successfully.");

      setDeleteTarget(null);
    } catch (error) {
      console.error("Delete teacher error:", error);

      showToast.error(
        error.response?.data?.message || "Unable to delete teacher.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  if (activeForm) {
    return (
      <StaffForm
        staff={activeForm.staff}
        formData={formData}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onClose={handleCloseForm}
        submitting={submitting}
        fieldErrors={fieldErrors}
        editing={activeForm.mode === "edit"}
        profileImage={profileImage}
        onProfileImageChange={handleProfileImageChange}
        onRemoveProfileImage={handleRemoveProfileImage}
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5 sm:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
              Teachers
            </h1>

            {!loading && (
              <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-500/10">
                {teachers.length} total
              </span>
            )}
          </div>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage all teaching staff.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          <button
            type="button"
            onClick={() => fetchTeachers(true)}
            disabled={refreshing}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>

          <button
            type="button"
            onClick={handleAdd}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 active:scale-[0.97] dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 dark:focus-visible:ring-white"
          >
            <Plus size={16} />
            Add Teacher
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:flex-row sm:items-center sm:justify-between sm:p-4">
        <div className="relative w-full sm:max-w-md">
          <Search
            size={18}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, ID, department, subject..."
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-10 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:bg-white focus:ring-2 focus:ring-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:bg-gray-800 dark:focus:ring-gray-700"
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-gray-700"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {!loading && (
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-green-700 dark:bg-green-500/10 dark:text-green-400">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              {activeCount} active
            </span>

            <span className="rounded-full bg-gray-100 px-2.5 py-1 dark:bg-gray-800">
              Showing {filteredTeachers.length}
            </span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-1">
          {Array.from({ length: 3 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      ) : filteredTeachers.length === 0 ? (
        <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white px-4 text-center dark:border-gray-700 dark:bg-gray-900">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800">
            <UserRound className="text-gray-400" size={28} />
          </div>

          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            {search ? "No teachers found" : "No teachers available"}
          </h3>

          <p className="mt-1 max-w-sm text-sm text-gray-500 dark:text-gray-400">
            {search
              ? "Try another search term or clear the search."
              : "Teachers will appear here after they are added."}
          </p>

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="mt-4 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-1">
          {filteredTeachers.map((teacher) => (
            <StaffCard
              key={teacher._id}
              staff={teacher}
              type="teacher"
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              deleting={deletingId === teacher._id}
            />
          ))}
        </div>
      )}

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete Teacher"
        message="Are you sure you want to permanently delete this teacher?"
        itemName={
          deleteTarget
            ? `${deleteTarget.firstName || ""} ${
                deleteTarget.lastName || ""
              }`.trim()
            : ""
        }
        confirmText="Delete"
        cancelText="Cancel"
        loading={Boolean(deletingId)}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
};

const SkeletonCard = () => {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 lg:flex lg:items-center lg:gap-6 lg:p-5">
      <div className="h-16 bg-gray-200 dark:bg-gray-800 sm:h-20 lg:hidden" />

      <div className="flex items-center gap-4 p-4 lg:w-72 lg:shrink-0 lg:p-0">
        <div className="h-16 w-16 shrink-0 rounded-2xl bg-gray-200 dark:bg-gray-800" />

        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-800" />

          <div className="h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-800" />
        </div>
      </div>

      <div className="grid gap-3 px-4 pb-4 lg:flex lg:flex-1 lg:gap-8 lg:p-0">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex items-center gap-3 lg:flex-1">
            <div className="h-8 w-8 shrink-0 rounded-lg bg-gray-200 dark:bg-gray-800" />

            <div className="flex-1 space-y-1.5">
              <div className="h-2.5 w-1/3 rounded bg-gray-200 dark:bg-gray-800" />

              <div className="h-3 w-2/3 rounded bg-gray-200 dark:bg-gray-800" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Teachers;
