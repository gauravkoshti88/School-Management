import { useCallback, useEffect, useMemo, useState } from "react";
import { GraduationCap, Plus, RefreshCw, Search, X } from "lucide-react";

import {
  createClass,
  deleteClass,
  getClasses,
  updateClass,
} from "../../service/class.service";

import { getTeachers } from "../../service/staff.service";

import ClassCard from "../../components/classes/ClassCard";
import ClassForm from "../../components/classes/ClassForm";
import ClassSkeleton from "../../components/classes/ClassSkeleton";
import ConfirmModal from "../../components/common/ConfirmModal";
import { showToast } from "../../components/Toast";

const emptySubject = () => ({
  name: "",
  code: "",
  type: "Theory",
  maxMarks: 100,
  passingMarks: 33,
  isCompulsory: true,
  isActive: true,
});

const initialFormData = {
  name: "",
  section: "",
  academicYear: "",
  classTeacher: "",
  subjects: [emptySubject()],
  roomNumber: "",
  capacity: 40,
  status: "active",
};

const extractClassList = (response) => {
  const candidates = [
    response,
    response?.classes,
    response?.data,
    response?.data?.classes,
  ];

  return candidates.find((item) => Array.isArray(item)) || [];
};

const extractTeacherList = (response) => {
  const candidates = [
    response,
    response?.teachers,
    response?.data,
    response?.data?.teachers,
  ];

  return candidates.find((item) => Array.isArray(item)) || [];
};

const extractClassFromResponse = (response) => {
  return response?.class || response?.data?.class || response?.data || response;
};

