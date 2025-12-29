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
      className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#f5e6d3] to-[#faf5f0] border-2 border-[#b8860b] rounded-xl mt-6 shadow-md"
      data-testid="pagination-container"
    >
      <div className="text-sm font-medium text-[#5c4033]" data-testid="text-rows-per-page">
        Rows per page: <span className="font-bold text-[#2d1405]">{limit}</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-[#5c4033]" data-testid="text-page-info">
          <span className="font-bold text-[#2d1405]">{startItem}-{endItem}</span> of <span className="font-bold text-[#2d1405]">{total}</span>
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            className="h-9 w-9 bg-white border-2 border-[#d4a574] hover:bg-[#f5e6d3] hover:border-[#b8860b] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            data-testid="button-pagination-prev"
          >
            <ChevronLeft className="h-5 w-5 text-[#5c4033]" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="h-9 w-9 bg-[#b8860b] text-white border-2 border-[#b8860b] hover:bg-[#9a7209] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            data-testid="button-pagination-next"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
