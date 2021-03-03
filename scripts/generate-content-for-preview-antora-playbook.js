const fs = require('fs');
const fse = require('fs-extra');
const yaml = require('js-yaml');

const outputDirectory = '.';
const outputFile = `${outputDirectory}/antora-playbook-content-for-preview.yml`

console.info('Generating an Antora Playbook for documentation content preview');
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

const useSingleBranchPerComponent = getArgument(argv, 'single-branch-per-repo', false);
const siteUrl = getArgument(argv, 'site-url', false)
const prNumber = getArgument(argv, 'pr', false)
const siteTitle = getArgument(argv, 'site-title', false)
console.info(`PR: ${prNumber}`);
console.info(`Site Url: ${siteUrl}`);
console.info(`Site Title: ${siteTitle}`);

const doc = yaml.load(fs.readFileSync('antora-playbook.yml', 'utf8'));
console.info('Antora Playbook source file loaded');


// single branch by component (pr preview)
if (!useSingleBranchPerComponent) {
    const componentName = getArgument(argv, 'component', true);
    const branchName = getArgument(argv, 'branch', true)

    console.info('Manage documentation content PR preview (single branch of a single component)');
    console.info(`Component: ${componentName}`);
    console.info(`Branch: ${branchName}`);

    const repoUrls = new Map([
        ['bcd', 'https://github.com/bonitasoft/bonita-continuous-delivery-doc.git'],
        ['bonita', 'https://github.com/bonitasoft/bonita-doc.git'],
        ['cloud', 'https://github.com/bonitasoft/bonita-cloud-doc.git'],
        ['labs', 'https://github.com/bonitasoft/bonita-ici-doc.git'],
    ]);
    const repoUrl = repoUrls.get(componentName);
    if (!repoUrl) {
        throw new Error(`Unknown component '${componentName}'. It must be one of [${Array.from(repoUrls.keys()).join(', ')}]`);
    }
    console.info(`Repository url: ${repoUrl}`);

    // override the sources: only the single branch of the single component
    doc.content.sources = [{url: repoUrl, branches: [branchName]}];

    const titlePreviewPart = prNumber ? `PR #${prNumber}` : `branch '${branchName}'`;
    doc.site.title = siteTitle ? siteTitle : `Preview ${componentName} ${titlePreviewPart}`;
    // override the start page to use the one of the component
    doc.site.start_page = `${componentName}::index.adoc`;
}
// single branch by component (site preview)
else {
    console.info('Manage documentation content PR preview (single branch per component)');

    doc.content.sources
        .forEach(source => {
            // keep only the latest declared branch
            source.branches = source.branches[source.branches.length - 1];
        });
    doc.site.title = `Preview PR #${prNumber}`;
}


// use local sources for the documentation content repositories
const useLocalSources = getArgument(argv, 'local-sources', false)
console.info(`Use Local Sources: ${useLocalSources}`);
if (useLocalSources === 'true') {
    doc.content.sources
        .filter(source => source.url.includes('http') || source.url.includes('ssh'))
        .forEach(source => {
            source.url = `../${(repositoryNameForUrl(source.url))}`
        });
}
// use local source for the UI bundle
const useLocalUIBundle = getArgument(argv, 'local-ui-bundle', false)
console.info(`Use Local UI Bundle: ${useLocalUIBundle}`);
if (useLocalUIBundle === 'true') {
    doc.ui.bundle.url = '../bonita-documentation-theme/build/ui-bundle.zip';
}


if (siteUrl) {
    doc.site.url = siteUrl;
}
// We want to ensure that wherever a preview is published, Search Engines won't index it
doc.site.robots = 'disallow';

// Allow local file browsing
const previewType = getArgument(argv, 'type', false)
console.info(`Preview Type: ${previewType}`);
if (previewType === 'local') {
    doc.urls.html_extension_style = 'default';
}

// Fetch sources
const fetchSources = getArgument(argv, 'fetch-sources', false)
console.info(`Fetch Sources: ${fetchSources}`);
if (fetchSources === 'true') {
    doc.runtime.fetch = true
}

// Set the non-production mode (custom navbar for preview)
const forceProductionNavbar = getArgument(argv, 'force-production-navbar', false)
console.info(`Force Production Navbar: ${forceProductionNavbar}`);
if (forceProductionNavbar !== 'true') {
    if (!doc.site.keys) {
        doc.site.keys = {};
    }
    doc.site.keys['non-production'] = true;
} else {
    console.info('--> Force usage of production navbar');
}

console.info('Dumping yaml....');
const generatedYaml = `# Generated from 'antora-playbook.yml'
${(yaml.dump(doc))}`;
fs.writeFileSync(outputFile, generatedYaml);
console.info(`Antora Playbook generated in ${outputFile}`);


function repositoryNameForUrl(url) {
    const urlParts = url.split('/');
    const repositoryName = urlParts[urlParts.length-1];
    return repositoryName.split('.git')[0];
}
