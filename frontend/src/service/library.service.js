import { axiosInstance } from "./axios";

// Get library dashboard statistics
export const getLibraryDashboard = async () => {
  try {
    const response = await axiosInstance.get("/api/library/dashboard");

    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get all classes
export const getLibraryClasses = async () => {
  try {
    const response = await axiosInstance.get("/api/library/classes");

    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get students by selected class
export const getLibraryStudents = async (classId) => {
  if (!classId) {
    throw new Error("Class ID is required.");
  }

  try {
    const response = await axiosInstance.get("/api/library/students", {
      params: {
        classId,
      },
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get particular student
export const getLibraryStudentById = async (studentId) => {
  if (!studentId) {
    throw new Error("Student ID is required.");
  }

  try {
    const response = await axiosInstance.get(
      `/api/library/students/${studentId}`,
    );

    return response.data;
  } catch (error) {
    throw error;
  }
};

// Issue book to student
export const issueBook = async ({
  studentId,
  bookName,
  issueDate,
  returnDate,
  remarks = "",
}) => {
  if (!studentId) {
    throw new Error("Student ID is required.");
  }

  if (!bookName?.trim()) {
    throw new Error("Book name is required.");
  }

  if (!issueDate) {
    throw new Error("Issue date is required.");
  }

  if (!returnDate) {
    throw new Error("Return date is required.");
  }

  const payload = {
    bookName: bookName.trim(),
    issueDate,
    returnDate,
    remarks: remarks.trim(),
  };

  try {
    const response = await axiosInstance.post(
      `/api/library/students/${studentId}/books`,
      payload,
    );

    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update library book record
export const updateLibraryBook = async ({
  studentId,
  libraryBookId,
  bookName,
  issueDate,
  returnDate,
  remarks = "",
}) => {
  if (!studentId) {
    throw new Error("Student ID is required.");
  }

  if (!libraryBookId) {
    throw new Error("Library book ID is required.");
  }

  const payload = {
    bookName: bookName?.trim(),
    issueDate,
    returnDate,
    remarks: remarks.trim(),
  };

  try {
    const response = await axiosInstance.put(
      `/api/library/students/${studentId}/books/${libraryBookId}`,
      payload,
    );

    return response.data;
  } catch (error) {
    throw error;
  }
};

// Receive book from student
export const receiveBook = async ({ studentId, libraryBookId }) => {
  if (!studentId) {
    throw new Error("Student ID is required.");
  }

  if (!libraryBookId) {
    throw new Error("Library book ID is required.");
  }

  try {
    const response = await axiosInstance.patch(
      `/api/library/students/${studentId}/books/${libraryBookId}/receive`,
    );

    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete library book history record
export const deleteLibraryBook = async ({ studentId, libraryBookId }) => {
  if (!studentId) {
    throw new Error("Student ID is required.");
  }

  if (!libraryBookId) {
    throw new Error("Library book ID is required.");
  }

  try {
    const response = await axiosInstance.delete(
      `/api/library/students/${studentId}/books/${libraryBookId}`,
    );

    return response.data;
  } catch (error) {
    throw error;
  }
};
