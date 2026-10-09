import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, RefreshCw, Search, UserRound, X } from "lucide-react";

import {
  createPeonStaff,
  deletePeonStaff,
  getPeonStaff,
  updatePeonStaff,
  uploadPeonStaffProfileImage,
} from "../../service/staff.service";

import StaffCard from "../../components/staff/StaffCard";
import StaffForm from "../../components/staff/StaffForm";
import ConfirmModal from "../../components/common/ConfirmModal";
import { showToast } from "../../components/Toast";
import { staffConfigs } from "../../config/staff.config";

const extractPeonList = (response) => {
  const candidates = [
    response?.peons,
    response?.peonStaff,
    response?.staff,
    response?.data?.peons,
    response?.data?.peonStaff,
    response?.data?.staff,
    response?.data,
    response,
  ];

  return candidates.find((item) => Array.isArray(item)) || [];
};

const extractPeon = (response) => {
  const candidates = [
    response?.peon,
    response?.peonStaff,
    response?.staff,
    response?.data?.peon,
    response?.data?.peonStaff,
    response?.data?.staff,
    response?.data,
    response,
  ];

  return (
    candidates.find(
      (item) =>
        item && typeof item === "object" && !Array.isArray(item) && item._id,
    ) || null
  );
};

const normalizeDate = (value) => {
  if (!value) {
    return "";
  }

  return String(value).slice(0, 10);
};

