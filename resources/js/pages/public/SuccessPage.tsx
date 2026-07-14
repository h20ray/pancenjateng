import { Helmet } from 'react-helmet-async';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

export function SuccessPage() {
  const { ticket } = useParams<{ ticket: string }>();

  return (
    <>
      <Helmet>
        <title>Laporan Berhasil — Pancen Jateng</title>
      </Helmet>

      <div className="container py-8 max-w-lg">
        <Card>
          <CardHeader className="text-center">
            <CheckCircle className="size-12 text-green-500 mx-auto mb-2" />
            <CardTitle>Laporan Berhasil Dikirim</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Nomor tiket pengaduan Anda:
            </p>
            <p className="text-2xl font-mono font-bold">{ticket}</p>
            <p className="text-sm text-muted-foreground">
              Simpan nomor tiket ini untuk melacak status pengaduan Anda.
            </p>
            <div className="flex gap-3 justify-center pt-4">
              <Button variant="outline" asChild>
                <Link to="/lacak">Lacak Status</Link>
              </Button>
              <Button asChild>
                <Link to="/lapor">Lapor Lagi</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
