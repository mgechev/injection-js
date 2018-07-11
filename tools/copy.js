// @ts-check
const { writeFileSync, copyFileSync } = require('fs');
const { resolve } = require('path');
const packageJson = require('../package.json');

main();

function main() {
  const projectRoot = resolve(__dirname, '..');
  const distPath = resolve(projectRoot, 'dist');
  const distPackageJson = createDistPackageJson(packageJson);

  copyFileSync(resolve(projectRoot, 'README.md'), resolve(distPath, 'README.md'));
  writeFileSync(resolve(distPath, 'package.json'), distPackageJson);
}

/**
 * @param {typeof packageJson} packageConfig
 * @return {string}
 */
function createDistPackageJson(packageConfig) {
  const { devDependencies, scripts, engines, ...distPackageJson } = packageConfig;

  return JSON.stringify(distPackageJson, null, 2);
}
