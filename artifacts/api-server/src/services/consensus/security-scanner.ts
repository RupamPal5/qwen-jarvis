/**
 * Zero-trust pre-flight scanner for destructive or privileged operations.
 * Runs before and after Checker AI review as a deterministic safety layer.
 */

const DESTRUCTIVE_PATTERNS: { pattern: RegExp; flag: string }[] = [
  { pattern: /\brm\s+(-[a-zA-Z]*r[a-zA-Z]*\s+|-[a-zA-Z]*f[a-zA-Z]*\s+)*\/\s*/i, flag: "RM_ROOT" },
  { pattern: /\brm\s+(-[a-zA-Z]*r[a-zA-Z]*\s+|-[a-zA-Z]*f[a-zA-Z]*\s+)+/i, flag: "RM_RECURSIVE" },
  { pattern: /\b(format\s+[a-z]:|del\s+\/[sf])/i, flag: "WINDOWS_DESTROY" },
  { pattern: /\b(drop\s+(table|database|schema)|truncate\s+table)/i, flag: "SQL_DESTROY" },
  { pattern: /\b(shutdown\s+-[fr]|init\s+0|systemctl\s+(stop|disable)\s+)/i, flag: "SYSTEM_SHUTDOWN" },
  { pattern: /\b(chmod\s+777\s+\/|chown\s+.*\s+\/)/i, flag: "PERMISSION_ESCALATION" },
  { pattern: /\b(mkfs\.|dd\s+if=.*of=\/dev\/)/i, flag: "DISK_WIPE" },
  { pattern: /\b(curl\s+.*\|\s*(ba)?sh|wget\s+.*\|\s*(ba)?sh)/i, flag: "PIPE_TO_SHELL" },
  { pattern: /\b(eval\s*\(|Function\s*\(|child_process\.(exec|spawn))/i, flag: "DYNAMIC_EXEC" },
  { pattern: /\b(fs\.(unlink|rm|writeFile|appendFile|mkdir|rename)|writeFileSync)/i, flag: "FS_MUTATION" },
  { pattern: /\b(os\.remove|os\.unlink|subprocess\.(call|Popen))/i, flag: "OS_MUTATION" },
  { pattern: /\b(executeTrade|placeOrder|marketBuy|marketSell)/i, flag: "TRADING_EXEC" },
  { pattern: /:\(\)\s*\{\s*:\|:\s*&\s*\}\s*;\s*:/, flag: "FORK_BOMB" },
  { pattern: /\bsudo\s+(rm|dd|mkfs|chmod|chown)/i, flag: "SUDO_DESTRUCTIVE" },
];

const STATE_ALTERING_PATTERNS: { pattern: RegExp; category: string }[] = [
  { pattern: /\b(rm|del|unlink|remove|delete|truncate|drop)\b/i, category: "FILE_OR_DATA_DELETE" },
  { pattern: /\b(writeFile|appendFile|createWriteStream|fs\.write|open\s*\(.*['"]w)/i, category: "FILE_WRITE" },
  { pattern: /\b(mv|move|rename|cp\s+.*\s+)/i, category: "FILE_MOVE" },
  { pattern: /\b(npm\s+install|pnpm\s+add|pip\s+install|apt\s+install)/i, category: "PACKAGE_INSTALL" },
  { pattern: /\b(git\s+(push|commit|reset|checkout|merge|rebase))/i, category: "GIT_MUTATION" },
  { pattern: /\b(child_process|exec\(|spawn\(|subprocess)/i, category: "SHELL_EXEC" },
  { pattern: /\b(executeTrade|placeOrder|marketBuy|marketSell|swap\()/i, category: "TRADING" },
  { pattern: /\b(docker\s+(run|rm|stop)|kubectl\s+(apply|delete))/i, category: "INFRA_MUTATION" },
];

export interface SecurityScanResult {
  passed: boolean;
  flags: string[];
  isStateAltering: boolean;
  categories: string[];
}

export function scanPayload(text: string): SecurityScanResult {
  const flags: string[] = [];
  const categories: string[] = [];

  for (const { pattern, flag } of DESTRUCTIVE_PATTERNS) {
    if (pattern.test(text)) flags.push(flag);
  }

  for (const { pattern, category } of STATE_ALTERING_PATTERNS) {
    if (pattern.test(text)) categories.push(category);
  }

  const isStateAltering = categories.length > 0;
  const passed = flags.length === 0;

  return { passed, flags, isStateAltering, categories };
}

export function mergeScanResults(a: SecurityScanResult, b: SecurityScanResult): SecurityScanResult {
  const flags = [...new Set([...a.flags, ...b.flags])];
  const categories = [...new Set([...a.categories, ...b.categories])];
  return {
    passed: a.passed && b.passed,
    flags,
    isStateAltering: a.isStateAltering || b.isStateAltering,
    categories,
  };
}
