const fs = require('fs');
const fse = require('fs-extra');
const yaml = require('js-yaml');

const outputDirectory = '.';
const outputFile = `${outputDirectory}/antora-playbook-doc-content-pr-preview.yml`

console.info('Generating an Antora Playbook for documentation content PR preview (single branch of a single component)');
fse.ensureDirSync(outputDirectory);
fse.removeSync(outputFile);

// parse arguments
const argv = require('minimist')(process.argv.slice(2));
function getArgument(argv, argName, isMandatory) {
    const value = argv[argName];
    if (isMandatory && !value) {
        throw Error(`You must pass a '${argName}' argument`);
    }
    return value;
}

const componentName = getArgument(argv, 'component', true);
const branchName = getArgument(argv, 'branch', true)
const prNumber = getArgument(argv, 'pr', false)
const siteUrl = getArgument(argv, 'site-url', false)
console.info(`Component: ${componentName}`);
console.info(`Branch: ${branchName}`);
console.info(`PR: ${prNumber}`);
console.info(`Site Url: ${siteUrl}`);


const repoUrls = new Map([
    ['bcd', 'https://github.com/bonitasoft/bonita-continuous-delivery-doc.git'],
    ['bici', 'https://github.com/bonitasoft/bonita-ici-doc.git'],
    ['bonita', 'https://github.com/bonitasoft/bonita-doc.git'],
    ['cloud', 'https://github.com/bonitasoft/bonita-cloud-doc.git'],
]);
const repoUrl = repoUrls.get(componentName);
if (!repoUrl) {
    throw new Error(`Unknown component '${componentName}'. It must be one of [${Array.from(repoUrls.keys()).join(', ')}]`);
}
console.info(`Repository url: ${repoUrl}`);

const doc = yaml.load(fs.readFileSync('antora-playbook.yml', 'utf8'));
console.info('Antora Playbook source file loaded');

// override the sources: only the single branch of the single component
doc.content.sources = [ { url: repoUrl, branches: [ branchName ]} ];

// TODO the title is currently not used in our 'Antora UI bundle'
const titlePreviewPart = prNumber ? `PR #${prNumber}` : `branch '${branchName}'`;
doc.site.title = `Preview ${componentName} ${titlePreviewPart}`;
// override the start page to use the one of the component
doc.site.start_page = `${componentName}::index.adoc`;
if (siteUrl) {
    doc.site.url = siteUrl;
}

console.info('Dumping yaml....');
const generatedYaml = `# Generated from 'antora-playbook.yml'
${(yaml.dump(doc))}`;
fs.writeFileSync(outputFile, generatedYaml);
console.info(`Antora Playbook generated in ${outputFile}`);
