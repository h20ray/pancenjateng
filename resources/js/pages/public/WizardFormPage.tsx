import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { useMutation, useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { fetchKabupatenKota } from '@/services/aduanApi';
import {
  ChevronRight,
  ChevronLeft,
  Check,
  User,
  MapPin,
  FileText,
  Loader2,
} from 'lucide-react';

const formSchema = z.object({
  nama_pelapor: z.string().min(3, 'Nama minimal 3 karakter').max(100),
  email: z.string().email('Email tidak valid').or(z.literal('')).optional(),
  nomor_wa: z.string().regex(/^(08|62)\d{8,12}$/, 'Nomor WA harus dimulai 08 atau 62'),
  jenis_rokok: z.enum(['sigaret_mesin', 'sigaret_tangan', 'tembakau_iris', 'cerutu', 'lainnya']),
  kabupaten_kota: z.string().min(1, 'Pilih kabupaten/kota'),
  lokasi_kejadian: z.string().min(10, 'Lokasi minimal 10 karakter'),
  nama_toko: z.string().min(3, 'Nama toko minimal 3 karakter').max(150),
  merk_rokok: z.string().min(2, 'Merk minimal 2 karakter').max(150),
  detail_aduan: z.string().min(20, 'Detail minimal 20 karakter'),
});

type FormData = z.infer<typeof formSchema>;

const jenisRokokOptions = [
  { value: 'sigaret_mesin', label: 'Sigaret Mesin (SKM/SPM)' },
  { value: 'sigaret_tangan', label: 'Sigaret Tangan (SKT)' },
  { value: 'tembakau_iris', label: 'Tembakau Iris' },
  { value: 'cerutu', label: 'Cerutu' },
  { value: 'lainnya', label: 'Lainnya' },
];

const TOTAL_STEPS = 3;

export function WizardFormPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);

  const { data: kabupatenList } = useQuery({
    queryKey: ['kabupaten-kota'],
    queryFn: fetchKabupatenKota,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nama_pelapor: '',
      email: '',
      nomor_wa: '',
      jenis_rokok: 'sigaret_mesin',
      kabupaten_kota: '',
      lokasi_kejadian: '',
      nama_toko: '',
      merk_rokok: '',
      detail_aduan: '',
    },
    mode: 'onTouched',
  });

  const { errors } = form.formState;

  const submitMutation = useMutation({
    mutationFn: async (data: FormData) => {
      // Upload photo first if present
      let fotoPath: string | undefined;
      if (fotoFile) {
        const formData = new FormData();
        formData.append('file', fotoFile);
        const uploadRes = await api.post('/aduan/upload', formData);
        fotoPath = uploadRes.data.path;
      }

      const res = await api.post('/aduan', {
        ...data,
        email: data.email || null,
        foto_bukti: fotoPath || null,
        latitude: null,
        longitude: null,
        location_source: 'manual',
      });
      return res.data;
    },
    onSuccess: (data) => {
      navigate(`/lapor/berhasil/${data.ticket_number}`);
    },
    onError: (err: any) => {
      if (err.response?.status === 409) {
        toast.error('Laporan serupa sudah dikirim dalam 5 menit terakhir.');
      } else {
        toast.error('Gagal mengirim laporan. Silakan coba lagi.');
      }
    },
  });

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Ukuran foto maksimal 2MB');
      return;
    }
    // Revoke previous blob URL to prevent memory leaks
    if (fotoPreview) {
      URL.revokeObjectURL(fotoPreview);
    }
    setFotoFile(file);
    setFotoPreview(URL.createObjectURL(file));
  };

  // Revoke blob URL on unmount
  useEffect(() => {
    return () => {
      if (fotoPreview) {
        URL.revokeObjectURL(fotoPreview);
      }
    };
  }, [fotoPreview]);

  const canNext = () => {
    if (step === 1) {
      return !!form.getValues('nama_pelapor') && !!form.getValues('nomor_wa');
    }
    if (step === 2) {
      return !!form.getValues('lokasi_kejadian') && !!form.getValues('kabupaten_kota');
    }
    return true;
  };

  const onSubmit = form.handleSubmit((data) => {
    submitMutation.mutate(data);
  });

  return (
    <>
      <Helmet>
        <title>Lapor Rokok Ilegal — Pancen Jateng</title>
      </Helmet>

      <div className="container py-8 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Form Pengaduan Rokok Ilegal</h1>
          <p className="text-muted-foreground mt-2">
            Laporkan peredaran rokok ilegal di wilayah Anda
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`size-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  s <= step
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {s < step ? <Check className="size-4" /> : s}
              </div>
              {s < TOTAL_STEPS && (
                <div
                  className={`w-12 h-0.5 transition-colors ${
                    s < step ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <Card>
          <CardContent className="p-6">
            <form onSubmit={onSubmit}>
              {/* Step 1: Identitas */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <User className="size-5 text-primary" />
                    <h2 className="font-semibold">Identitas Pelapor</h2>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nama_pelapor">Nama Lengkap *</Label>
                    <Input
                      id="nama_pelapor"
                      placeholder="Masukkan nama lengkap"
                      {...form.register('nama_pelapor')}
                    />
                    {errors.nama_pelapor && (
                      <p className="text-xs text-destructive">{errors.nama_pelapor.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@example.com (opsional)"
                      {...form.register('email')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nomor_wa">Nomor WhatsApp *</Label>
                    <Input
                      id="nomor_wa"
                      placeholder="08xxxxxxxxxx"
                      {...form.register('nomor_wa')}
                    />
                    {errors.nomor_wa && (
                      <p className="text-xs text-destructive">{errors.nomor_wa.message}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Lokasi */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="size-5 text-primary" />
                    <h2 className="font-semibold">Lokasi & Toko</h2>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="kabupaten_kota">Kabupaten/Kota *</Label>
                    <Select
                      value={form.watch('kabupaten_kota')}
                      onValueChange={(v) => form.setValue('kabupaten_kota', v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kabupaten/kota" />
                      </SelectTrigger>
                      <SelectContent>
                        {(kabupatenList ?? []).map((kab) => (
                          <SelectItem key={kab} value={kab}>
                            {kab}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.kabupaten_kota && (
                      <p className="text-xs text-destructive">{errors.kabupaten_kota.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lokasi_kejadian">Lokasi Kejadian *</Label>
                    <Textarea
                      id="lokasi_kejadian"
                      placeholder="Alamat lengkap lokasi penjualan"
                      rows={3}
                      {...form.register('lokasi_kejadian')}
                    />
                    {errors.lokasi_kejadian && (
                      <p className="text-xs text-destructive">{errors.lokasi_kejadian.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nama_toko">Nama Toko/Warung *</Label>
                    <Input
                      id="nama_toko"
                      placeholder="Nama toko atau warung"
                      {...form.register('nama_toko')}
                    />
                    {errors.nama_toko && (
                      <p className="text-xs text-destructive">{errors.nama_toko.message}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: Detail + Konfirmasi */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="size-5 text-primary" />
                    <h2 className="font-semibold">Detail & Konfirmasi</h2>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="jenis_rokok">Jenis Rokok *</Label>
                    <Select
                      value={form.watch('jenis_rokok')}
                      onValueChange={(v) => form.setValue('jenis_rokok', v as FormData['jenis_rokok'])}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {jenisRokokOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="merk_rokok">Merk Rokok *</Label>
                    <Input
                      id="merk_rokok"
                      placeholder="Merk rokok yang dijual"
                      {...form.register('merk_rokok')}
                    />
                    {errors.merk_rokok && (
                      <p className="text-xs text-destructive">{errors.merk_rokok.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="detail_aduan">Kronologi/Detail *</Label>
                    <Textarea
                      id="detail_aduan"
                      placeholder="Ceritakan kronologi dan detail informasi yang Anda ketahui (min. 20 karakter)"
                      rows={4}
                      {...form.register('detail_aduan')}
                    />
                    {errors.detail_aduan && (
                      <p className="text-xs text-destructive">{errors.detail_aduan.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Foto Bukti (opsional)</Label>
                    <Input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFotoChange}
                    />
                    {fotoPreview && (
                      <img
                        src={fotoPreview}
                        alt="Preview"
                        className="mt-2 max-h-48 rounded-lg border"
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between mt-8 pt-4 border-t">
                {step > 1 ? (
                  <Button type="button" variant="outline" onClick={() => setStep(step - 1)}>
                    <ChevronLeft className="size-4 mr-1" />
                    Sebelumnya
                  </Button>
                ) : (
                  <div />
                )}

                {step < TOTAL_STEPS ? (
                  <Button type="button" onClick={() => setStep(step + 1)} disabled={!canNext()}>
                    Selanjutnya
                    <ChevronRight className="size-4 ml-1" />
                  </Button>
                ) : (
                  <Button type="submit" disabled={submitMutation.isPending}>
                    {submitMutation.isPending ? (
                      <>
                        <Loader2 className="size-4 animate-spin mr-1" />
                        Mengirim...
                      </>
                    ) : (
                      <>
                        <Check className="size-4 mr-1" />
                        Kirim Laporan
                      </>
                    )}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
