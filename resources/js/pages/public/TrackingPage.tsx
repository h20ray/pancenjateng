import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Loader2, MapPin, Calendar } from 'lucide-react';
import api from '@/services/api';
import { STATUS_VARIANT, STATUS_LABEL } from '@/lib/constants';

interface TrackResult {
  ticket_number: string;
  status: string;
  kabupaten_kota: string;
  jenis_rokok: string;
  created_at: string;
  updated_at: string;
}

export function TrackingPage() {
  const [ticket, setTicket] = useState('');
  const [phone, setPhone] = useState('');
  const [result, setResult] = useState<TrackResult | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setNotFound(false);
    setResult(null);

    if (!ticket.trim() || !phone.trim()) {
      setError('Mohon isi nomor tiket dan nomor WhatsApp.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.get('/aduan/track', {
        params: { ticket: ticket.trim(), phone: phone.trim() },
      });
      setResult(data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setNotFound(true);
      } else {
        setError('Terjadi kesalahan. Silakan coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Lacak Aduan — Pancen Jateng</title>
      </Helmet>

      <div className="container py-8 max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Lacak Pengaduan</h1>
          <p className="text-muted-foreground mt-2">
            Masukkan nomor tiket dan nomor WhatsApp yang digunakan saat melapor
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Cek Status</CardTitle>
            <CardDescription>
              Gunakan nomor tiket yang Anda terima setelah mengirim laporan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ticket">Nomor Tiket</Label>
                <Input
                  id="ticket"
                  placeholder="Contoh: ADN-20260101-0001"
                  value={ticket}
                  onChange={(e) => setTicket(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Nomor WhatsApp</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Contoh: 081234567890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              {error && (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                  {error}
                </div>
              )}
              {notFound && (
                <div className="text-sm bg-muted p-4 rounded-md text-center">
                  <p className="font-medium">Laporan tidak ditemukan</p>
                  <p className="text-muted-foreground mt-1">
                    Periksa kembali nomor tiket dan nomor WhatsApp Anda.
                  </p>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin mr-2" />
                    Mencari...
                  </>
                ) : (
                  <>
                    <Search className="size-4 mr-2" />
                    Lacak
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Result */}
        {result && (
          <Card className="mt-6">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-mono font-bold text-lg">{result.ticket_number}</h3>
                <Badge variant={STATUS_VARIANT[result.status as keyof typeof STATUS_VARIANT] ?? 'secondary'}>
                  {STATUS_LABEL[result.status as keyof typeof STATUS_LABEL] ?? result.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-start gap-2">
                  <MapPin className="size-4 mt-0.5 text-muted-foreground shrink-0" />
                  <div>
                    <div className="text-xs text-muted-foreground">Kab/Kota</div>
                    <div>{result.kabupaten_kota}</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Calendar className="size-4 mt-0.5 text-muted-foreground shrink-0" />
                  <div>
                    <div className="text-xs text-muted-foreground">Dilaporkan</div>
                    <div>{new Date(result.created_at).toLocaleDateString('id-ID')}</div>
                  </div>
                </div>
              </div>

              <div className="text-sm">
                <span className="text-muted-foreground">Jenis Rokok: </span>
                <span className="capitalize">{result.jenis_rokok?.replace(/_/g, ' ')}</span>
              </div>

              {result.updated_at !== result.created_at && (
                <div className="text-xs text-muted-foreground">
                  Terakhir diperbarui: {new Date(result.updated_at).toLocaleString('id-ID')}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
