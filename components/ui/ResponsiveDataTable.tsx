import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface Column<T> {
  key: string;
  title: string;
  dataIndex: keyof T;
  render?: (value: any, record: T) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  className?: string;
}

interface ResponsiveDataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  className?: string;
  searchable?: boolean;
  filterable?: boolean;
  pagination?: boolean;
  pageSize?: number;
  onRowClick?: (record: T) => void;
}

export function ResponsiveDataTable<T extends Record<string, any>>({
  data,
  columns,
  className,
  searchable = false,
  filterable = false,
  pagination = false,
  pageSize = 10,
  onRowClick,
}: ResponsiveDataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // Handle sort
  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(columnKey);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  // Handle filter
  const handleFilter = (columnKey: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [columnKey]: value,
    }));
    setCurrentPage(1);
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({});
    setSearchTerm("");
    setCurrentPage(1);
  };

  // Filter and sort data
  const filteredData = data.filter((record) => {
    // Apply search filter
    if (searchTerm) {
      const searchMatch = columns.some((column) => {
        const value = record[column.dataIndex];
        if (value !== null && value !== undefined) {
          return String(value).toLowerCase().includes(searchTerm.toLowerCase());
        }
        return false;
      });
      if (!searchMatch) return false;
    }

    // Apply column filters
    for (const [key, value] of Object.entries(filters)) {
      if (value && record[key as keyof T] !== value) {
        return false;
      }
    }

    return true;
  });

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortColumn) return 0;

    const aValue = a[sortColumn as keyof T];
    const bValue = b[sortColumn as keyof T];

    if (aValue === null) return 1;
    if (bValue === null) return -1;

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = pagination
    ? sortedData.slice(startIndex, endIndex)
    : sortedData;

  return (
    <div className={cn("w-full", className)}>
      {/* Search and Filters - Mobile */}
      <div className="lg:hidden mb-4 space-y-2">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 min-h-[44px]"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="min-h-[44px]"
          >
            <Filter className="w-4 h-4" />
            <span className="sr-only">Filters</span>
          </Button>
        </div>

        {/* Mobile Filters */}
        {showMobileFilters && (
          <div className="bg-card border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">Filters</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMobileFilters(false)}
              >
                <EyeOff className="w-4 h-4" />
              </Button>
            </div>

            {columns
              .filter((column) => column.filterable)
              .map((column) => (
                <div key={column.key} className="space-y-2">
                  <label className="text-sm font-medium">{column.title}</label>
                  <Input
                    placeholder={`Filter by ${column.title}`}
                    value={filters[column.key] || ""}
                    onChange={(e) => handleFilter(column.key, e.target.value)}
                    className="min-h-[44px]"
                  />
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Search and Filters - Desktop */}
      <div className="hidden lg:flex lg:items-center lg:justify-between lg:mb-4 lg:space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {columns.some((column) => column.filterable) && (
          <div className="flex items-center space-x-2">
            {columns
              .filter((column) => column.filterable)
              .map((column) => (
                <DropdownMenu key={column.key}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="min-h-[44px]"
                    >
                      {column.title}
                      <ChevronDown className="w-4 h-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuItem
                      onClick={() => handleFilter(column.key, "")}
                    >
                      All
                    </DropdownMenuItem>
                    {Array.from(
                      new Set(
                        data.map((item) => item[column.dataIndex] as string)
                      )
                    )
                      .filter(Boolean)
                      .sort()
                      .map((value) => (
                        <DropdownMenuItem
                          key={value}
                          onClick={() => handleFilter(column.key, value)}
                        >
                          {value}
                        </DropdownMenuItem>
                      ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ))}
          </div>
        )}

        {Object.keys(filters).length > 0 && (
          <Button variant="outline" size="sm" onClick={clearFilters}>
            Clear Filters
          </Button>
        )}
      </div>

      {/* Table - Mobile */}
      <div className="lg:hidden overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  className={cn(
                    "whitespace-nowrap",
                    column.sortable && "cursor-pointer hover:bg-accent",
                    column.className
                  )}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.title}</span>
                    {column.sortable && (
                      <div className="flex flex-col">
                        {sortColumn === column.key ? (
                          sortDirection === "asc" ? (
                            <ChevronUp className="w-3 h-3" />
                          ) : (
                            <ChevronDown className="w-3 h-3" />
                          )
                        ) : (
                          <MoreHorizontal className="w-3 h-3" />
                        )}
                      </div>
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((record, index) => (
              <TableRow
                key={record.id || index}
                className={cn(
                  "cursor-pointer hover:bg-accent",
                  onRowClick && "cursor-pointer"
                )}
                onClick={() => onRowClick && onRowClick(record)}
              >
                {columns.map((column) => (
                  <TableCell
                    key={column.key}
                    className={cn("whitespace-nowrap", column.className)}
                  >
                    {column.render
                      ? column.render(record[column.dataIndex], record)
                      : record[column.dataIndex]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Table - Desktop */}
      <div className="hidden lg:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  className={cn(
                    "whitespace-nowrap",
                    column.sortable && "cursor-pointer hover:bg-accent",
                    column.className
                  )}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.title}</span>
                    {column.sortable && (
                      <div className="flex flex-col">
                        {sortColumn === column.key ? (
                          sortDirection === "asc" ? (
                            <ChevronUp className="w-3 h-3" />
                          ) : (
                            <ChevronDown className="w-3 h-3" />
                          )
                        ) : (
                          <MoreHorizontal className="w-3 h-3" />
                        )}
                      </div>
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((record, index) => (
              <TableRow
                key={record.id || index}
                className={cn(
                  "cursor-pointer hover:bg-accent",
                  onRowClick && "cursor-pointer"
                )}
                onClick={() => onRowClick && onRowClick(record)}
              >
                {columns.map((column) => (
                  <TableCell
                    key={column.key}
                    className={cn("whitespace-nowrap", column.className)}
                  >
                    {column.render
                      ? column.render(record[column.dataIndex], record)
                      : record[column.dataIndex]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination - Mobile */}
      {pagination && totalPages > 1 && (
        <div className="lg:hidden mt-4 flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="min-h-[44px]"
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setCurrentPage(Math.min(totalPages, currentPage + 1))
            }
            disabled={currentPage === totalPages}
            className="min-h-[44px]"
          >
            Next
          </Button>
        </div>
      )}

      {/* Pagination - Desktop */}
      {pagination && totalPages > 1 && (
        <div className="hidden lg:flex lg:items-center lg:justify-between lg:mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <div className="flex items-center space-x-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <Button
                key={i}
                variant={currentPage === i + 1 ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(i + 1)}
                className="min-h-[36px] min-w-[36px]"
              >
                {i + 1}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setCurrentPage(Math.min(totalPages, currentPage + 1))
            }
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* No data message */}
      {paginatedData.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">No data available</p>
        </div>
      )}
    </div>
  );
}
