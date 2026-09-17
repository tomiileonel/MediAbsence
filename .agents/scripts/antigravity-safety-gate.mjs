const rawInput = await readStdin();

if (rawInput.trim().length === 0) {
  emitDecision({ decision: "deny", reason: "No command payload was provided." });
  process.exit(2);
}

let payload;
try {
  payload = JSON.parse(rawInput);
} catch (error) {
  const message = error instanceof Error ? error.message : "Unknown error";
  emitDecision({ decision: "deny", reason: "Invalid hook payload: " + message });
  process.exit(2);
}

const commandLine = extractCommandLine(payload);
if (commandLine === null) {
  emitDecision({ decision: "deny", reason: "Unrecognized tool payload shape." });
  process.exit(2);
}

function flagText(tool) {
  const m = commandLine.match(new RegExp(`\\b${tool}\\b([^|;&]*)`));
  if (!m) return "";
  return (m[1].match(/-{1,2}[A-Za-z][\w-]*/g) ?? []).join("");
}

const isRmRf = () => {
  const flags = flagText("rm");
  const hasR = /r/i.test(flags) || /--recursive/i.test(commandLine);
  const hasF = /f/i.test(flags) || /--force/i.test(commandLine);
  return hasR && hasF;
};

const isGitCleanF = () => {
  const flags = flagText("git clean");
  return /f/i.test(flags) || /--force/i.test(commandLine);
};

const DENY =
  /\bgit\s+reset\s+--hard\b/i.test(commandLine) ||
  /\bgit\s+push\b[^|;&]*\s(-f|--force)(\s|$)/i.test(commandLine) ||
  /\bprisma\s+db\s+push\b[^|;&]*--accept-data-loss/i.test(commandLine) ||
  /\bprisma\s+migrate\s+reset\b/i.test(commandLine) ||
  /\bDROP\s+(DATABASE|SCHEMA)\b/i.test(commandLine) ||
  /\bprintenv\b/i.test(commandLine) ||
  /\brmdir\s+\/s\b/i.test(commandLine) ||
  /\bdel\s+\/s\b/i.test(commandLine) ||
  isRmRf() ||
  isGitCleanF() ||
  /(^|[\s"'=\/@])\.env(?:\.[A-Za-z0-9._-]+)?(?=$|[\s"'=\/@|:;)])/i.test(commandLine) ||
  /id_rsa|id_ed25519|[\\/]\.ssh[\\/]/i.test(commandLine);

const ASK =
  /\b(?:prisma|npx\s+prisma|pnpm\s+prisma)\s+migrate\s+(?:dev|deploy)\b/i.test(commandLine) ||
  /\bdocker\s+(?:rm|system\s+prune)\b/i.test(commandLine) ||
  /\bterraform\s+(?:apply|destroy)\b/i.test(commandLine) ||
  /\bgit\s+push\b/i.test(commandLine) ||
  /\b(curl|wget|sudo)\b/i.test(commandLine);

let decision, reason;
if (DENY) {
  decision = "deny";
  reason = "Blocked destructive, irreversible or secret-access command.";
} else if (ASK) {
  decision = "force_ask";
  reason = "External-state operation requires explicit approval.";
} else {
  decision = "allow";
  reason = "Command passed the safety gate.";
}

emitDecision({ decision, reason });
process.exit(decision === "deny" ? 2 : 0);

function readStdin() {
  return new Promise((resolve, reject) => {
    let data = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => {
      data += chunk;
    });
    process.stdin.on("end", () => resolve(data));
    process.stdin.on("error", (error) => reject(error));
  });
}

function extractCommandLine(value) {
  if (typeof value !== "object" || value === null) return null;
  const toolCall = value.toolCall;
  if (typeof toolCall !== "object" || toolCall === null) return null;
  const args = toolCall.args;
  if (typeof args !== "object" || args === null) return null;
  const command = args.CommandLine ?? args.commandLine ?? args.command;
  return typeof command === "string" ? command : null;
}

function emitDecision(decision) {
  process.stdout.write(JSON.stringify(decision) + "\n");
}
