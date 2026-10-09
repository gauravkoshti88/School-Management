import { useEffect, useState } from "react";

import { Edit, Plus, Search, Trash2, UserRound, X } from "lucide-react";

import toast from "react-hot-toast";

import StudentForm from "../../components/staff/StudentForm";
import LibraryStudentPanel from "../../components/staff/LibraryStudentPanel";

import { useStaff } from "../../context/StaffContext";

import {
  createStaffStudent,
  deleteStaffStudent,
  getStaffStudents,
  updateStaffStudent,
  uploadStaffStudentProfileImage,
} from "../../service/student.service";

const emptyForm = {
  firstName: "",
  lastName: "",
  fatherName: "",
  motherName: "",
  dateOfBirth: "",
  gender: "",
  phone: "",
  address: "",
  password: "",
};

const StaffStudents = () => {
  const { staff, loading: staffLoading } = useStaff();

  const isLibrarian = staff?.staffType === "library";

  if (staffLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="text-sm text-slate-500">Loading staff...</div>
      </div>
    );
  }

  if (isLibrarian) {
    return <LibraryStudents />;
  }

  return <TeacherStudents staff={staff} />;
};

const TeacherStudents = ({ staff }) => {
  const [students, setStudents] = useState([]);
  const [classInfo, setClassInfo] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  const [studentToDelete, setStudentToDelete] = useState(null);

  const [form, setForm] = useState({
    ...emptyForm,
  });

  const [profileImage, setProfileImage] = useState(null);

  const teacherId = staff?._id;

  const fetchStudents = async () => {
    if (!teacherId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const response = await getStaffStudents();

      const studentList = Array.isArray(response?.students)
        ? response.students
        : Array.isArray(response?.data?.students)
          ? response.data.students
          : Array.isArray(response?.data)
            ? response.data
            : [];

      const responseClass =
        response?.class ||
        response?.data?.class ||
        response?.assignedClass ||
        response?.data?.assignedClass ||
        null;

      setStudents(studentList);
      setClassInfo(responseClass || staff?.assignedClass || null);
    } catch (error) {
      console.error("Get staff students error:", error);

      setStudents([]);

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Unable to load students.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!teacherId) {
      return;
    }

    fetchStudents();
  }, [teacherId]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleProfileImageChange = (event) => {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, PNG or WebP images are allowed.");
      return;
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      toast.error("Profile image must be smaller than 5 MB.");
      return;
    }

    setProfileImage(file);
  };

  const handleRemoveProfileImage = () => {
    setProfileImage(null);
  };

  const openCreate = () => {
    setEditingStudent(null);

    setForm({
      ...emptyForm,
    });

    setProfileImage(null);
    setShowForm(true);
  };

  const openEdit = (student) => {
    setEditingStudent(student);

    setForm({
      firstName: student.firstName || "",
      lastName: student.lastName || "",
      fatherName: student.fatherName || "",
      motherName: student.motherName || "",
      dateOfBirth: student.dateOfBirth ? student.dateOfBirth.slice(0, 10) : "",
      gender: student.gender || "",
      phone: student.phone || "",
      address: student.address || "",
      password: "",
    });

    setProfileImage(student.profileImage || null);
    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) {
      return;
    }

    setShowForm(false);
    setEditingStudent(null);

    setForm({
      ...emptyForm,
    });

    setProfileImage(null);
  };

  const extractStudent = (response) => {
    const candidates = [
      response?.student,
      response?.data?.student,
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

  const uploadProfileImage = async (student) => {
    if (!(profileImage instanceof File)) {
      return student;
    }

    const response = await uploadStaffStudentProfileImage(
      student._id,
      profileImage,
      `${student.firstName} ${student.lastName} profile image`,
    );

    const uploadedStudent = extractStudent(response);

    return {
      ...student,
      ...(uploadedStudent || {}),
      profileImage:
        uploadedStudent?.profileImage ||
        response?.profileImage ||
        student.profileImage,
    };
  };

  const preparePayload = () => {
    const payload = {
      ...form,
    };

    if (editingStudent && !payload.password?.trim()) {
      delete payload.password;
    }

    return payload;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);

      const payload = preparePayload();

      let savedStudent;

      if (editingStudent) {
        const response = await updateStaffStudent(editingStudent._id, payload);

        savedStudent = extractStudent(response);

        if (!savedStudent) {
          throw new Error("Updated student data was not returned by server.");
        }
      } else {
        if (!form.password?.trim()) {
          toast.error("Student password is required.");
          return;
        }

        if (form.password.length < 6) {
          toast.error("Password must be at least 6 characters.");
          return;
        }

        const response = await createStaffStudent(payload);

        savedStudent = extractStudent(response);

        if (!savedStudent) {
          throw new Error("Created student data was not returned by server.");
        }
      }

      let finalStudent = savedStudent;

      if (profileImage instanceof File) {
        finalStudent = await uploadProfileImage(savedStudent);
      }

      if (editingStudent) {
        setStudents((previous) =>
          previous.map((student) =>
            student._id === editingStudent._id ? finalStudent : student,
          ),
        );

        toast.success(
          profileImage instanceof File
            ? "Student and profile image updated successfully."
            : "Student updated successfully.",
        );
      } else {
        setStudents((previous) => [...previous, finalStudent]);

        toast.success(
          profileImage instanceof File
            ? "Student and profile image created successfully."
            : "Student created successfully.",
        );
      }

      setShowForm(false);
      setEditingStudent(null);

      setForm({
        ...emptyForm,
      });

      setProfileImage(null);
    } catch (error) {
      console.error("Save student error:", error);

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Unable to save student.",
      );
    } finally {
      setSaving(false);
    }
  };

  const openDeletePopup = (student) => {
    setStudentToDelete(student);
  };

  const closeDeletePopup = () => {
    if (deleting) {
      return;
    }

    setStudentToDelete(null);
  };

  const handleDelete = async () => {
    if (!studentToDelete) {
      return;
    }

    try {
      setDeleting(true);

      await deleteStaffStudent(studentToDelete._id);

      setStudents((previous) =>
        previous.filter((student) => student._id !== studentToDelete._id),
      );

      toast.success("Student removed successfully.");

      setStudentToDelete(null);
    } catch (error) {
      console.error("Delete student error:", error);

      toast.error(error.response?.data?.message || "Unable to remove student.");
    } finally {
      setDeleting(false);
    }
  };

  const getStudentInitials = (student) => {
    const firstName = student.firstName?.trim()?.[0] || "";

    const lastName = student.lastName?.trim()?.[0] || "";

    return `${firstName}${lastName}`.toUpperCase() || "S";
  };

  const filteredStudents = students.filter((student) => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return true;
    }

    return [
      student.firstName,
      student.lastName,
      student.rollNumber,
      student.admissionNumber,
      student.fatherName,
    ]
      .filter(Boolean)
      .some((item) => String(item).toLowerCase().includes(value));
  });

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Students</h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage students from your assigned class.
            </p>

            {classInfo && (
              <p className="mt-2 text-sm font-medium text-indigo-600">
                Class {classInfo.name}
                {classInfo.section ? ` - ${classInfo.section}` : ""}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={openCreate}
            disabled={!teacherId}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={18} />
            Add Student
          </button>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-4">
            <div className="relative max-w-md">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search students..."
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>

          {loading ? (
            <div className="p-10 text-center text-sm text-slate-500">
              Loading students...
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-10 text-center">
              <UserRound size={40} className="mx-auto text-slate-300" />

              <p className="mt-3 font-medium text-slate-700">
                No students found.
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Add a student to your assigned class.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
                    <th className="px-5 py-3">Roll No.</th>

                    <th className="px-5 py-3">Student</th>

                    <th className="px-5 py-3">Admission No.</th>

                    <th className="px-5 py-3">Father</th>

                    <th className="px-5 py-3">Phone</th>

                    <th className="px-5 py-3">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredStudents.map((student) => (
                    <tr
                      key={student._id}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="px-5 py-4 text-sm font-semibold text-slate-700">
                        {student.rollNumber}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-100 text-sm font-bold text-slate-600">
                            {student.profileImage?.url ? (
                              <img
                                src={student.profileImage.url}
                                alt={
                                  student.profileImage.alt ||
                                  `${student.firstName} ${student.lastName} profile image`
                                }
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              getStudentInitials(student)
                            )}
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {student.firstName} {student.lastName}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {student.gender}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {student.admissionNumber}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {student.fatherName}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {student.phone || "-"}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEdit(student)}
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-indigo-50 hover:text-indigo-600"
                            title="Edit"
                          >
                            <Edit size={17} />
                          </button>

                          <button
                            type="button"
                            onClick={() => openDeletePopup(student)}
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                            title="Remove"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {showForm && (
          <StudentForm
            form={form}
            editingStudent={editingStudent}
            saving={saving}
            profileImage={profileImage}
            onProfileImageChange={handleProfileImageChange}
            onRemoveProfileImage={handleRemoveProfileImage}
            onChange={handleChange}
            onSubmit={handleSubmit}
            onClose={closeForm}
          />
        )}
      </div>

      {studentToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h2 className="text-lg font-bold text-slate-900">
                Remove Student
              </h2>

              <button
                type="button"
                onClick={closeDeletePopup}
                disabled={deleting}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X size={19} />
              </button>
            </div>

            <div className="p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
                  <Trash2 size={20} />
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900">
                    Are you sure?
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    You are about to remove{" "}
                    <span className="font-semibold text-slate-700">
                      {studentToDelete.firstName} {studentToDelete.lastName}
                    </span>{" "}
                    from your class.
                  </p>

                  <p className="mt-2 text-xs text-red-500">
                    This will also remove the student's attendance records.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50 px-5 py-4">
              <button
                type="button"
                onClick={closeDeletePopup}
                disabled={deleting}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Trash2 size={16} />

                {deleting ? "Removing..." : "Remove Student"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const LibraryStudents = () => {
  return <LibraryStudentPanel />;
};

export default StaffStudents;
