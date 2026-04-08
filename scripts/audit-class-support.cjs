const fs = require('fs');
const path = require('path');

const repoRoot = process.cwd();

function readRepoFile(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function hasRegistryKey(text, key) {
  const pattern = new RegExp(`['"]?${escapeRegex(key)}['"]?\\s*:\\s*\\{`);
  return pattern.test(text);
}

function hasStringLiteral(text, value) {
  const pattern = new RegExp(`['"]${escapeRegex(value)}['"]`);
  return pattern.test(text);
}

function hasClassIdAssignment(text, classId) {
  const pattern = new RegExp(`classId\\s*:\\s*['"]${escapeRegex(classId)}['"]`);
  return pattern.test(text);
}

const classesText = readRepoFile('src/content/classes.ts');
const classIds = Array.from(
  classesText.matchAll(/id:\s*'([^']+)'/g),
  (match) => match[1]
);

if (classIds.length === 0) {
  console.error('No class ids found in src/content/classes.ts.');
  process.exit(1);
}

const registryFiles = {
  actionKit: readRepoFile('src/content/class-actions.ts'),
  combatProfile: readRepoFile('src/engine/run/run-hero.ts'),
  narrative: readRepoFile('src/content/company-lore.ts'),
  classEmblemAlignment: readRepoFile('src/assets/supplemental-art-sources.ts'),
  classCodex: readRepoFile('src/content/authored-voice.ts'),
  eventClassHooks: readRepoFile('src/content/event-class-hooks.ts'),
};

const requiredChecks = [
  {
    label: 'action kit',
    test: (classId) => hasClassIdAssignment(registryFiles.actionKit, classId),
  },
  {
    label: 'combat profile',
    test: (classId) => hasRegistryKey(registryFiles.combatProfile, classId),
  },
  {
    label: 'class narrative',
    test: (classId) => hasRegistryKey(registryFiles.narrative, classId),
  },
  {
    label: 'class emblem alignment',
    test: (classId) => hasRegistryKey(registryFiles.classEmblemAlignment, classId),
  },
];

const optionalChecks = [
  {
    label: 'authored codex card',
    test: (classId) => hasRegistryKey(registryFiles.classCodex, classId),
  },
  {
    label: 'event class hook bonus coverage',
    test: (classId) => hasRegistryKey(registryFiles.eventClassHooks, classId),
  },
];

const failures = [];
const warnings = [];

for (const classId of classIds) {
  for (const check of requiredChecks) {
    if (!check.test(classId)) {
      failures.push(`${classId}: missing ${check.label}`);
    }
  }

  for (const check of optionalChecks) {
    if (!check.test(classId)) {
      warnings.push(`${classId}: missing ${check.label}`);
    }
  }
}

console.log('Class support audit');
console.log(`- classes scanned: ${classIds.join(', ')}`);
console.log(`- required checks: ${requiredChecks.length}`);
console.log(`- optional checks: ${optionalChecks.length}`);

if (warnings.length > 0) {
  console.log('- optional follow-up:');
  for (const warning of warnings) {
    console.log(`  - ${warning}`);
  }
}

if (failures.length > 0) {
  console.error('- required failures:');
  for (const failure of failures) {
    console.error(`  - ${failure}`);
  }
  process.exit(1);
}

console.log('- result: all required class support surfaces are present.');
