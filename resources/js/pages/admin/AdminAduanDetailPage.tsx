import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Toolbar,
  ToolbarActions,
  ToolbarBreadcrumbs,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle,
} from '@/layouts/admin/components/toolbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  fetchAduan,
  updateAduanStatus,
  deleteAduan,
  resendWhatsapp,
} from '@/services/aduanApi';
import type { AduanStatus } from '@/types/aduan';
import { STATUS_VARIANT, STATUS_LABEL } from '@/lib/constants';
import {
  ArrowLeft,
  Loader2,
  MapPin,
  Phone,
  Mail,
  Calendar,
  User,
  Store,
  Cigarette,
  FileText,
  ImageIcon,
  Send,
  Trash2,
  RefreshCw,
} from 'lucide-react';

export function AdminAduanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [newStatus, setNewStatus] = useState<string>('');
  const [catatan, setCatatan] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data: aduan, isLoading } = useQuery({
    queryKey: ['aduan', id],
    queryFn: () => fetchAduan(Number(id)),
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      updateAduanStatus(Number(id), {
        status: newStatus,
        catatan_admin: catatan || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aduan', id] });
      queryClient.invalidateQueries({ queryKey: ['aduans'] });
      toast.success('Status berhasil diperbarui');
      setNewStatus('');
      setCatatan('');
    },
    onError: () => {
      toast.error('Gagal memperbarui status');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteAduan(Number(id)),
    onSuccess: () => {
      toast.success('Aduan berhasil dihapus');
      navigate('/admin/aduan');
    },
    onError: () => {
      toast.error('Gagal menghapus aduan');
    },
  });

  const waMutation = useMutation({
    mutationFn: () => resendWhatsapp(Number(id)),
    onSuccess: (data) => {
      toast.success(`WhatsApp ${data.whatsapp_status === 'sent' ? 'terkirim' : 'dikirim'}`);
      queryClient.invalidateQueries({ queryKey: ['aduan', id] });
    },
    onError: () => {
      toast.error('Gagal mengirim WhatsApp');
    },
  });

  if (isLoading) {
    return (
      <div className="container">
        <div className="space-y-4 pt-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-6 w-48" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </div>
    );
  }

  if (!aduan) {
    return (
      <div className="container py-12 text-center">
        <FileText className="size-12 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-lg font-semibold">Aduan tidak ditemukan</h2>
        <Button variant="outline" className="mt-4" asChild>
          <Link to="/admin/aduan">Kembali ke daftar</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`Detail Aduan ${aduan.ticket_number} — Pancen Jateng`}</title>
      </Helmet>

      <div className="container">
        <Toolbar>
          <ToolbarHeading>
            <ToolbarBreadcrumbs />
            <ToolbarPageTitle>{`Detail Aduan ${aduan.ticket_number}`}</ToolbarPageTitle>
            <ToolbarDescription>
              Informasi lengkap laporan pengaduan
            </ToolbarDescription>
          </ToolbarHeading>
          <ToolbarActions>
            <Button variant="outline" size="sm" asChild>
              <Link to="/admin/aduan">
                <ArrowLeft className="size-4" />
                Kembali
              </Link>
            </Button>
          </ToolbarActions>
        </Toolbar>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-5">
            {/* Status + Actions */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Status & Tindakan</CardTitle>
                  <Badge variant={STATUS_VARIANT[aduan.status] ?? 'secondary'}>
                    {STATUS_LABEL[aduan.status] ?? aduan.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-end gap-3">
                  <div className="w-40">
                    <label className="text-xs text-muted-foreground mb-1 block">
                      Update Status
                    </label>
                    <Select value={newStatus} onValueChange={setNewStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="baru">Baru</SelectItem>
                        <SelectItem value="diproses">Diproses</SelectItem>
                        <SelectItem value="selesai">Selesai</SelectItem>
                        <SelectItem value="ditolak">Ditolak</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <label className="text-xs text-muted-foreground mb-1 block">
                      Catatan Admin
                    </label>
                    <Textarea
                      placeholder="Catatan (opsional)"
                      value={catatan}
                      onChange={(e) => setCatatan(e.target.value)}
                      rows={2}
                    />
                  </div>
                  <Button
                    size="sm"
                    onClick={() => updateMutation.mutate()}
                    disabled={!newStatus || updateMutation.isPending}
                  >
                    {updateMutation.isPending ? (
                      <Loader2 className="size-4 animate-spin mr-1" />
                    ) : null}
                    Simpan
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Pelapor Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Informasi Pelapor</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <InfoRow icon={User} label="Nama" value={aduan.nama_pelapor} />
                <InfoRow icon={Mail} label="Email" value={aduan.email || '—'} />
                <InfoRow icon={Phone} label="Nomor WA" value={aduan.nomor_wa} />
                <InfoRow icon={Calendar} label="Tanggal Lapor" value={new Date(aduan.created_at).toLocaleString('id-ID')} />
              </CardContent>
            </Card>

            {/* Lokasi */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Lokasi Kejadian</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <InfoRow icon={MapPin} label="Alamat" value={aduan.lokasi_kejadian} />
                <InfoRow icon={MapPin} label="Kab/Kota" value={aduan.kabupaten_kota} />
                {aduan.latitude != null && aduan.longitude != null && (
                  <div className="text-sm text-muted-foreground">
                    Koordinat: {aduan.latitude}, {aduan.longitude}
                    {aduan.location_source && ` (sumber: ${aduan.location_source})`}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Detail Aduan */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Detail Pengaduan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <InfoRow icon={Store} label="Nama Toko" value={aduan.nama_toko || '—'} />
                <InfoRow icon={Cigarette} label="Jenis Rokok" value={aduan.jenis_rokok?.replace(/_/g, ' ') ?? '—'} />
                <InfoRow icon={Cigarette} label="Merk Rokok" value={aduan.merk_rokok || '—'} />
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Kronologi</div>
                  <div className="text-sm whitespace-pre-wrap bg-muted/50 p-3 rounded-lg">
                    {aduan.detail_aduan}
                  </div>
                </div>
                {aduan.catatan_admin && (
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Catatan Admin</div>
                    <div className="text-sm whitespace-pre-wrap bg-muted/50 p-3 rounded-lg border-l-2 border-primary">
                      {aduan.catatan_admin}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Photo */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Foto Bukti</CardTitle>
              </CardHeader>
              <CardContent>
                {aduan.foto_bukti ? (
                  <a href={aduan.foto_bukti} target="_blank" rel="noreferrer noopener">
                    <img
                      src={aduan.foto_bukti}
                      alt="Foto bukti"
                      className="w-full rounded-lg border border-border hover:opacity-90 transition-opacity"
                    />
                  </a>
                ) : (
                  <div className="text-center py-8 text-muted-foreground bg-muted/30 rounded-lg">
                    <ImageIcon className="size-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Tidak ada foto</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* WhatsApp */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">WhatsApp</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <span className="text-muted-foreground">Status: </span>
                  <Badge variant={aduan.whatsapp_status === 'sent' ? 'success' : 'secondary'} size="sm">
                    {aduan.whatsapp_status ?? '—'}
                  </Badge>
                </div>
                {aduan.whatsapp_sent_at && (
                  <div className="text-xs text-muted-foreground">
                    Dikirim: {new Date(aduan.whatsapp_sent_at).toLocaleString('id-ID')}
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => waMutation.mutate()}
                  disabled={waMutation.isPending}
                >
                  {waMutation.isPending ? (
                    <Loader2 className="size-4 animate-spin mr-1" />
                  ) : (
                    <RefreshCw className="size-4 mr-1" />
                  )}
                  Kirim Ulang WA
                </Button>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-destructive/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-destructive">Hapus Aduan</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-3">
                  Hapus permanen laporan ini. Tindakan ini tidak dapat dibatalkan.
                </p>
                <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                  <DialogTrigger asChild>
                    <Button variant="destructive" size="sm" className="w-full">
                      <Trash2 className="size-4 mr-1" />
                      Hapus
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Hapus Aduan?</DialogTitle>
                      <DialogDescription>
                        Anda akan menghapus aduan {aduan.ticket_number} dari {aduan.nama_pelapor}.
                        Tindakan ini tidak dapat dibatalkan.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setDeleteOpen(false)}>
                        Batal
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => deleteMutation.mutate()}
                        disabled={deleteMutation.isPending}
                      >
                        {deleteMutation.isPending ? (
                          <Loader2 className="size-4 animate-spin mr-1" />
                        ) : null}
                        Hapus
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof User;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="size-4 mt-0.5 text-muted-foreground shrink-0" />
      <div className="min-w-0">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-sm">{value}</div>
      </div>
    </div>
  );
}
