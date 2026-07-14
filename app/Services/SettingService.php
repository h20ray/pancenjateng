<?php

namespace App\Services;

use App\Models\Setting;

class SettingService
{
    public function all(): array
    {
        return Setting::pluck('value', 'key')->toArray();
    }

    public function update(array $data): void
    {
        $rows = array_map(
            fn (string $key, $value) => ['key' => $key, 'value' => $value],
            array_keys($data),
            $data,
        );

        Setting::upsert($rows, ['key'], ['value']);
    }
}
