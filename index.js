const child_process = require("child_process");
const fs = require("fs");
const path = require("path");

// bootstraps a basic typescript project

if (process.argv.length === 2) {
  console.error("Requires at least one argument: Project Name");
  process.exitCode = 1;
}

const projectName = process.argv[2];
const projectDirArg = process.argv[3];

let projectDir = projectDirArg
  ? path.join(projectDirArg, projectName)
  : path.join(process.cwd(), projectName);

const dirs = [path.join(projectDir, "/src"), path.join(projectDir, "/dist")];

// make project directories
for (const dir of dirs) {
  console.log(`Creating directory: ${dir}...`);
  fs.mkdirSync(dir, { recursive: true });
}

// make root project files

// package.json
const packageJson = {
  scripts: {
    dev: "tsc && node ./dist/index.js",
  },
};

console.log("Creating package.json...");
fs.writeFileSync(
  path.join(projectDir, "package.json"),
  JSON.stringify(packageJson)
);

// tsconfig.json
const tsconfig = {
  compilerOptions: {
    target: "es2016",
    module: "commonjs",
    outDir: "./dist",
    esModuleInterop: true,
    forceConsistentCasingInFileNames: true,
    strict: true,
    skipLibCheck: true,
  },
  include: ["./src/**/*.ts"],
};

console.log("Creating tsconfig.json...");
fs.writeFileSync(
  path.join(projectDir, "tsconfig.json"),
  JSON.stringify(tsconfig)
);

console.log("Creating root index.ts...");
fs.writeFileSync(path.join(projectDir, "src/index.ts"), "");

console.log("Starting NPM installs...");
const npmInstallTS = child_process.spawn(
  "npm",
  ["install", "typescript", "--save-dev"],
  { cwd: projectDir, shell: true }
);
npmInstallTS.stdout.on("data", (data) => {
  console.log(data.toString());
});

npmInstallTS.stderr.on("data", (errData) => {
  console.error(errData);
});

npmInstallTS.on("close", (exitCode) => {
  console.log("Child process closed with exit code: " + exitCode);
  const npmInstallExpress = child_process.spawn("npm", ["install", "express"], {
    cwd: projectDir,
    shell: true,
  });

  npmInstallExpress.stdout.on("data", (data) => {
    console.log(data.toString());
  });
  npmInstallExpress.on("close", (exitCode) => {
    console.log("Child process closed with exit code: " + exitCode);
    finished();
  });
});

function finished() {
  console.log("=======================================");
  console.log(
    `Basic TypeScript project bootstrapped! Start editing: ${path.join(
      projectDir,
      "src",
      "index.ts"
    )}`
  );
  console.log("=======================================");
}
