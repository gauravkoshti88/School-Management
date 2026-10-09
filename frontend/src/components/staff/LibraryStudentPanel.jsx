import { useEffect, useMemo, useState } from "react";

import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Edit,
  Library,
  Plus,
  Search,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

import toast from "react-hot-toast";

import ConfirmModal from "../../components/common/ConfirmModal";

import {
  deleteLibraryBook,
  getLibraryClasses,
  getLibraryStudentById,
  getLibraryStudents,
  issueBook,
  receiveBook,
  updateLibraryBook,
} from "../../service/library.service";

const emptyBookForm = {
  bookName: "",
  issueDate: "",
  returnDate: "",
  remarks: "",
};

const getToday = () => {
  return new Date().toISOString().slice(0, 10);
};

const getStudentInitials = (student) => {
  const first = student?.firstName?.trim()?.[0] || "";
  const last = student?.lastName?.trim()?.[0] || "";

  return `${first}${last}`.toUpperCase() || "S";
};

const formatDate = (date) => {
  if (!date) {
    return "-";
  }

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const LibraryStudentPanel = () => {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);

  const [selectedClassId, setSelectedClassId] = useState("");

  const [selectedStudent, setSelectedStudent] = useState(null);

  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingStudent, setLoadingStudent] = useState(false);

  const [search, setSearch] = useState("");

  const [showBookForm, setShowBookForm] = useState(false);
  const [editingBook, setEditingBook] = useState(null);

  const [savingBook, setSavingBook] = useState(false);

  const [receivingBookId, setReceivingBookId] = useState(null);
  const [deletingBookId, setDeletingBookId] = useState(null);

  const [bookForm, setBookForm] = useState({
    ...emptyBookForm,
  });

  const [confirmModal, setConfirmModal] = useState({
    open: false,
    type: "",
    book: null,
  });

  const loadClasses = async () => {
    try {
      setLoadingClasses(true);

      const response = await getLibraryClasses();

      setClasses(response.classes || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load classes.");
    } finally {
      setLoadingClasses(false);
    }
  };

  useEffect(() => {
    loadClasses();
  }, []);

  const loadStudents = async (classId) => {
    if (!classId) {
      setStudents([]);
      return;
    }

    try {
      setLoadingStudents(true);
      setSelectedStudent(null);

      const response = await getLibraryStudents(classId);

      setStudents(response.students || []);
    } catch (error) {
      setStudents([]);

      toast.error(error.response?.data?.message || "Unable to load students.");
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleClassChange = (event) => {
    const classId = event.target.value;

    setSelectedClassId(classId);
    setSearch("");

    loadStudents(classId);
  };

  const openStudent = async (student) => {
    try {
      setLoadingStudent(true);

      const response = await getLibraryStudentById(student._id);

      const studentData =
        response?.student ||
        response?.data?.student ||
        response?.data ||
        response;

      if (!studentData?._id) {
        throw new Error("Student data was not returned.");
      }

      setSelectedStudent(studentData);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Unable to open student.",
      );
    } finally {
      setLoadingStudent(false);
    }
  };

  const goBackToStudents = () => {
    setSelectedStudent(null);
    setShowBookForm(false);
    setEditingBook(null);

    setBookForm({
      ...emptyBookForm,
    });

    setConfirmModal({
      open: false,
      type: "",
      book: null,
    });
  };

  const handleBookChange = (event) => {
    const { name, value } = event.target;

    setBookForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const openIssueBook = () => {
    setEditingBook(null);

    setBookForm({
      ...emptyBookForm,
      issueDate: getToday(),
      returnDate: getToday(),
    });

    setShowBookForm(true);
  };

  const openEditBook = (book) => {
    setEditingBook(book);

    setBookForm({
      bookName: book.bookName || "",
      issueDate: book.issueDate ? book.issueDate.slice(0, 10) : "",
      returnDate: book.returnDate ? book.returnDate.slice(0, 10) : "",
      remarks: book.remarks || "",
    });

    setShowBookForm(true);
  };

  const closeBookForm = () => {
    if (savingBook) {
      return;
    }

    setShowBookForm(false);
    setEditingBook(null);

    setBookForm({
      ...emptyBookForm,
    });
  };

  const handleBookSubmit = async (event) => {
    event.preventDefault();

    if (!selectedStudent?._id) {
      return;
    }

    if (!bookForm.bookName.trim()) {
      toast.error("Book name is required.");
      return;
    }

    if (!bookForm.issueDate) {
      toast.error("Issue date is required.");
      return;
    }

    if (!bookForm.returnDate) {
      toast.error("Expected return date is required.");
      return;
    }

    if (bookForm.returnDate < bookForm.issueDate) {
      toast.error("Return date cannot be before issue date.");
      return;
    }

    try {
      setSavingBook(true);

      let response;

      if (editingBook) {
        response = await updateLibraryBook({
          studentId: selectedStudent._id,
          libraryBookId: editingBook._id,
          bookName: bookForm.bookName,
          issueDate: bookForm.issueDate,
          returnDate: bookForm.returnDate,
          remarks: bookForm.remarks,
        });

        toast.success("Library record updated successfully.");
      } else {
        response = await issueBook({
          studentId: selectedStudent._id,
          bookName: bookForm.bookName,
          issueDate: bookForm.issueDate,
          returnDate: bookForm.returnDate,
          remarks: bookForm.remarks,
        });

        toast.success("Book issued successfully.");
      }

      const updatedStudent =
        response?.student || response?.data?.student || null;

      if (updatedStudent?._id) {
        setSelectedStudent(updatedStudent);
      } else {
        await openStudent(selectedStudent);
      }

      setShowBookForm(false);
      setEditingBook(null);

      setBookForm({
        ...emptyBookForm,
      });
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Unable to save library record.",
      );
    } finally {
      setSavingBook(false);
    }
  };

  const closeConfirmModal = () => {
    if (receivingBookId || deletingBookId) {
      return;
    }

    setConfirmModal({
      open: false,
      type: "",
      book: null,
    });
  };

  const openReceiveConfirmation = (book) => {
    if (!book?._id || book.status !== "issued") {
      return;
    }

    setConfirmModal({
      open: true,
      type: "receive",
      book,
    });
  };

  const openDeleteConfirmation = (book) => {
    if (!book?._id) {
      return;
    }

    setConfirmModal({
      open: true,
      type: "delete",
      book,
    });
  };

  const handleReceiveBook = async (book) => {
    if (!selectedStudent?._id) {
      return;
    }

    if (!book?._id || book.status !== "issued") {
      return;
    }

    try {
      setReceivingBookId(book._id);

      const response = await receiveBook({
        studentId: selectedStudent._id,
        libraryBookId: book._id,
      });

      const updatedStudent =
        response?.student || response?.data?.student || null;

      if (updatedStudent?._id) {
        setSelectedStudent(updatedStudent);
      } else {
        await openStudent(selectedStudent);
      }

      toast.success("Book received successfully.");

      setConfirmModal({
        open: false,
        type: "",
        book: null,
      });
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Unable to receive book.",
      );
    } finally {
      setReceivingBookId(null);
    }
  };

  const handleDeleteBook = async (book) => {
    if (!selectedStudent?._id) {
      return;
    }

    if (!book?._id) {
      return;
    }

    try {
      setDeletingBookId(book._id);

      const response = await deleteLibraryBook({
        studentId: selectedStudent._id,
        libraryBookId: book._id,
      });

      const updatedStudent =
        response?.student || response?.data?.student || null;

      if (updatedStudent?._id) {
        setSelectedStudent(updatedStudent);
      } else {
        await openStudent(selectedStudent);
      }

      toast.success("Library record deleted successfully.");

      setConfirmModal({
        open: false,
        type: "",
        book: null,
      });
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Unable to delete library record.",
      );
    } finally {
      setDeletingBookId(null);
    }
  };

  const filteredStudents = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return students;
    }

    return students.filter((student) =>
      [
        student.firstName,
        student.lastName,
        student.rollNumber,
        student.admissionNumber,
        student.fatherName,
      ]
        .filter(Boolean)
        .some((item) => String(item).toLowerCase().includes(value)),
    );
  }, [students, search]);

  const libraryBooks = selectedStudent?.libraryBooks || [];

  const issuedBooks = libraryBooks.filter((book) => book.status === "issued");

  const returnedBooks = libraryBooks.filter(
    (book) => book.status === "returned",
  );

  if (selectedStudent) {
    const confirmBook = confirmModal.book;

    const isConfirmLoading = Boolean(
      confirmBook?._id &&
      (receivingBookId === confirmBook._id ||
        deletingBookId === confirmBook._id),
    );

    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={goBackToStudents}
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            <ArrowLeft size={17} />
            Back to Students
          </button>

          <button
            type="button"
            onClick={openIssueBook}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            <Plus size={18} />
            Issue Book
          </button>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 text-xl font-bold text-slate-600">
              {selectedStudent.profileImage?.url ? (
                <img
                  src={selectedStudent.profileImage.url}
                  alt={
                    selectedStudent.profileImage.alt ||
                    `${selectedStudent.firstName} ${selectedStudent.lastName} profile image`
                  }
                  className="h-full w-full object-cover"
                />
              ) : (
                getStudentInitials(selectedStudent)
              )}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900">
                  {selectedStudent.firstName} {selectedStudent.lastName}
                </h1>

                <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-600">
                  {selectedStudent.status || "active"}
                </span>
              </div>

              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-500">
                <span>
                  Roll:{" "}
                  <strong className="text-slate-700">
                    {selectedStudent.rollNumber}
                  </strong>
                </span>

                <span>
                  Admission:{" "}
                  <strong className="text-slate-700">
                    {selectedStudent.admissionNumber}
                  </strong>
                </span>

                <span>
                  Class:{" "}
                  <strong className="text-slate-700">
                    {selectedStudent.classId?.name ||
                      selectedStudent.class?.name ||
                      "-"}
                  </strong>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
                <BookOpen size={20} />
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500">
                  Total Records
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {libraryBooks.length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600">
                <Clock3 size={20} />
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500">
                  Currently Issued
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {issuedBooks.length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
                <CheckCircle2 size={20} />
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500">Returned</p>

                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {returnedBooks.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Library History
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Issue and return history of this student.
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Library size={17} />
              {libraryBooks.length} records
            </div>
          </div>

          {libraryBooks.length === 0 ? (
            <div className="p-10 text-center">
              <BookOpen size={42} className="mx-auto text-slate-300" />

              <p className="mt-3 font-semibold text-slate-700">
                No library history
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Issue a book to create the first library record.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
                    <th className="px-5 py-3">Book</th>

                    <th className="px-5 py-3">Issue Date</th>

                    <th className="px-5 py-3">Expected Return</th>

                    <th className="px-5 py-3">Actual Return</th>

                    <th className="px-5 py-3">Status</th>

                    <th className="px-5 py-3">Remarks</th>

                    <th className="px-5 py-3">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {libraryBooks.map((book) => (
                    <tr
                      key={book._id}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
                            <BookOpen size={18} />
                          </div>

                          <p className="text-sm font-semibold text-slate-900">
                            {book.bookName}
                          </p>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {formatDate(book.issueDate)}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {formatDate(book.returnDate)}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {formatDate(book.returnedDate)}
                      </td>

                      <td className="px-5 py-4">
                        {book.status === "issued" ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                            <Clock3 size={13} />
                            Issued
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                            <CheckCircle2 size={13} />
                            Returned
                          </span>
                        )}
                      </td>

                      <td className="max-w-[220px] px-5 py-4 text-sm text-slate-500">
                        <span className="line-clamp-2">
                          {book.remarks || "-"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          {book.status === "issued" && (
                            <button
                              type="button"
                              onClick={() => openReceiveConfirmation(book)}
                              disabled={receivingBookId === book._id}
                              className="rounded-lg p-2 text-emerald-600 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
                              title="Receive Book"
                            >
                              <CheckCircle2 size={17} />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => openEditBook(book)}
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-indigo-50 hover:text-indigo-600"
                            title="Edit"
                          >
                            <Edit size={17} />
                          </button>

                          <button
                            type="button"
                            onClick={() => openDeleteConfirmation(book)}
                            disabled={deletingBookId === book._id}
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                            title="Delete"
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

        {showBookForm && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
            <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {editingBook ? "Edit Library Record" : "Issue Book"}
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    {selectedStudent.firstName} {selectedStudent.lastName}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeBookForm}
                  disabled={savingBook}
                  className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                >
                  <X size={19} />
                </button>
              </div>

              <form onSubmit={handleBookSubmit} className="space-y-5 p-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Book Name
                  </label>

                  <div className="relative">
                    <BookOpen
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="text"
                      name="bookName"
                      value={bookForm.bookName}
                      onChange={handleBookChange}
                      placeholder="Enter book name"
                      className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Issue Date
                    </label>

                    <div className="relative">
                      <CalendarDays
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        type="date"
                        name="issueDate"
                        value={bookForm.issueDate}
                        onChange={handleBookChange}
                        className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Expected Return
                    </label>

                    <div className="relative">
                      <CalendarDays
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        type="date"
                        name="returnDate"
                        value={bookForm.returnDate}
                        onChange={handleBookChange}
                        className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Remarks
                  </label>

                  <textarea
                    name="remarks"
                    value={bookForm.remarks}
                    onChange={handleBookChange}
                    rows={4}
                    placeholder="Optional remarks"
                    className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    onClick={closeBookForm}
                    disabled={savingBook}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={savingBook}
                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {editingBook ? <Edit size={16} /> : <Plus size={16} />}

                    {savingBook
                      ? "Saving..."
                      : editingBook
                        ? "Update Record"
                        : "Issue Book"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <ConfirmModal
          open={confirmModal.open}
          title={
            confirmModal.type === "receive"
              ? "Receive Book"
              : "Delete Library Record"
          }
          message={
            confirmModal.type === "receive"
              ? "Are you sure this book has been received from this student?"
              : "Are you sure you want to delete this library record?"
          }
          itemName={confirmModal.book?.bookName || ""}
          confirmText={
            confirmModal.type === "receive" ? "Receive Book" : "Delete Record"
          }
          cancelText="Cancel"
          loading={isConfirmLoading}
          onConfirm={() => {
            if (!confirmModal.book) {
              return;
            }

            if (confirmModal.type === "receive") {
              handleReceiveBook(confirmModal.book);
              return;
            }

            if (confirmModal.type === "delete") {
              handleDeleteBook(confirmModal.book);
            }
          }}
          onCancel={closeConfirmModal}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Library Students</h1>

        <p className="mt-1 text-sm text-slate-500">
          Select a class and manage students' library records.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
            <Library size={20} />
          </div>

          <div>
            <h2 className="font-bold text-slate-900">Select Class</h2>

            <p className="mt-1 text-xs text-slate-500">
              Librarian can select any class.
            </p>
          </div>
        </div>

        <div className="mt-5">
          <select
            value={selectedClassId}
            onChange={handleClassChange}
            disabled={loadingClasses}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          >
            <option value="">
              {loadingClasses ? "Loading classes..." : "Select a class"}
            </option>

            {classes.map((item) => (
              <option key={item._id} value={item._id}>
                Class {item.name}
                {item.section ? ` - ${item.section}` : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!selectedClassId ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <Library size={44} className="mx-auto text-slate-300" />

          <p className="mt-4 font-semibold text-slate-700">Select a class</p>

          <p className="mt-1 text-sm text-slate-500">
            Students of the selected class will appear here.
          </p>
        </div>
      ) : (
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

          {loadingStudents ? (
            <div className="p-10 text-center text-sm text-slate-500">
              Loading students...
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-10 text-center">
              <UserRound size={40} className="mx-auto text-slate-300" />

              <p className="mt-3 font-semibold text-slate-700">
                No students found
              </p>

              <p className="mt-1 text-sm text-slate-500">
                There are no active students in this class.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
                    <th className="px-5 py-3">Student</th>

                    <th className="px-5 py-3">Roll No.</th>

                    <th className="px-5 py-3">Admission No.</th>

                    <th className="px-5 py-3">Father</th>

                    <th className="px-5 py-3">Library</th>

                    <th className="px-5 py-3">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredStudents.map((student) => {
                    const books = student.libraryBooks || [];

                    const issuedCount = books.filter(
                      (book) => book.status === "issued",
                    ).length;

                    return (
                      <tr
                        key={student._id}
                        className="border-b border-slate-100 last:border-0"
                      >
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

                        <td className="px-5 py-4 text-sm font-semibold text-slate-700">
                          {student.rollNumber}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {student.admissionNumber}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {student.fatherName}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex flex-col gap-1">
                            <span className="text-sm font-semibold text-slate-700">
                              {books.length} records
                            </span>

                            <span className="text-xs text-amber-600">
                              {issuedCount} issued
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <button
                            type="button"
                            onClick={() => openStudent(student)}
                            disabled={loadingStudent}
                            className="inline-flex items-center gap-2 rounded-xl bg-indigo-50 px-3.5 py-2 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <BookOpen size={16} />
                            Open
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LibraryStudentPanel;
