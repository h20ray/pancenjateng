import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import {
  Toolbar,
  ToolbarActions,
  ToolbarBreadcrumbs,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle,
} from '@/layouts/admin/components/toolbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchDashboardStats } from '@/services/aduanApi';
import type { Aduan } from '@/types/aduan';
import {
  FileText,
  TrendingUp,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMemo } from 'react';

const statusConfig: Record<string, { label: string; color: string; icon: typeof FileText }> = {
  baru: { label: 'Baru', color: 'text-blue-500 bg-blue-50 dark:bg-blue-950', icon: FileText },
  diproses: { label: 'Diproses', color: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-950', icon: Clock },
  selesai: { label: 'Selesai', color: 'text-green-500 bg-green-50 dark:bg-green-950', icon: CheckCircle2 },
  ditolak: { label: 'Ditolak', color: 'text-red-500 bg-red-50 dark:bg-red-950', icon: XCircle },
};

export function AdminDashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
  });

  const recentAduans = useMemo(() => stats?.terbaru ?? [], [stats]);

  return (
    <>
      <Helmet>
        <title>Dashboard — Pancen Jateng</title>
      </Helmet>

      <div className="container">
        <Toolbar>
          <ToolbarHeading>
            <ToolbarBreadcrumbs />
            <ToolbarPageTitle />
            <ToolbarDescription>
              Ringkasan data pengaduan rokok ilegal
            </ToolbarDescription>
          </ToolbarHeading>
          <ToolbarActions>
            <Button variant="outline" size="sm" asChild>
              <Link to="/admin/aduan">
                <FileText className="size-4" />
                Lihat Semua
              </Link>
            </Button>
          </ToolbarActions>
        </Toolbar>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatsCard
            title="Total Aduan"
            value={stats?.total}
            loading={isLoading}
            icon={FileText}
            color="text-blue-500 bg-blue-50 dark:bg-blue-950"
          />
          <StatsCard
            title="Hari Ini"
            value={stats?.hari_ini}
            loading={isLoading}
            icon={TrendingUp}
            color="text-green-500 bg-green-50 dark:bg-green-950"
          />
          <StatsCard
            title="Minggu Ini"
            value={stats?.minggu_ini}
            loading={isLoading}
            icon={Users}
            color="text-purple-500 bg-purple-50 dark:bg-purple-950"
          />
          <StatsCard
            title="Bulan Ini"
            value={stats?.bulan_ini}
            loading={isLoading}
            icon={TrendingUp}
            color="text-orange-500 bg-orange-50 dark:bg-orange-950"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Status Breakdown */}
          <Card className="lg:col-span-1">
            <CardContent className="p-5">
              <h3 className="text-sm font-medium text-muted-foreground mb-4">
                Status Pengaduan
              </h3>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-9 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {Object.entries(stats?.per_status ?? {}).map(([status, count]) => {
                    const config = statusConfig[status] ?? statusConfig.baru;
                    const Icon = config.icon;
                    const total = stats?.total ?? 1;
                    const pct = Math.round((count / total) * 100);
                    return (
                      <div
                        key={status}
                        className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-1.5 rounded-md ${config.color}`}>
                            <Icon className="size-3.5" />
                          </div>
                          <span className="text-sm font-medium">{config.label}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold">{count}</span>
                          <span className="text-xs text-muted-foreground w-8 text-right">
                            {pct}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Reports */}
          <Card className="lg:col-span-2">
            <CardContent className="p-5">
              <h3 className="text-sm font-medium text-muted-foreground mb-4">
                Laporan Terbaru
              </h3>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : recentAduans.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="size-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Belum ada laporan</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {recentAduans.map((aduan: Aduan) => (
                    <Link
                      key={aduan.id}
                      to={`/admin/aduan/${aduan.id}`}
                      className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xs font-mono text-muted-foreground shrink-0">
                          {aduan.ticket_number}
                        </span>
                        <span className="text-sm truncate">{aduan.nama_pelapor}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <StatusBadge status={aduan.status} />
                        <span className="text-xs text-muted-foreground">
                          {new Date(aduan.created_at).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

function StatsCard({
  title,
  value,
  loading,
  icon: Icon,
  color,
}: {
  title: string;
  value: number | undefined;
  loading: boolean;
  icon: typeof FileText;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-muted-foreground">{title}</div>
            {loading ? (
              <Skeleton className="h-8 w-16 mt-1" />
            ) : (
              <div className="text-2xl font-bold mt-1">{value ?? 0}</div>
            )}
          </div>
          <div className={`p-2.5 rounded-xl ${color}`}>
            <Icon className="size-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] ?? statusConfig.baru;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}
    >
      {config.label}
    </span>
  );
}
