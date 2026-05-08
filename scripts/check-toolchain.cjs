#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const packageJsonPath = path.join(repoRoot, 'package.json');
const nvmrcPath = path.join(repoRoot, '.nvmrc');

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const requiredNodeRange = packageJson.engines?.node ?? '';
const requiredNodeVersion = fs.readFileSync(nvmrcPath, 'utf8').trim();
const requiredYarnVersion =
  packageJson.packageManager?.startsWith('yarn@') === true
    ? packageJson.packageManager.slice('yarn@'.length)
    : null;

const args = new Set(process.argv.slice(2));
const skipPackageManager = args.has('--skip-package-manager');

function fail(message) {
  console.error(`\nToolchain check failed: ${message}\n`);
  console.error('Required local versions:');
  console.error(`- Node.js ${requiredNodeVersion} (${requiredNodeRange} in package.json)`);

  if (requiredYarnVersion !== null) {
    console.error(`- Yarn ${requiredYarnVersion}`);
  }

  console.error('\nRecommended fix:');
  console.error(`1. nvm use ${requiredNodeVersion}`);

  if (requiredYarnVersion !== null) {
    console.error('2. corepack enable');
    console.error(`3. corepack prepare yarn@${requiredYarnVersion} --activate`);
  }

  process.exit(1);
}

function parseVersion(version) {
  const match = /^v?(\d+)\.(\d+)\.(\d+)$/.exec(version);

  if (!match) {
    return null;
  }

  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
  };
}

function compareVersions(left, right) {
  if (left.major !== right.major) {
    return left.major - right.major;
  }

  if (left.minor !== right.minor) {
    return left.minor - right.minor;
  }

  return left.patch - right.patch;
}

const currentNodeVersion = parseVersion(process.version);
const minimumNodeVersion = parseVersion(requiredNodeVersion);

if (currentNodeVersion === null || minimumNodeVersion === null) {
  fail(`Unable to compare Node versions: current='${process.version}', required='${requiredNodeVersion}'.`);
}

if (
  currentNodeVersion.major !== minimumNodeVersion.major ||
  compareVersions(currentNodeVersion, minimumNodeVersion) < 0
) {
  fail(
    `Expected Node ${requiredNodeRange} (from .nvmrc ${requiredNodeVersion}), but found ${process.version}.`,
  );
}

if (skipPackageManager) {
  process.exit(0);
}

const userAgent = process.env.npm_config_user_agent ?? '';

if (!userAgent.includes('yarn/')) {
  fail('Use Yarn for installs in this workspace. npm is not supported here.');
}

if (requiredYarnVersion !== null) {
  const yarnVersionMatch = /yarn\/(\d+\.\d+\.\d+)/.exec(userAgent);
  const currentYarnVersion = yarnVersionMatch?.[1] ?? null;

  if (currentYarnVersion === null) {
    fail(`Unable to determine the active Yarn version from npm_config_user_agent='${userAgent}'.`);
  }

  const parsedCurrentYarnVersion = parseVersion(currentYarnVersion);
  const parsedRequiredYarnVersion = parseVersion(requiredYarnVersion);

  if (
    parsedCurrentYarnVersion === null ||
    parsedRequiredYarnVersion === null ||
    compareVersions(parsedCurrentYarnVersion, parsedRequiredYarnVersion) !== 0
  ) {
    fail(
      `Expected Yarn ${requiredYarnVersion} from packageManager, but found Yarn ${currentYarnVersion}.`,
    );
  }
}
