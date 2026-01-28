"use client";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-between mt-6">
      <div className="text-sm text-gray-400">
        Halaman <span className="text-white font-medium">{currentPage}</span> dari <span className="text-white font-medium">{totalPages}</span>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-[#152036] border border-gray-700 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition"
        >
          Previous
        </button>
        <div className="flex gap-2">
          {pages.map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`w-10 h-10 flex items-center justify-center rounded-xl transition ${
                currentPage === page
                  ? "bg-blue-600 text-white"
                  : "bg-[#152036] border border-gray-700 text-gray-300 hover:bg-gray-700"
              }`}
            >
              {page}
            </button>
          ))}
        </div>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-[#152036] border border-gray-700 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition"
        >
          Next
        </button>
      </div>
    </div>
  );
}