const PeonStaff = () => {
  const [peons, setPeons] = useState([]);
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

  const fetchPeons = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await getPeonStaff();

      setPeons(extractPeonList(response));
    } catch (error) {
      console.error("Fetch peon staff error:", error);

      showToast.error(
        error.response?.data?.message || "Unable to load peon staff.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPeons();
  }, [fetchPeons]);

  const filteredPeons = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return peons;
    }

    return peons.filter((peon) => {
      const fullName = `${peon.firstName || ""} ${
        peon.lastName || ""
      }`.toLowerCase();

      return (
        fullName.includes(value) ||
        peon.email?.toLowerCase().includes(value) ||
        peon.phone?.includes(value) ||
        peon.employeeId?.toLowerCase().includes(value) ||
        peon.shift?.toLowerCase().includes(value)
      );
    });
  }, [peons, search]);

  const activeCount = useMemo(
    () => peons.filter((peon) => peon.status !== "inactive").length,
    [peons],
  );

  const handleAdd = () => {
    setFormData({
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      password: "",
      gender: "",
      dateOfBirth: "",
      joiningDate: "",
      employeeId: "",
      shift: "",
      address: "",
      emergencyContact: "",
      status: "active",
    });

    setProfileImage(null);
    setFieldErrors({});

    setActiveForm({
      mode: "create",
      id: null,
      staff: staffConfigs.peon,
    });
  };

  const handleEdit = (peon) => {
    setFormData({
      ...peon,

      password: "",

      dateOfBirth: normalizeDate(peon.dateOfBirth),

      joiningDate: normalizeDate(peon.joiningDate),
    });

    setProfileImage(peon.profileImage || null);

    setFieldErrors({});

    setActiveForm({
      mode: "edit",
      id: peon._id,
      staff: staffConfigs.peon,
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

    const fields = staffConfigs.peon?.fields || [];

    fields.forEach((field) => {
      const isPassword = field.name === "password";

      const isRequired = isPassword
        ? !activeForm?.mode || activeForm.mode === "create"
        : field.required;

      if (!isRequired) {
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

    if (formData.password && String(formData.password).length < 6) {
      errors.password = "Password must be at least 6 characters.";
    }

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

    if (activeForm?.mode === "edit" && !payload.password) {
      delete payload.password;
    }

    Object.keys(payload).forEach((key) => {
      const value = payload[key];

      if (value === "" || value === null || value === undefined) {
        delete payload[key];
      }
    });

    return payload;
  };

  const uploadPeonImage = async (peonId, savedPeon) => {
    if (!(profileImage instanceof File)) {
      return savedPeon;
    }

    const fullName = `${savedPeon?.firstName || formData.firstName || ""} ${
      savedPeon?.lastName || formData.lastName || ""
    }`.trim();

    const imageResponse = await uploadPeonStaffProfileImage(
      peonId,
      profileImage,
      `${fullName || "Peon Staff"} profile image`,
    );

    const uploadedPeon = extractPeon(imageResponse);

    const uploadedProfileImage =
      uploadedPeon?.profileImage ||
      imageResponse?.profileImage ||
      imageResponse?.data?.profileImage ||
      null;

    return {
      ...savedPeon,
      ...(uploadedPeon || {}),
      ...(uploadedProfileImage
        ? {
            profileImage: uploadedProfileImage,
          }
        : {}),
    };
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!activeForm || submitting) {
      return;
    }

    const valid = validateForm();

    if (!valid) {
      return;
    }

    try {
      setSubmitting(true);
      setFieldErrors({});

      const payload = preparePayload();

      let response;
      let savedPeon;

      if (activeForm.mode === "edit") {
        response = await updatePeonStaff(activeForm.id, payload);

        savedPeon = extractPeon(response);
      } else {
        response = await createPeonStaff(payload);

        savedPeon = extractPeon(response);
      }

      const savedId = savedPeon?._id || activeForm.id;

      if (!savedId) {
        throw new Error("Peon staff ID was not returned after saving.");
      }

      let finalPeon = savedPeon;

      if (profileImage instanceof File) {
        finalPeon = await uploadPeonImage(savedId, savedPeon);
      }

      if (activeForm.mode === "edit") {
        setPeons((previous) =>
          previous.map((peon) =>
            peon._id === savedId
              ? {
                  ...peon,
                  ...finalPeon,
                }
              : peon,
          ),
        );

        showToast.success(
          response?.message || "Peon staff updated successfully.",
        );
      } else {
        setPeons((previous) => [finalPeon, ...previous]);

        showToast.success(
          response?.message || "Peon staff created successfully.",
        );
      }

      handleCloseForm();
    } catch (error) {
      console.error("Save peon staff error:", error);

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
        data?.message || error.message || "Unable to save peon staff.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (peon) => {
    setDeleteTarget(peon);
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

    const peonId = deleteTarget._id;

    try {
      setDeletingId(peonId);

      const response = await deletePeonStaff(peonId);

      setPeons((previous) => previous.filter((item) => item._id !== peonId));

      showToast.success(
        response?.message || "Peon staff deleted successfully.",
      );

      setDeleteTarget(null);
    } catch (error) {
      console.error("Delete peon staff error:", error);

      showToast.error(
        error.response?.data?.message || "Unable to delete peon staff.",
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
              Peon Staff
            </h1>

            {!loading && (
              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-500/10">
                {peons.length} total
              </span>
            )}
          </div>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage school support and peon staff.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          <button
            type="button"
            onClick={() => fetchPeons(true)}
            disabled={refreshing}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>

          <button
            type="button"
            onClick={handleAdd}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus:ring-offset-2 active:scale-[0.97] dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 dark:focus-visible:ring-white"
          >
            <Plus size={16} />
            Add Peon
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
            placeholder="Search by name, ID, phone, shift..."
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
              Showing {filteredPeons.length}
            </span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-1">
          {Array.from({
            length: 3,
          }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      ) : filteredPeons.length === 0 ? (
        <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white px-4 text-center dark:border-gray-700 dark:bg-gray-900">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800">
            <UserRound className="text-gray-400" size={28} />
          </div>

          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            {search ? "No peon staff found" : "No peon staff available"}
          </h3>

          <p className="mt-1 max-w-sm text-sm text-gray-500 dark:text-gray-400">
            {search
              ? "Try another search term or clear the search."
              : "Peon staff will appear here after they are added."}
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
          {filteredPeons.map((peon) => (
            <StaffCard
              key={peon._id}
              staff={peon}
              type="peon"
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              deleting={deletingId === peon._id}
            />
          ))}
        </div>
      )}

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete Peon Staff"
        message="Are you sure you want to permanently delete this peon staff member?"
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
        {Array.from({
          length: 3,
        }).map((_, index) => (
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

export default PeonStaff;
