# Currency formatting and phone number normalization

**Status:** Active guardrail

---

## Rule 1: Currency number formatting

Any field or display that shows a monetary/currency value must respect the three site settings configured at `/admin/settings/site`:

| Setting | Field | Example |
|---|---|---|
| Digit After Decimal Point | `site_digit_after_decimal_point` | `2` → `0.00` |
| Currency Thousand Separator | `site_currency_thousand_separator` | `.` or `,` |
| Currency Decimal Separator | `site_currency_decimal_separator` | `,` or `.` |

### Applies to

- Product prices
- Order totals, subtotals, tax amounts
- POS cart amounts and change
- Report figures (sales, revenue, HPP, finance)
- Invoice/receipt amounts
- Any numeric display representing money

### Currency symbol

Always use the **default currency** configured at `/admin/settings/site` (`site_default_currency`), which references the currency list at `/admin/settings/currencies/list`. The symbol and name come from that record — never hardcode `Rp`, `IDR`, `$`, or any other currency string.

For example, if the default currency in the DB is IDR with symbol `Rp`, use that symbol from the currency record. Do not decide between `Rp` vs `IDR` yourself — always read from the configured default currency's `symbol` field.

### Implementation

Use the existing `currencyFormat` utility for **display-only** values — never hardcode number formatting or rely on browser locale defaults. The utility reads the site settings and formats accordingly.

### Live-formatted currency inputs (calculator-style)

For input fields where the user types a currency amount, format the number **live as they type** with the thousand separator (like a calculator display: type `5000` → shows `5.000`).

**CRITICAL: Do NOT use the shadcn `<Input>` component for live-formatted fields.** The shadcn `Input` uses `defineModel` internally which creates its own `v-model` binding. Passing `:value` + `@input` from outside conflicts with the internal `v-model` — the formatted value gets overwritten by the raw keystroke. Use a native `<input>` with the same Tailwind classes instead.

**Pattern:**

```vue
<!-- Template: native <input> with :value + @input -->
<input
    :value="formattedValue"
    :class="['flex h-10 w-full rounded-ui border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/20', errors.field ? 'invalid' : '']"
    type="text"
    inputmode="numeric"
    @input="onFieldInput"
/>
```

```js
// Computed: reads raw digits from form, returns formatted string
computed: {
    thousandSeparator() {
        const setting = frontendSetting();
        return setting.site_currency_thousand_separator || ".";
    },
    formattedValue() {
        return this.formatNumberWithSeparator(this.form.field);
    },
},
methods: {
    formatNumberWithSeparator(value) {
        if (value === null || value === undefined || value === "") return "";
        const num = String(value).replace(/[^\d]/g, "");
        if (!num) return "";
        return num.replace(/\B(?=(\d{3})+(?!\d))/g, this.thousandSeparator);
    },
    parseRawNumber(formatted) {
        if (!formatted) return null;
        const sep = this.thousandSeparator.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        return String(formatted).replace(new RegExp(sep, "g"), "");
    },
    onFieldInput(e) {
        const raw = String(e.target.value).replace(/[^\d]/g, "");
        this.form.field = raw || null;
        this.$nextTick(() => {
            const len = e.target.value.length;
            e.target.setSelectionRange(len, len);
        });
    },
},
```

**On save:** always strip separators before sending to the API:
```js
const payload = {
    ...this.form,
    field: this.parseRawNumber(this.form.field),
};
```

**Do not:**
- Hardcode decimal places (e.g., `.toFixed(2)`)
- Hardcode separators (e.g., `toLocaleString('id-ID')`)
- Use raw numbers without formatting in currency contexts
- Hardcode currency symbols (e.g., `"Rp"`, `"IDR"`, `"$"`) — always read from the default currency record
- Use shadcn `<Input>` with `:value` + `@input` — it conflicts with internal `defineModel`

---

## Rule 2: Phone number country code normalization

When displaying or processing any phone number, always replace the leading `0` with the Country Code configured at `/admin/settings/company` (`company_country_code`).

### Logic (same as `/pegawhy` login)

1. Fetch `company_country_code` from frontend settings
2. Use the country code store to get the `calling_code` (e.g., `+62`)
3. If the phone number starts with `0`, strip the leading zero and prepend the calling code

```js
// Example: company calling_code = "+62", phone = "081234567890"
const digits = phone.replace(/[\s\-().+]/g, "");
const normalized = digits.startsWith("0") ? digits.substring(1) : digits;
const fullPhone = callingCode + normalized;
// Result: "+6281234567890"
```

### Applies to

- Customer phone display
- Employee/staff phone display
- WhatsApp links
- SMS sending
- Delivery contact numbers
- Order detail phone fields
- Any phone number shown to users or sent to external services

### Reference implementation

- `resources/js/components/frontend/auth/LoginComponent.vue` — the `/pegawhy` staff login page
- `resources/js/stores/useFrontendCountryCodeStore.js` — country code store
- `fetchFrontendSetting()` → `company_country_code` field

### Do not

- Display raw `0`-prefixed phone numbers to users
- Send `0`-prefixed numbers to external APIs (WhatsApp, SMS gateways)
- Hardcode a country code (e.g., `+62`) — always read from company settings
