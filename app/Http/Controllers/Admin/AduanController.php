<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\AduanUpdateStatusRequest;
use App\Http\Resources\AduanDetailResource;
use App\Models\Aduan;
use App\Services\WhatsappService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AduanController extends Controller
{
    private function applyFilters($query, Request $request): void
    {
        if ($request->status) {
            $query->where('status', $request->status);
        }
        if ($request->kabupaten) {
            $query->where('kabupaten_kota', $request->kabupaten);
        }
        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('ticket_number', 'like', "%{$request->search}%")
                    ->orWhere('nama_pelapor', 'like', "%{$request->search}%");
            });
        }
        if ($request->jenis_rokok) {
            $query->where('jenis_rokok', $request->jenis_rokok);
        }
    }

    public function index(Request $request): JsonResponse
    {
        $query = Aduan::query();

        $this->applyFilters($query, $request);

        $aduans = $query->orderByDesc('created_at')->paginate($request->per_page ?? 15);

        return response()->json($aduans);
    }

    public function show(Aduan $aduan): JsonResponse
    {
        return response()->json(new AduanDetailResource($aduan));
    }

    public function updateStatus(AduanUpdateStatusRequest $request, Aduan $aduan): JsonResponse
    {
        $aduan->update($request->validated());

        return response()->json(new AduanDetailResource($aduan));
    }

    public function destroy(Aduan $aduan): JsonResponse
    {
        $aduan->delete();

        return response()->json(['message' => 'Aduan dihapus.']);
    }

    public function export(Request $request): StreamedResponse
    {
        $query = Aduan::query();

        $this->applyFilters($query, $request);

        $aduans = $query->orderByDesc('created_at')->get();

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="laporan-rokok-ilegal-'.now()->format('Y-m-d-His').'.csv"',
        ];

        return response()->stream(function () use ($aduans) {
            $handle = fopen('php://output', 'w');

            try {
                fprintf($handle, chr(0xEF).chr(0xBB).chr(0xBF));

                fputcsv($handle, [
                    'No Tiket',
                    'Status',
                    'Nama Pelapor',
                    'Email',
                    'Nomor WA',
                    'Kabupaten/Kota',
                    'Lokasi Kejadian',
                    'Latitude',
                    'Longitude',
                    'Sumber Lokasi',
                    'Nama Toko',
                    'Jenis Rokok',
                    'Merk Rokok',
                    'Detail Aduan',
                    'Catatan Admin',
                    'Status WA',
                    'Tanggal Laporan',
                ]);

                foreach ($aduans as $aduan) {
                    fputcsv($handle, [
                        $aduan->ticket_number,
                        $aduan->status,
                        $aduan->nama_pelapor,
                        $aduan->email,
                        $aduan->nomor_wa,
                        $aduan->kabupaten_kota,
                        $aduan->lokasi_kejadian,
                        $aduan->latitude,
                        $aduan->longitude,
                        $aduan->location_source,
                        $aduan->nama_toko,
                        $aduan->jenis_rokok,
                        $aduan->merk_rokok,
                        $aduan->detail_aduan,
                        $aduan->catatan_admin,
                        $aduan->whatsapp_status,
                        $aduan->created_at->format('Y-m-d H:i:s'),
                    ]);
                }
            } finally {
                fclose($handle);
            }
        }, 200, $headers);
    }

    public function resendWhatsapp(Aduan $aduan, WhatsappService $whatsappService): JsonResponse
    {
        $whatsappService->sendRecap($aduan);

        return response()->json([
            'message' => 'WhatsApp sent request fired.',
            'whatsapp_status' => $aduan->whatsapp_status,
            'whatsapp_sent_at' => $aduan->whatsapp_sent_at ? $aduan->whatsapp_sent_at->toIso8601String() : null,
        ]);
    }
}
