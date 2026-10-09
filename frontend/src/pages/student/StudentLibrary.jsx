import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  History,
} from "lucide-react";
import { useEffect, useState } from "react";

import PageLoader from "../../components/PageLoader";
import { getStudentDashboard } from "../../service/studentAuth.service";

const StudentLibrary = () => {
  const [library, setLibrary] = useState({
    summary: {
      total: 0,
      issued: 0,
      returned: 0,
      overdue: 0,
    },
    currentlyIssued: [],
    history: [],
  });

  const [loading, setLoading] = useState(true);

  const fetchLibrary = async () => {
    try {
      setLoading(true);

      const response = await getStudentDashboard();

      setLibrary(
        response.library || {
          summary: {
            total: 0,
            issued: 0,
            returned: 0,
            overdue: 0,
          },
          currentlyIssued: [],
          history: [],
        },
      );
    } catch (error) {
      console.error("Student library error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLibrary();
  }, []);

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Library</h1>

        <p className="mt-1 text-sm text-slate-500">
          View your issued books and complete library history.
        </p>
      </div>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <LibraryStat
          title="Total Books"
          value={library.summary.total}
          icon={<BookOpen size={20} />}
        />

        <LibraryStat
          title="Currently Issued"
          value={library.summary.issued}
          icon={<BookOpen size={20} />}
        />

        <LibraryStat
          title="Returned"
          value={library.summary.returned}
          icon={<CheckCircle2 size={20} />}
        />

        <LibraryStat
          title="Overdue"
          value={library.summary.overdue}
          icon={<Clock3 size={20} />}
        />
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
              <BookOpen size={20} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Currently Issued Books
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Books that are currently with you
              </p>
            </div>
          </div>
        </div>

        {library.currentlyIssued.length === 0 ? (
          <EmptyState message="No books are currently issued." />
        ) : (
          <div className="grid grid-cols-1 gap-4 p-5 lg:grid-cols-2">
            {library.currentlyIssued.map((book) => (
              <IssuedBookCard key={book._id} book={book} />
            ))}
          </div>
        )}
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-slate-100 p-2.5 text-slate-600">
              <History size={20} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Library History
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Complete history of your library books
              </p>
            </div>
          </div>
        </div>

        {library.history.length === 0 ? (
          <EmptyState message="No library history found." />
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Book
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Issue Date
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Due Date
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Returned
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {library.history.map((book) => (
                    <tr key={book._id} className="transition hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-slate-800">
                          {book.bookName}
                        </p>

                        {book.remarks && (
                          <p className="mt-1 max-w-xs text-xs text-slate-400">
                            {book.remarks}
                          </p>
                        )}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                        {formatDate(book.issueDate)}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                        {formatDate(book.returnDate)}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                        {book.returnedDate
                          ? formatDate(book.returnedDate)
                          : "—"}
                      </td>

                      <td className="px-5 py-4">
                        <LibraryStatus book={book} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-slate-100 md:hidden">
              {library.history.map((book) => (
                <div key={book._id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-800">
                        {book.bookName}
                      </p>

                      {book.remarks && (
                        <p className="mt-1 text-xs text-slate-400">
                          {book.remarks}
                        </p>
                      )}
                    </div>

                    <LibraryStatus book={book} />
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <DateItem label="Issue Date" value={book.issueDate} />

                    <DateItem label="Due Date" value={book.returnDate} />

                    <DateItem label="Returned" value={book.returnedDate} />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
};

const LibraryStat = ({ title, value, icon }) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
          {icon}
        </div>

        <span className="text-2xl font-bold text-slate-900">{value}</span>
      </div>

      <p className="mt-4 text-sm font-medium text-slate-500">{title}</p>
    </div>
  );
};

const IssuedBookCard = ({ book }) => {
  const overdue = book.returnDate && new Date(book.returnDate) < new Date();

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
            <BookOpen size={21} />
          </div>

          <div className="min-w-0">
            <h3 className="truncate text-sm font-bold text-slate-900">
              {book.bookName}
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Issued on {formatDate(book.issueDate)}
            </p>
          </div>
        </div>

        <LibraryStatus book={book} />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <DateItem label="Issue Date" value={book.issueDate} />

        <DateItem label="Due Date" value={book.returnDate} />
      </div>

      {book.remarks && (
        <div className="mt-4 rounded-xl bg-white px-3 py-2.5">
          <p className="text-xs font-medium text-slate-400">Remarks</p>

          <p className="mt-1 text-sm text-slate-600">{book.remarks}</p>
        </div>
      )}

      {overdue && (
        <div className="mt-4 rounded-xl bg-red-50 px-3 py-2.5 text-xs font-semibold text-red-700">
          This book is overdue. Please return it to the library.
        </div>
      )}
    </div>
  );
};

const DateItem = ({ label, value }) => {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-2.5">
      <div className="flex items-center gap-1.5">
        <CalendarDays size={13} className="text-slate-400" />

        <p className="text-xs font-medium text-slate-400">{label}</p>
      </div>

      <p className="mt-1 text-sm font-semibold text-slate-700">
        {value ? formatDate(value) : "—"}
      </p>
    </div>
  );
};

const LibraryStatus = ({ book }) => {
  const overdue =
    book.status === "issued" &&
    book.returnDate &&
    new Date(book.returnDate) < new Date();

  if (overdue) {
    return (
      <span className="inline-flex shrink-0 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
        Overdue
      </span>
    );
  }

  if (book.status === "issued") {
    return (
      <span className="inline-flex shrink-0 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
        Issued
      </span>
    );
  }

  if (book.status === "returned") {
    return (
      <span className="inline-flex shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
        Returned
      </span>
    );
  }

  return (
    <span className="inline-flex shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
      {book.status || "Unknown"}
    </span>
  );
};

const EmptyState = ({ message }) => {
  return (
    <div className="p-10 text-center">
      <BookOpen size={38} className="mx-auto text-slate-300" />

      <p className="mt-3 text-sm font-medium text-slate-600">{message}</p>
    </div>
  );
};

const formatDate = (date) => {
  if (!date) {
    return "—";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "—";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default StudentLibrary;
