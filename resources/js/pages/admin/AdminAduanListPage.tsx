import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  Toolbar,
  ToolbarActions,
  ToolbarBreadcrumbs,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle,
} from '@/layouts/admin/components/toolbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { fetchAduans, exportCsvSafe } from '@/services/aduanApi';
import type { AduanFilters } from '@/types/aduan';
import { STATUS_VARIANT, STATUS_LABEL, JENIS_ROKOK_FILTER_OPTIONS } from '@/lib/constants';
import {
  Download,
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';

export function AdminAduanListPage() {
  const [filters, setFilters] = useState<AduanFilters>({
    per_page: 15,
    page: 1,
  });
  const [searchInput, setSearchInput] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['aduans', filters],
    queryFn: () => fetchAduans(filters),
  });

  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, search: searchInput || undefined, page: 1 }));
  };

  const handleExport = async () => {
    const result = await exportCsvSafe(filters);
    if (!result.success) {
      toast.error(result.error ?? 'Gagal mengekspor data CSV.');
    }
  };

  return (
    <>
      <Helmet>
        <title>Daftar Pengaduan — Pancen Jateng</title>
      </Helmet>

      <div className="container">
        <Toolbar>
          <ToolbarHeading>
            <ToolbarBreadcrumbs />
            <ToolbarPageTitle />
            <ToolbarDescription>
              Kelola dan tindak lanjuti laporan pengaduan
            </ToolbarDescription>
          </ToolbarHeading>
          <ToolbarActions>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="size-4" />
              Export CSV
            </Button>
          </ToolbarActions>
        </Toolbar>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div className="flex items-center gap-2 flex-1 min-w-[200px] max-w-sm">
            <Input
              placeholder="Cari tiket atau nama..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button variant="ghost" mode="icon" size="sm" onClick={handleSearch}>
              <Search className="size-4" />
            </Button>
          </div>

          <Select
            value={filters.status ?? ''}
            onValueChange={(v) => setFilters((prev) => ({ ...prev, status: v || undefined, page: 1 }))}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Semua Status</SelectItem>
              <SelectItem value="baru">Baru</SelectItem>
              <SelectItem value="diproses">Diproses</SelectItem>
              <SelectItem value="selesai">Selesai</SelectItem>
              <SelectItem value="ditolak">Ditolak</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.jenis_rokok ?? ''}
            onValueChange={(v) => setFilters((prev) => ({ ...prev, jenis_rokok: v || undefined, page: 1 }))}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Jenis Rokok" />
            </SelectTrigger>
            <SelectContent>
              {JENIS_ROKOK_FILTER_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">No Tiket</TableHead>
                <TableHead>Pelapor</TableHead>
                <TableHead>Kab/Kota</TableHead>
                <TableHead>Jenis Rokok</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : data?.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    <FileText className="size-8 mx-auto mb-2 opacity-50" />
                    <p>Tidak ada data pengaduan</p>
                  </TableCell>
                </TableRow>
              ) : (
                data?.data.map((aduan) => (
                  <TableRow key={aduan.id}>
                    <TableCell className="font-mono text-xs">
                      {aduan.ticket_number}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{aduan.nama_pelapor}</span>
                        <span className="text-xs text-muted-foreground">{aduan.nomor_wa}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{aduan.kabupaten_kota}</TableCell>
                    <TableCell className="text-sm capitalize">
                      {aduan.jenis_rokok?.replace(/_/g, ' ') ?? '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[aduan.status] ?? 'secondary'} size="sm">
                        {STATUS_LABEL[aduan.status] ?? aduan.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(aduan.created_at).toLocaleDateString('id-ID')}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" mode="icon" size="sm" asChild>
                        <Link to={`/admin/aduan/${aduan.id}`}>
                          <Eye className="size-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {data && data.last_page > 1 && (
          <div className="flex items-center justify-between mt-4">
            <span className="text-sm text-muted-foreground">
              {data.total} total · Halaman {data.current_page} dari {data.last_page}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={data.current_page <= 1}
                onClick={() => setFilters((prev) => ({ ...prev, page: data.current_page - 1 }))}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={data.current_page >= data.last_page}
                onClick={() => setFilters((prev) => ({ ...prev, page: data.current_page + 1 }))}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
