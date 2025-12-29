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
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 99999,
        backgroundColor: '#ff0000',
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.5)'
      }}
      data-testid="pagination-container"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span style={{ color: 'white', fontWeight: 'bold', fontSize: '18px' }} data-testid="text-page-indicator">
          PAGINATION: Page {page} of {totalPages}
        </span>
        <span style={{ color: 'yellow', fontSize: '14px' }} data-testid="text-rows-per-page">
          ({limit} per page)
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span style={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }} data-testid="text-page-info">
          Showing {startItem}-{endItem} of {total}
        </span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            style={{ 
              height: '44px', 
              padding: '0 20px', 
              backgroundColor: 'white', 
              color: 'black',
              fontWeight: 'bold',
              fontSize: '16px'
            }}
            data-testid="button-pagination-prev"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            PREV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            style={{ 
              height: '44px', 
              padding: '0 20px', 
              backgroundColor: 'black', 
              color: 'white',
              fontWeight: 'bold',
              fontSize: '16px'
            }}
            data-testid="button-pagination-next"
          >
            NEXT
            <ChevronRight className="h-5 w-5 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
