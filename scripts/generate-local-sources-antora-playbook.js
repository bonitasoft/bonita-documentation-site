const fs = require('fs');
const fse = require('fs-extra');
const yaml = require('js-yaml');

const outputDirectory = '.';
const outputFile = `${outputDirectory}/antora-playbook-local-sources.yml`

console.info('Generating an Antora Playbook for local git sources only');
fse.ensureDirSync(outputDirectory);
fse.removeSync(outputFile);

const doc = yaml.load(fs.readFileSync('antora-playbook.yml', 'utf8'));
console.info('Antora Playbook source file loaded');

doc.content.sources
    .filter(source => source.url.includes('http') || source.url.includes('ssh'))
    .forEach(source => {
      source.url = `../${(repositoryNameForUrl(source.url))}`
    });

console.info('Dumping yaml....')
const generatedYaml = `# Generated from 'antora-playbook.yml'
${(yaml.dump(doc))}`;
fs.writeFileSync(outputFile, generatedYaml);
console.info(`Antora Playbook generated in ${outputFile}`);


function repositoryNameForUrl(url) {
  const urlParts = url.split('/');
  const repositoryName = urlParts[urlParts.length-1];
  return repositoryName.split('.git')[0];
}
