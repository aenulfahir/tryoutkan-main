import { useState, useMemo, useRef, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  truncate?: boolean;
  maxWidth?: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

interface EnhancedDataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchable?: boolean;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  itemsPerPage?: number;
  emptyMessage?: string;
  loading?: boolean;
  className?: string;
}

const ITEMS_PER_PAGE = 10;

function TruncatedCell({
  children,
  maxWidth = "300px",
  className,
}: {
  children: React.ReactNode;
  maxWidth?: string;
  className?: string;
}) {
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (element) {
      // Check if content is overflowing
      setIsOverflowing(element.scrollWidth > element.clientWidth);
    }
  }, [children]);

  const cellContent = (
    <div
      ref={elementRef}
      className={cn("truncate", className)}
      style={{ maxWidth }}
    >
      {children}
    </div>
  );

  if (isOverflowing) {
    return (
      <div
        className="relative"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {cellContent}
        {showTooltip && (
          <div className="absolute z-50 px-3 py-1.5 text-xs text-white bg-gray-900 rounded-md shadow-lg bottom-full left-1/2 transform -translate-x-1/2 mb-2 whitespace-nowrap max-w-xs">
            {children}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
              <div className="border-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return cellContent;
}

function PaginationControls({
  pagination,
  onPageChange,
  loading,
}: {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
  loading?: boolean;
}) {
  const { currentPage, totalPages, totalItems, itemsPerPage } = pagination;

  // Generate page numbers to show
  const getVisiblePages = () => {
    const delta = 2; // Number of pages to show around current page
    const range: number[] = [];
    const rangeWithDots: (number | string)[] = [];
    let l: number | undefined;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        range.push(i);
      }
    }

    range.forEach((i) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push("...");
        }
      }
      rangeWithDots.push(i);
      l = i;
    });

    return rangeWithDots;
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 p-4 bg-muted/20 rounded-lg border">
      <div className="text-sm text-muted-foreground font-medium">
        Menampilkan {startItem}-{endItem} dari {totalItems} hasil
      </div>

      <div className="flex items-center space-x-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1 || loading}
          className="hidden sm:flex h-8 w-8 p-0 transition-all duration-200 hover:scale-105"
          title="Halaman pertama"
        >
          <ChevronsLeft className="w-4 h-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || loading}
          className="h-8 w-8 p-0 transition-all duration-200 hover:scale-105"
          title="Halaman sebelumnya"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <div className="flex items-center space-x-1">
          {getVisiblePages().map((page, index) =>
            page === "..." ? (
              <span
                key={`dots-${index}`}
                className="px-2 text-muted-foreground text-sm font-medium"
              >
                ...
              </span>
            ) : (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(page as number)}
                disabled={loading}
                className={cn(
                  "min-w-[32px] h-8 transition-all duration-200 hover:scale-105",
                  currentPage === page && "ring-2 ring-primary/20"
                )}
              >
                {page}
              </Button>
            )
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || loading}
          className="h-8 w-8 p-0 transition-all duration-200 hover:scale-105"
          title="Halaman selanjutnya"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages || loading}
          className="hidden sm:flex h-8 w-8 p-0 transition-all duration-200 hover:scale-105"
          title="Halaman terakhir"
        >
          <ChevronsRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

export default function EnhancedDataTable<T extends Record<string, any>>({
  data,
  columns,
  searchable = false,
  searchPlaceholder = "Search...",
  onSearch,
  itemsPerPage = ITEMS_PER_PAGE,
  emptyMessage = "No data available",
  loading = false,
  className,
}: EnhancedDataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!searchQuery.trim() || !onSearch) {
      return data;
    }

    return data.filter((item) => {
      return columns.some((column) => {
        const value = column.render ? column.render(item) : item[column.key];
        if (typeof value === "string" || typeof value === "number") {
          return value
            .toString()
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
        }
        return false;
      });
    });
  }, [data, searchQuery, columns, onSearch]);

  // Calculate pagination
  const pagination = useMemo(() => {
    const totalItems = filteredData.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    return {
      currentPage,
      totalPages,
      totalItems,
      itemsPerPage,
    };
  }, [filteredData.length, currentPage, itemsPerPage]);

  // Get current page data
  const currentPageData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1); // Reset to first page when searching
    onSearch?.(value);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Reset pagination when data changes
  useMemo(() => {
    const maxPage = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
    if (currentPage > maxPage) {
      setCurrentPage(maxPage);
    }
  }, [filteredData.length, currentPage, itemsPerPage]);

  if (loading) {
    return (
      <div className={cn("space-y-4", className)}>
        {searchable && (
          <div className="relative w-full md:w-96">
            <div className="h-10 bg-muted rounded-md animate-pulse" />
          </div>
        )}
        <div className="border rounded-lg overflow-hidden">
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search */}
      {searchable && (
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 h-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20 border-muted-foreground/20"
          />
        </div>
      )}

      {/* Table */}
      <div className="border rounded-xl overflow-hidden bg-background shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-muted/50 to-muted/30 border-b">
                {columns.map((column) => (
                  <TableHead
                    key={column.key}
                    className={cn(
                      "font-semibold text-foreground text-xs md:text-sm px-3 py-4 whitespace-nowrap",
                      column.width && `w-[${column.width}]`
                    )}
                    style={column.width ? { width: column.width } : {}}
                  >
                    {column.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentPageData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="text-center py-16 text-muted-foreground"
                  >
                    <div className="space-y-3">
                      <div className="w-16 h-16 mx-auto bg-muted/50 rounded-full flex items-center justify-center">
                        <Search className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-lg font-medium text-foreground">
                          {emptyMessage}
                        </p>
                        {searchQuery && (
                          <p className="text-sm mt-1">
                            Tidak ada hasil untuk "{searchQuery}"
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                currentPageData.map((item, index) => (
                  <TableRow
                    key={index}
                    className="transition-all duration-150 hover:bg-muted/30 border-b border-muted/20 last:border-b-0"
                  >
                    {columns.map((column) => (
                      <TableCell
                        key={column.key}
                        className={cn(
                          "align-middle px-3 py-4",
                          column.truncate && "p-2"
                        )}
                        style={
                          column.maxWidth ? { maxWidth: column.maxWidth } : {}
                        }
                      >
                        {column.truncate ? (
                          <TruncatedCell
                            maxWidth={column.maxWidth}
                            className="py-1"
                          >
                            {column.render
                              ? column.render(item)
                              : item[column.key]}
                          </TruncatedCell>
                        ) : column.render ? (
                          column.render(item)
                        ) : (
                          item[column.key]
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      <PaginationControls
        pagination={pagination}
        onPageChange={handlePageChange}
        loading={loading}
      />
    </div>
  );
}
