import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SimplePaginationProps {
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function SimplePagination({ page, limit, total, onPageChange }: SimplePaginationProps) {
  const totalPages = Math.ceil(total / limit) || 1;
  const startItem = total > 0 ? (page - 1) * limit + 1 : 0;
  const endItem = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-[#faf5f0] border border-[#d4a574] rounded-lg mt-4" data-testid="pagination-container">
      <div className="text-sm text-gray-600" data-testid="text-rows-per-page">
        Rows per page: {limit}
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600" data-testid="text-page-info">
          {startItem}-{endItem} of {total}
        </span>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            className="h-8 w-8 bg-[#f5e6d3] border-[#d4a574] hover:bg-[#e8d5c0] disabled:opacity-50"
            data-testid="button-pagination-prev"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="h-8 w-8 bg-[#b8860b] text-white border-[#b8860b] hover:bg-[#9a7209] disabled:opacity-50"
            data-testid="button-pagination-next"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
