import fs from 'fs';
import path from 'path';

const workspaceRoot = path.resolve(import.meta.dirname, '../..');
const packagesRoot = path.join(workspaceRoot, 'packages');
const pluginPath = '../twenty-oxlint-rules/dist/oxlint-plugin.mjs';

function readJson(filePath: string) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function findProjectRootsWithCustomPlugin(currentDirectory: string): string[] {
  const entries = fs.readdirSync(currentDirectory, { withFileTypes: true });
  const projectRoots: string[] = [];

  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name.startsWith('.')) {
      continue;
    }

    const entryPath = path.join(currentDirectory, entry.name);

    if (entry.isDirectory()) {
      projectRoots.push(...findProjectRootsWithCustomPlugin(entryPath));
      continue;
    }

    if (entry.name !== '.oxlintrc.json') {
      continue;
    }

    const oxlintConfig = readJson(entryPath);

    if (oxlintConfig.jsPlugins?.includes(pluginPath)) {
      projectRoots.push(path.dirname(entryPath));
    }
  }

  return projectRoots.sort();
}

function readDependsOn(projectRoot: string, targetName: 'lint' | 'lint:diff-with-main') {
  const projectJsonPath = path.join(projectRoot, 'project.json');
  const projectJson = readJson(projectJsonPath);

  return {
    name: projectJson.name,
    dependsOn: projectJson.targets?.[targetName]?.dependsOn ?? [],
  };
}

describe('workspace lint target dependencies', () => {
  it('keeps the custom oxlint plugin dependency scoped to projects that load it', () => {
    const nxJson = readJson(path.join(workspaceRoot, 'nx.json'));

    expect(nxJson.targetDefaults.lint.dependsOn).not.toContain(
      'twenty-oxlint-rules:build',
    );

    const projectRoots = findProjectRootsWithCustomPlugin(packagesRoot);
    const pluginProjectNames = projectRoots.map((projectRoot) =>
      readJson(path.join(projectRoot, 'project.json')).name,
    );

    expect(pluginProjectNames).toEqual([
      'twenty-emails',
      'twenty-front',
      'twenty-server',
      'twenty-shared',
      'twenty-ui',
    ]);

    for (const projectRoot of projectRoots) {
      expect(readDependsOn(projectRoot, 'lint').dependsOn).toContain(
        'twenty-oxlint-rules:build',
      );
      expect(readDependsOn(projectRoot, 'lint:diff-with-main').dependsOn).toContain(
        'twenty-oxlint-rules:build',
      );
    }
  });
});
