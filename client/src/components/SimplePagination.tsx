import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

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
      className="sticky bottom-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#d4a574] to-[#b8860b] border-t-4 border-[#8B4513] rounded-t-xl shadow-2xl mt-8"
      data-testid="pagination-container"
    >
      <div className="flex items-center gap-4">
        <span className="text-white font-bold text-base" data-testid="text-page-indicator">
          Page {page} of {totalPages}
        </span>
        <span className="text-white/80 text-sm hidden sm:inline" data-testid="text-rows-per-page">
          ({limit} per page)
        </span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-white font-medium text-sm hidden sm:inline" data-testid="text-page-info">
          Showing <span className="font-bold">{startItem}-{endItem}</span> of <span className="font-bold">{total}</span>
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            className="h-10 px-4 bg-white text-[#8B4513] border-2 border-white hover:bg-[#f5e6d3] font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            data-testid="button-pagination-prev"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Prev
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="h-10 px-4 bg-[#2d1405] text-white border-2 border-[#2d1405] hover:bg-[#4a2409] font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            data-testid="button-pagination-next"
          >
            Next
            <ChevronRight className="h-5 w-5 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
