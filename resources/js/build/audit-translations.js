/* global process */
/**
 * i18n translation key audit: find missing keys and dead keys.
 *
 * Usage:  node resources/js/build/audit-translations.js
 *
 * Output:
 *  1. Keys referenced in code but MISSING from en locale (bugs)
 *  2. Keys in en locale but NEVER referenced in code (dead keys — advisory)
 *  3. Dynamic keys that can't be statically verified (flagged for review)
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, "../../..");
const LANGUAGES_DIR = path.join(ROOT, "resources/js/languages");
const SEARCH_DIRS = [
    "resources/js/components",
    "resources/js/composables",
    "resources/js/stores",
    "resources/js/services",
    "resources/js/pages",
];

// ── 1. Build flat key index from all en/*.json files ────────────────────
function flattenObject(obj, prefix = "") {
    const keys = new Map(); // keyPath → value (for display)
    for (const [k, v] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${k}` : k;
        if (typeof v === "object" && v !== null && !Array.isArray(v)) {
            // Recurse into nested objects, but also register intermediate level
            // for $t('namespace.subkey') that might point to an object, not a string
            for (const [subK, subV] of flattenObject(v, fullKey)) {
                keys.set(subK, subV);
            }
        } else {
            keys.set(fullKey, typeof v === "string" ? v : JSON.stringify(v));
        }
    }
    return keys;
}

const enDir = path.join(LANGUAGES_DIR, "en");
if (!fs.existsSync(enDir)) {
    console.error(`❌ English translation directory not found: ${enDir}`);
    process.exit(1);
}
const enFiles = fs.readdirSync(enDir).filter(f => f.endsWith(".json"));
const enKeys = new Map(); // "namespace.leaf.key" → "English value"

for (const file of enFiles) {
    const namespace = file.replace(/\.json$/, "");
    const content = JSON.parse(fs.readFileSync(path.join(enDir, file), "utf8"));
    for (const [fullKey, value] of flattenObject(content, namespace)) {
        enKeys.set(fullKey, value);
    }
}

console.log(`🔑 Loaded ${enKeys.size} translation keys from ${enFiles.length} namespace files\n`);

// ── 2. Extract all $t() / t() calls from Vue, JS, and TS files ──────────
const allFiles = [];
for (const dir of SEARCH_DIRS) {
    const fullDir = path.join(ROOT, dir);
    if (!fs.existsSync(fullDir)) continue;
    
    function walk(currentDir) {
        const entries = fs.readdirSync(currentDir, { withFileTypes: true });
        for (const entry of entries) {
            const entryPath = path.join(currentDir, entry.name);
            if (entry.isDirectory()) {
                if (entry.name !== "node_modules" && entry.name !== "__tests__") {
                    walk(entryPath);
                }
            } else if (entry.isFile()) {
                const ext = path.extname(entry.name);
                if (ext === ".vue" || ext === ".js" || ext === ".ts") {
                    allFiles.push(entryPath);
                }
            }
        }
    }
    
    walk(fullDir);
}

const USAGE = []; // { file, line, fullCall, key, isDynamic }

for (const file of allFiles) {
    const content = fs.readFileSync(file, "utf8");
    const lines = content.split(/\r?\n/);

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineNum = i + 1;

        // Matches: $t('...'), $t("..."), t('...'), t("..."), this.$t('...'), this.$t("...")
        const regex = /(?:\$t|\.\$t|(?<!\w)t)\s*\(\s*(['"`])((?:(?!\1).|\\\1)*?)\1\s*[,)]/g;
        let match;
        while ((match = regex.exec(line)) !== null) {
            const keyExpr = match[2];
            // Skip non-translation uses of bare t() — must be inside a Vue/i18n context
            // For now, capture everything and filter later

            // Detect dynamic keys (contain +, ${ }, or variable references)
            const isDynamic = /[+$]/.test(keyExpr) || /\$\{/.test(keyExpr) || /^[a-zA-Z_]\w*$/.test(keyExpr);

            let resolvedKey = keyExpr;
            if (isDynamic) {
                resolvedKey = null; // can't statically resolve
            }

            USAGE.push({
                file: path.relative(ROOT, file),
                line: lineNum,
                keyExpr: keyExpr,
                resolvedKey,
                isDynamic,
            });
        }
    }
}

console.log(`📝 Found ${USAGE.length} translation key references in ${allFiles.length} files\n`);

// ── 3. Cross-reference ────────────────────────────────────────────────────
const staticCalls = USAGE.filter(u => !u.isDynamic);
const dynamicCalls = USAGE.filter(u => u.isDynamic);

// Group static calls by resolved key
const staticByKey = new Map();
for (const call of staticCalls) {
    if (!staticByKey.has(call.resolvedKey)) {
        staticByKey.set(call.resolvedKey, []);
    }
    staticByKey.get(call.resolvedKey).push(call);
}

// Missing: key used in code but NOT in en.json
const missing = [];
for (const [key, calls] of staticByKey) {
    if (!enKeys.has(key)) {
        missing.push({ key, calls });
    }
}

// Possible near-misses: keys that differ only by prefix/namespace assignment
function findSimilarKeys(key, allKeys, maxDist = 2) {
    const parts = key.split(".");
    const results = [];
    for (const ek of allKeys) {
        const eparts = ek.split(".");
        // Check if swapping first segment helps
        if (parts.length >= 2 && eparts.length >= 2) {
            const rest = parts.slice(1).join(".");
            const erest = eparts.slice(1).join(".");
            if (rest === erest && parts[0] !== eparts[0]) {
                results.push(`→ ${ek} (namespace: ${parts[0]} → ${eparts[0]})`);
            }
        }
        // Check Levenshtein on the full key
        if (Math.abs(ek.length - key.length) <= 3) {
            const dist = levenshtein(key, ek);
            if (dist > 0 && dist <= maxDist) {
                results.push(`~ ${ek} (edit distance: ${dist})`);
            }
        }
    }
    return [...new Set(results)].slice(0, 5);
}

function levenshtein(a, b) {
    const m = a.length, n = b.length;
    const dp = Array.from({ length: m + 1 }, (_, i) => [i]);
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            dp[i][j] = Math.min(
                dp[i - 1][j] + 1,
                dp[i][j - 1] + 1,
                dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
            );
        }
    }
    return dp[m][n];
}

// Dead keys: keys in en.json that are NEVER used in code
const DYNAMIC_ONLY_NAMESPACES = new Set(["cog_help"]);
const usedStaticKeys = new Set(staticCalls.map(c => c.resolvedKey));
const deadKeys = [];
for (const [key, value] of enKeys) {
    if (DYNAMIC_ONLY_NAMESPACES.has(key.split(".")[0])) continue;
    if (!usedStaticKeys.has(key)) {
        deadKeys.push({ key, value });
    }
}

// ── 4. Output ────────────────────────────────────────────────────────────

// MISSING KEYS
console.log("=".repeat(80));
console.log("❌ MISSING KEYS (used in code, not in en locale)");
console.log("=".repeat(80));
console.log(`Total: ${missing.length} unique missing keys\n`);

if (missing.length === 0) {
    console.log("  None found! 🎉\n");
} else {
    for (const { key, calls } of missing.sort((a, b) => b.calls.length - a.calls.length)) {
        console.log(`  "${key}" — ${calls.length} reference(s)`);
        for (const call of calls.slice(0, 5)) {
            console.log(`    ${call.file}:${call.line}  →  $t('${call.keyExpr}')`);
        }
        if (calls.length > 5) {
            console.log(`    ... and ${calls.length - 5} more`);
        }

        // Suggest near-misses
        const similar = findSimilarKeys(key, enKeys.keys());
        if (similar.length > 0) {
            console.log(`    Similar keys in en locale:`);
            for (const s of similar) console.log(`      ${s}`);
        }
        console.log();
    }
}

// DYNAMIC KEYS
console.log("=".repeat(80));
console.log("🔍 DYNAMIC KEYS (can't statically verify — manual review needed)");
console.log("=".repeat(80));
console.log(`Total: ${dynamicCalls.length} dynamic references\n`);

// Group dynamic calls by pattern
const dynamicPatterns = new Map();
for (const call of dynamicCalls) {
    const pattern = call.keyExpr.replace(/['"]/g, "").replace(/\s+/g, " ");
    if (!dynamicPatterns.has(pattern)) {
        dynamicPatterns.set(pattern, []);
    }
    dynamicPatterns.get(pattern).push(call);
}

// Show most common patterns
const sortedPatterns = [...dynamicPatterns.entries()]
    .sort((a, b) => b[1].length - a[1].length);

for (const [pattern, calls] of sortedPatterns.slice(0, 30)) {
    console.log(`  "${pattern}" — ${calls.length} reference(s)`);
    // Show up to 3 distinct files
    const files = [...new Set(calls.map(c => c.file))].slice(0, 3);
    for (const f of files) {
        console.log(`    ${f}`);
    }
}
if (sortedPatterns.length > 30) {
    console.log(`  ... and ${sortedPatterns.length - 30} more patterns`);
}
console.log();

// DEAD KEYS (summary)
console.log("=".repeat(80));
console.log("💤 DEAD KEYS (in en locale, never referenced in code)");
console.log("=".repeat(80));
console.log(`Total: ${deadKeys.length} potentially unused keys\n`);

// Group dead keys by namespace
const deadByNamespace = new Map();
for (const { key } of deadKeys) {
    const ns = key.split(".")[0];
    if (!deadByNamespace.has(ns)) deadByNamespace.set(ns, []);
    deadByNamespace.get(ns).push(key);
}

for (const [ns, keys] of [...deadByNamespace.entries()].sort((a, b) => b[1].length - a[1].length)) {
    console.log(`  ${ns}: ${keys.length} dead keys`);
    if (keys.length <= 15) {
        for (const k of keys) console.log(`    - ${k}`);
    } else {
        for (const k of keys.slice(0, 10)) console.log(`    - ${k}`);
        console.log(`    ... and ${keys.length - 10} more`);
    }
}

console.log("\n✅ Audit complete.");
