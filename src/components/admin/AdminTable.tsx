import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  ChevronRight, 
  MoreHorizontal,
  Search,
  Filter
} from "lucide-react";
import { Input } from "@/components/ui/input";

interface AdminTableProps<T> {
  columns: {
    header: string;
    accessorKey?: keyof T | string;
    cell?: (row: T) => React.ReactNode;
  }[];
  data: T[];
  isLoading?: boolean;
  onSearch?: (value: string) => void;
  pagination?: {
    pageIndex: number;
    pageSize: number;
    totalCount: number;
    onPageChange: (index: number) => void;
  };
  actions?: (row: T) => React.ReactNode;
}

export function AdminTable<T>({
  columns,
  data,
  isLoading,
  onSearch,
  pagination,
  actions
}: AdminTableProps<T>) {
  return (
    <div className="space-y-4">
      {onSearch && (
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Pesquisar..."
              className="pl-9 font-pixel text-[10px] uppercase pixel-border"
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon" className="pixel-border">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="pixel-border border-stone-dark/20 overflow-hidden bg-parchment/5">
        <Table>
          <TableHeader className="bg-stone-dark/5">
            <TableRow className="border-stone-dark/10">
              {columns.map((col, idx) => (
                <TableHead key={idx} className="font-pixel text-[9px] uppercase text-stone-dark">
                  {col.header}
                </TableHead>
              ))}
              {actions && <TableHead className="w-[50px]"></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <TableRow key={idx} className="animate-pulse border-stone-dark/5">
                  {columns.map((_, cIdx) => (
                    <TableCell key={cIdx}>
                      <div className="h-4 w-full bg-stone-dark/10 rounded" />
                    </TableCell>
                  ))}
                  {actions && <TableCell />}
                </TableRow>
              ))
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (actions ? 1 : 0)} className="h-32 text-center">
                  <p className="font-pixel text-[10px] uppercase text-muted-foreground">Nenhum registro encontrado.</p>
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, idx) => (
                <TableRow key={idx} className="border-stone-dark/5 hover:bg-stone-dark/5">
                  {columns.map((col, cIdx) => (
                    <TableCell key={cIdx} className="text-sm font-medium">
                      {col.cell ? col.cell(row) : (row[col.accessorKey as keyof T] as any)}
                    </TableCell>
                  ))}
                  {actions && (
                    <TableCell>
                      {actions(row)}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Mostrando <span className="font-bold">{data.length}</span> de <span className="font-bold">{pagination.totalCount}</span> registros
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 pixel-border"
              disabled={pagination.pageIndex === 0}
              onClick={() => pagination.onPageChange(pagination.pageIndex - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-pixel text-[10px] px-4">
              Página {pagination.pageIndex + 1}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 pixel-border"
              disabled={(pagination.pageIndex + 1) * pagination.pageSize >= pagination.totalCount}
              onClick={() => pagination.onPageChange(pagination.pageIndex + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}