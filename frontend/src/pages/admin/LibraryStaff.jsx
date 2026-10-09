import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, RefreshCw, Search, UserRound, X } from "lucide-react";

import {
  createLibraryStaff,
  deleteLibraryStaff,
  getLibraryStaff,
  updateLibraryStaff,
  uploadLibraryStaffProfileImage,
} from "../../service/staff.service";

import StaffCard from "../../components/staff/StaffCard";
import StaffForm from "../../components/staff/StaffForm";
import ConfirmModal from "../../components/common/ConfirmModal";
import { showToast } from "../../components/Toast";
import { staffConfigs } from "../../config/staff.config";

const extractLibraryList = (response) => {
  const candidates = [
    response,
    response?.libraries,
    response?.libraryStaff,
    response?.staff,
    response?.data,
    response?.data?.libraries,
    response?.data?.libraryStaff,
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

const extractLibraryStaff = (response) => {
  return (
    response?.libraryStaff ||
    response?.staff ||
    response?.data?.libraryStaff ||
    response?.data?.staff ||
    response?.data ||
    response
  );
};

const LibraryStaff = () => {
  const [libraryStaff, setLibraryStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [activeForm, setActiveForm] = useState(null);
  const [formData, setFormData] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [profileImage, setProfileImage] = useState(null);

  const fetchLibraryStaff = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await getLibraryStaff();

      setLibraryStaff(extractLibraryList(response));
    } catch (error) {
      console.error("Fetch library staff error:", error);

      showToast.error(
        error.response?.data?.message || "Unable to load library staff.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchLibraryStaff();
  }, [fetchLibraryStaff]);

  const filteredLibraryStaff = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return libraryStaff;
    }

    return libraryStaff.filter((staff) => {
      const fullName = `${staff.firstName || ""} ${
        staff.lastName || ""
      }`.toLowerCase();

      return (
        fullName.includes(value) ||
        staff.email?.toLowerCase().includes(value) ||
        staff.phone?.includes(value) ||
        staff.employeeId?.toLowerCase().includes(value) ||
        staff.libraryRole?.toLowerCase().includes(value) ||
        staff.qualification?.toLowerCase().includes(value)
      );
    });
  }, [libraryStaff, search]);

  const activeCount = useMemo(
    () => libraryStaff.filter((staff) => staff.status !== "inactive").length,
    [libraryStaff],
  );

  const handleAdd = () => {
    setFormData({});
    setFieldErrors({});
    setProfileImage(null);

    setActiveForm({
      mode: "create",
      id: null,
      staff: staffConfigs.library,
    });
  };

  const handleEdit = (staff) => {
    setFormData({
      ...staff,
      dateOfBirth: normalizeDate(staff.dateOfBirth),
      joiningDate: normalizeDate(staff.joiningDate),
    });

    setProfileImage(staff.profileImage || null);
    setFieldErrors({});

    setActiveForm({
      mode: "edit",
      id: staff._id,
      staff: staffConfigs.library,
    });
  };

  const handleCloseForm = () => {
    if (submitting) {
      return;
    }

    setActiveForm(null);
    setFormData({});
    setFieldErrors({});
    setProfileImage(null);
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

  const preparePayload = () => {
    const payload = {
      ...formData,
    };

    delete payload._id;
    delete payload.__v;
    delete payload.createdAt;
    delete payload.updatedAt;
    delete payload.profileImage;

    Object.keys(payload).forEach((key) => {
      if (
        payload[key] === "" ||
        payload[key] === null ||
        payload[key] === undefined
      ) {
        delete payload[key];
      }
    });

    return payload;
  };

  const uploadProfileImage = async (staff) => {
    if (!(profileImage instanceof File)) {
      return staff;
    }

    if (!staff?._id) {
      throw new Error(
        "Library staff ID is missing. Unable to upload profile image.",
      );
    }

    const fullName = `${staff.firstName || ""} ${staff.lastName || ""}`.trim();

    const response = await uploadLibraryStaffProfileImage(
      staff._id,
      profileImage,
      `${fullName || "Library Staff"} profile image`,
    );

    return extractLibraryStaff(response);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!activeForm) {
      return;
    }

    try {
      setSubmitting(true);
      setFieldErrors({});

      const payload = preparePayload();

      let response;
      let savedStaff;

      if (activeForm.mode === "edit") {
        response = await updateLibraryStaff(activeForm.id, payload);

        savedStaff = extractLibraryStaff(response);

        if (!savedStaff?._id) {
          throw new Error(
            "Updated library staff data was not returned by the server.",
          );
        }

        savedStaff = await uploadProfileImage(savedStaff);

        setLibraryStaff((previous) =>
          previous.map((staff) =>
            staff._id === activeForm.id ? savedStaff : staff,
          ),
        );

        showToast.success(
          response?.message || "Library staff updated successfully.",
        );
      } else {
        response = await createLibraryStaff(payload);

        savedStaff = extractLibraryStaff(response);

        if (!savedStaff?._id) {
          throw new Error(
            "Created library staff ID was not returned by the server.",
          );
        }

        savedStaff = await uploadProfileImage(savedStaff);

        setLibraryStaff((previous) => [savedStaff, ...previous]);

        showToast.success(
          response?.message || "Library staff created successfully.",
        );
      }

      handleCloseForm();
    } catch (error) {
      console.error("Save library staff error:", error);

      if (error.response?.status === 409) {
        const data = error.response?.data;

        if (data?.field) {
          setFieldErrors({
            [data.field]: data.message,
          });
        }

        showToast.error(data?.message || "This information already exists.");

        return;
      }

      showToast.error(
        error.response?.data?.message ||
          error.message ||
          "Unable to save library staff.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (staff) => {
    setDeleteTarget(staff);
  };

  const confirmDelete = async () => {
    if (!deleteTarget?._id) {
      return;
    }

    try {
      setDeletingId(deleteTarget._id);

      const response = await deleteLibraryStaff(deleteTarget._id);

      setLibraryStaff((previous) =>
        previous.filter((item) => item._id !== deleteTarget._id),
      );

      showToast.success(
        response?.message || "Library staff deleted successfully.",
      );

      setDeleteTarget(null);
    } catch (error) {
      console.error("Delete library staff error:", error);

      showToast.error(
        error.response?.data?.message || "Unable to delete library staff.",
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
    <>
      <div className="mx-auto w-full max-w-7xl space-y-5 sm:space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
                Library Staff
              </h1>

              {!loading && (
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10">
                  {libraryStaff.length} total
                </span>
              )}
            </div>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage librarians and library staff.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            <button
              type="button"
              onClick={() => fetchLibraryStaff(true)}
              disabled={refreshing}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
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
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 active:scale-[0.97] dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 dark:focus-visible:ring-white"
            >
              <Plus size={16} />
              Add Staff
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
              placeholder="Search by name, ID, role, qualification..."
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
                Showing {filteredLibraryStaff.length}
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
        ) : filteredLibraryStaff.length === 0 ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white px-4 text-center dark:border-gray-700 dark:bg-gray-900">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800">
              <UserRound className="text-gray-400" size={28} />
            </div>

            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              {search ? "No library staff found" : "No library staff available"}
            </h3>

            <p className="mt-1 max-w-sm text-sm text-gray-500 dark:text-gray-400">
              {search
                ? "Try another search term or clear the search."
                : "Library staff will appear here after they are added."}
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
            {filteredLibraryStaff.map((staff) => (
              <StaffCard
                key={staff._id}
                staff={staff}
                type="library"
                onEdit={handleEdit}
                onDelete={handleDelete}
                deleting={deletingId === staff._id}
              />
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete Library Staff"
        message="Are you sure you want to permanently delete this library staff member?"
        itemName={
          deleteTarget
            ? `${deleteTarget.firstName || ""} ${
                deleteTarget.lastName || ""
              }`.trim()
            : ""
        }
        confirmText="Delete Staff"
        loading={Boolean(deletingId)}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </>
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

export default LibraryStaff;
