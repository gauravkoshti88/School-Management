const ClassSkeleton = () => {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center gap-3 border-b border-gray-100 p-5 dark:border-gray-800">
        <div className="h-12 w-12 rounded-xl bg-gray-200 dark:bg-gray-800" />

        <div className="flex-1 space-y-2">
          <div className="h-4 w-1/3 rounded bg-gray-200 dark:bg-gray-800" />
          <div className="h-3 w-1/4 rounded bg-gray-200 dark:bg-gray-800" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 p-5">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-16 rounded-xl bg-gray-100 dark:bg-gray-800"
          />
        ))}
      </div>

      <div className="border-t border-gray-100 p-4 dark:border-gray-800">
        <div className="h-10 rounded-xl bg-gray-100 dark:bg-gray-800" />
      </div>
    </div>
  );
};

export default ClassSkeleton;