const normalizeSubjects = (subjects) => {
  if (!Array.isArray(subjects) || subjects.length === 0) {
    return [emptySubject()];
  }

  return subjects.map((subject) => ({
    ...(subject._id ? { _id: subject._id } : {}),
    name: subject.name || "",
    code: subject.code || "",
    type: subject.type || "Theory",
    maxMarks: subject.maxMarks ?? 100,
    passingMarks: subject.passingMarks ?? 33,
    isCompulsory: subject.isCompulsory ?? true,
    isActive: subject.isActive ?? true,
  }));
};

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [teachersLoading, setTeachersLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState(initialFormData);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const fetchClasses = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await getClasses();

      const classList = extractClassList(response);

      setClasses(classList);
    } catch (error) {
      console.error("Fetch classes error:", error);

      setClasses([]);

      showToast.error(
        error.response?.data?.message || "Unable to load classes.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const fetchTeachers = useCallback(async () => {
    try {
      setTeachersLoading(true);

      const response = await getTeachers();

      const teacherList = extractTeacherList(response);

      setTeachers(teacherList);
    } catch (error) {
      console.error("Fetch teachers error:", error);

      setTeachers([]);

      showToast.error(
        error.response?.data?.message || "Unable to load teachers.",
      );
    } finally {
      setTeachersLoading(false);
    }
  }, []);

  const fetchAll = useCallback(
    async (isRefresh = false) => {
      await Promise.all([fetchClasses(isRefresh), fetchTeachers()]);
    },
    [fetchClasses, fetchTeachers],
  );

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const filteredClasses = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return classes;
    }

    return classes.filter((schoolClass) => {
      const teacher = schoolClass.classTeacher;

      const teacherName =
        typeof teacher === "object"
          ? `${teacher?.firstName || ""} ${
              teacher?.lastName || ""
            } ${teacher?.employeeId || ""}`.toLowerCase()
          : String(teacher || "").toLowerCase();

      const subjects = Array.isArray(schoolClass.subjects)
        ? schoolClass.subjects
            .map((subject) => `${subject.name || ""} ${subject.code || ""}`)
            .join(" ")
            .toLowerCase()
        : "";

      const className = String(schoolClass.name || "").toLowerCase();

      const section = String(schoolClass.section || "").toLowerCase();

      const academicYear = String(schoolClass.academicYear || "").toLowerCase();

      const roomNumber = String(schoolClass.roomNumber || "").toLowerCase();

      return (
        className.includes(value) ||
        section.includes(value) ||
        academicYear.includes(value) ||
        teacherName.includes(value) ||
        subjects.includes(value) ||
        roomNumber.includes(value)
      );
    });
  }, [classes, search]);

  const activeCount = useMemo(() => {
    return classes.filter((schoolClass) => schoolClass.status !== "inactive")
      .length;
  }, [classes]);

  const handleAdd = () => {
    setEditingId(null);

    setFormData({
      ...initialFormData,
      subjects: [emptySubject()],
    });

    setFieldErrors({});
    setShowForm(true);
  };

  const handleEdit = (schoolClass) => {
    setEditingId(schoolClass._id);

    const teacher =
      typeof schoolClass.classTeacher === "object"
        ? schoolClass.classTeacher
        : null;

    const teacherId = teacher?._id || schoolClass.classTeacher || "";

    setFormData({
      name: schoolClass.name || "",
      section: schoolClass.section || "",
      academicYear: schoolClass.academicYear || "",
      classTeacher: teacherId,
      subjects: normalizeSubjects(schoolClass.subjects),
      roomNumber: schoolClass.roomNumber || "",
      capacity: schoolClass.capacity ?? 40,
      status: schoolClass.status || "active",
    });

    setFieldErrors({});
    setShowForm(true);
  };

  const handleCloseForm = () => {
    if (submitting) {
      return;
    }

    setShowForm(false);
    setEditingId(null);

    setFormData({
      ...initialFormData,
      subjects: [emptySubject()],
    });

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

  const handleSubjectChange = (index, field, value) => {
    setFormData((previous) => {
      const subjects = [...previous.subjects];

      subjects[index] = {
        ...subjects[index],
        [field]: value,
      };

      return {
        ...previous,
        subjects,
      };
    });

    setFieldErrors((previous) => {
      const errorKey = `subjects.${index}.${field}`;

      if (!previous[errorKey]) {
        return previous;
      }

      const updated = {
        ...previous,
      };

      delete updated[errorKey];

      return updated;
    });
  };

  const addSubject = () => {
    setFormData((previous) => ({
      ...previous,
      subjects: [...previous.subjects, emptySubject()],
    }));
  };

  const removeSubject = (index) => {
    if (formData.subjects.length === 1) {
      showToast.error("At least one subject is required.");

      return;
    }

    setFormData((previous) => ({
      ...previous,
      subjects: previous.subjects.filter(
        (_, subjectIndex) => subjectIndex !== index,
      ),
    }));

    setFieldErrors((previous) => {
      const updated = {};

      Object.entries(previous).forEach(([key, value]) => {
        if (!key.startsWith("subjects.")) {
          updated[key] = value;
          return;
        }

        const match = key.match(/^subjects\.(\d+)\.(.+)$/);

        if (!match) {
          return;
        }

        const subjectIndex = Number(match[1]);
        const field = match[2];

        if (subjectIndex < index) {
          updated[key] = value;
        }

        if (subjectIndex > index) {
          updated[`subjects.${subjectIndex - 1}.${field}`] = value;
        }
      });

      return updated;
    });
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = "Class name is required.";
    }

    if (!formData.section.trim()) {
      errors.section = "Section is required.";
    }

    if (!formData.academicYear.trim()) {
      errors.academicYear = "Academic year is required.";
    }

    if (!formData.capacity || Number(formData.capacity) < 1) {
      errors.capacity = "Capacity must be at least 1.";
    }

    if (!Array.isArray(formData.subjects) || formData.subjects.length === 0) {
      errors.subjects = "At least one subject is required.";
    } else {
      formData.subjects.forEach((subject, index) => {
        const subjectName = String(subject.name || "").trim();

        const subjectCode = String(subject.code || "").trim();

        if (!subjectName) {
          errors[`subjects.${index}.name`] = "Subject name is required.";
        }

        if (!subjectCode) {
          errors[`subjects.${index}.code`] = "Subject code is required.";
        }

        if (subject.maxMarks === "" || Number(subject.maxMarks) < 1) {
          errors[`subjects.${index}.maxMarks`] =
            "Max marks must be at least 1.";
        }

        if (subject.passingMarks === "" || Number(subject.passingMarks) < 0) {
          errors[`subjects.${index}.passingMarks`] =
            "Passing marks cannot be negative.";
        }

        if (Number(subject.passingMarks) > Number(subject.maxMarks)) {
          errors[`subjects.${index}.passingMarks`] =
            "Passing marks cannot exceed max marks.";
        }
      });
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const preparePayload = () => {
    return {
      name: formData.name.trim(),

      section: formData.section.trim().toUpperCase(),

      academicYear: formData.academicYear.trim(),

      classTeacher: formData.classTeacher || null,

      subjects: formData.subjects.map((subject) => ({
        ...(subject._id ? { _id: subject._id } : {}),

        name: subject.name.trim(),

        code: subject.code.trim().toUpperCase(),

        type: subject.type,

        maxMarks: Number(subject.maxMarks),

        passingMarks: Number(subject.passingMarks),

        isCompulsory: Boolean(subject.isCompulsory),

        isActive: Boolean(subject.isActive),
      })),

      roomNumber: formData.roomNumber.trim(),

      capacity: Number(formData.capacity),

      status: formData.status,
    };
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      showToast.error("Please fix the highlighted fields.");

      return;
    }

    try {
      setSubmitting(true);
      setFieldErrors({});

      const payload = preparePayload();

      let response;

      if (editingId) {
        response = await updateClass(editingId, payload);

        const updatedClass = extractClassFromResponse(response);

        if (!updatedClass?._id) {
          throw new Error("Invalid class update response.");
        }

        setClasses((previous) =>
          previous.map((schoolClass) =>
            schoolClass._id === editingId ? updatedClass : schoolClass,
          ),
        );

        showToast.success(response?.message || "Class updated successfully.");
      } else {
        response = await createClass(payload);

        const createdClass = extractClassFromResponse(response);

        if (!createdClass?._id) {
          throw new Error("Invalid class creation response.");
        }

        setClasses((previous) => [createdClass, ...previous]);

        showToast.success(response?.message || "Class created successfully.");
      }

      setShowForm(false);
      setEditingId(null);

      setFormData({
        ...initialFormData,
        subjects: [emptySubject()],
      });

      setFieldErrors({});
    } catch (error) {
      console.error("Save class error:", error);

      if (error.response?.status === 409) {
        showToast.error(
          error.response?.data?.message || "This class already exists.",
        );

        return;
      }

      if (error.response?.data?.code === "VALIDATION_ERROR") {
        setFieldErrors(error.response?.data?.errors || {});

        showToast.error(
          error.response?.data?.message ||
            "Please check the provided information.",
        );

        return;
      }

      showToast.error(
        error.response?.data?.message ||
          error.message ||
          "Unable to save class.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (schoolClass) => {
    setDeleteTarget(schoolClass);
  };

  const confirmDelete = async () => {
    if (!deleteTarget?._id) {
      return;
    }

    try {
      setDeletingId(deleteTarget._id);

      const response = await deleteClass(deleteTarget._id);

      setClasses((previous) =>
        previous.filter((item) => item._id !== deleteTarget._id),
      );

      showToast.success(response?.message || "Class deleted successfully.");

      setDeleteTarget(null);
    } catch (error) {
      console.error("Delete class error:", error);

      showToast.error(
        error.response?.data?.message || "Unable to delete class.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  const cancelDelete = () => {
    if (deletingId) {
      return;
    }

    setDeleteTarget(null);
  };

  const getTeacherName = (classTeacher) => {
    if (!classTeacher) {
      return "Not assigned";
    }

    if (typeof classTeacher === "object") {
      const name = `${classTeacher.firstName || ""} ${
        classTeacher.lastName || ""
      }`.trim();

      if (name) {
        return classTeacher.employeeId
          ? `${name} (${classTeacher.employeeId})`
          : name;
      }

      return classTeacher.employeeId || "Not assigned";
    }

    const teacher = teachers.find((item) => item._id === classTeacher);

    if (!teacher) {
      return "Not assigned";
    }

    const name = `${teacher.firstName || ""} ${teacher.lastName || ""}`.trim();

    if (name) {
      return teacher.employeeId ? `${name} (${teacher.employeeId})` : name;
    }

    return teacher.employeeId || "Not assigned";
  };

  if (showForm) {
    return (
      <ClassForm
        formData={formData}
        fieldErrors={fieldErrors}
        editing={Boolean(editingId)}
        submitting={submitting}
        teachers={teachers}
        teachersLoading={teachersLoading}
        onChange={handleChange}
        onSubjectChange={handleSubjectChange}
        onAddSubject={addSubject}
        onRemoveSubject={removeSubject}
        onSubmit={handleSubmit}
        onClose={handleCloseForm}
      />
    );
  }

  return (
    <>
      <div className="mx-auto w-full max-w-7xl space-y-5 sm:space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
                Classes
              </h1>

              {!loading && (
                <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-500/10">
                  {classes.length} total
                </span>
              )}
            </div>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage classes, sections and subjects.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            <button
              type="button"
              onClick={() => fetchAll(true)}
              disabled={refreshing}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              <RefreshCw
                size={16}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <button
              type="button"
              onClick={handleAdd}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-gray-800 active:scale-[0.97] dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
            >
              <Plus size={16} />
              Add Class
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
              placeholder="Search class, section, subject, teacher..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-10 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:bg-white focus:ring-2 focus:ring-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:bg-gray-800 dark:focus:ring-gray-700"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
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
                Showing {filteredClasses.length}
              </span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {Array.from({
              length: 4,
            }).map((_, index) => (
              <ClassSkeleton key={index} />
            ))}
          </div>
        ) : filteredClasses.length === 0 ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white px-4 text-center dark:border-gray-700 dark:bg-gray-900">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800">
              <GraduationCap className="text-gray-400" size={28} />
            </div>

            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              {search ? "No classes found" : "No classes available"}
            </h3>

            <p className="mt-1 max-w-sm text-sm text-gray-500 dark:text-gray-400">
              {search
                ? "Try another search term or clear the search."
                : "Classes will appear here after they are added."}
            </p>

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="mt-4 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {filteredClasses.map((schoolClass) => (
              <ClassCard
                key={schoolClass._id}
                schoolClass={schoolClass}
                teacherName={getTeacherName(schoolClass.classTeacher)}
                onEdit={handleEdit}
                onDelete={handleDelete}
                deleting={deletingId === schoolClass._id}
              />
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete Class"
        message="Are you sure you want to permanently delete this class?"
        itemName={
          deleteTarget ? `${deleteTarget.name} - ${deleteTarget.section}` : ""
        }
        confirmText="Delete Class"
        loading={Boolean(deletingId)}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </>
  );
};

export default Classes;
