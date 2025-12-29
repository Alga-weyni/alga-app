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
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 99999,
        background: 'linear-gradient(to right, #c41e3a, #8b0000)',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.3)',
        borderTop: '3px solid #ffd700'
      }}
      data-testid="pagination-container"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }} data-testid="text-page-indicator">
          PAGINATION: Page {page} of {totalPages}
        </span>
        <span style={{ color: '#ffd700', fontSize: '14px' }} data-testid="text-rows-per-page">
          ({limit} per page)
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span style={{ color: 'white', fontSize: '14px' }} data-testid="text-page-info">
          Showing {startItem}-{endItem} of {total}
        </span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            style={{ 
              height: '40px', 
              padding: '0 16px', 
              backgroundColor: page === 1 ? '#666' : '#ffd700', 
              color: page === 1 ? '#999' : '#000',
              fontWeight: 'bold',
              fontSize: '14px',
              border: 'none',
              borderRadius: '6px',
              cursor: page === 1 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            data-testid="button-pagination-prev"
          >
            <ChevronLeft style={{ width: '18px', height: '18px' }} />
            PREV
          </button>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            style={{ 
              height: '40px', 
              padding: '0 16px', 
              backgroundColor: page >= totalPages ? '#666' : '#228b22', 
              color: page >= totalPages ? '#999' : 'white',
              fontWeight: 'bold',
              fontSize: '14px',
              border: 'none',
              borderRadius: '6px',
              cursor: page >= totalPages ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            data-testid="button-pagination-next"
          >
            NEXT
            <ChevronRight style={{ width: '18px', height: '18px' }} />
          </button>
        </div>
      </div>
    </div>
  );
}
