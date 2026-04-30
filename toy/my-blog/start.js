const { spawn } = require("child_process");
const path = require("path");

const nextBin = path.join(__dirname, "node_modules", "next", "dist", "bin", "next");
const child = spawn(
  process.execPath,
  [nextBin, "start", "-p", "3000"],
  {
    cwd: __dirname,
    stdio: "inherit",
    env: { ...process.env, NODE_ENV: "production" },
  }
);

child.on("exit", (code) => process.exit(code));
process.on("SIGTERM", () => child.kill());
process.on("SIGINT", () => child.kill());
