import { ChevronLeft, ChevronRight } from "lucide-react";

interface SimplePaginationProps {
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function SimplePagination({ page, limit, total, onPageChange }: SimplePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const startItem = total > 0 ? (page - 1) * limit + 1 : 0;
  const endItem = Math.min(page * limit, total);

  return (
    <div 
      className="flex items-center justify-between px-4 py-3 bg-[#f5e6d3] border-t border-[#d4a574]"
      data-testid="pagination-container"
    >
      <div className="text-sm text-[#5c4033]" data-testid="text-rows-per-page">
        Rows per page: {limit}
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-[#5c4033]" data-testid="text-page-info">
          {startItem}-{endItem} of {total}
        </span>
        <div className="flex gap-1">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            className="w-8 h-8 flex items-center justify-center rounded bg-[#d4a574] text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#b8860b] transition-colors"
            data-testid="button-pagination-prev"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="w-8 h-8 flex items-center justify-center rounded bg-[#d4a574] text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#b8860b] transition-colors"
            data-testid="button-pagination-next"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
