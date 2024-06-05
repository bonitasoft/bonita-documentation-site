const fs = require('fs');
const fse = require('fs-extra');
const yaml = require('js-yaml');

const outputDirectory = '.';
const outputFile = `${outputDirectory}/antora-playbook-content-for-preview.yml`

console.info('Generating an Antora Playbook for documentation content preview');
fse.ensureDirSync(outputDirectory);
fse.removeSync(outputFile);

const repoUrls = new Map([
    ['bcd', 'https://github.com/bonitasoft/bonita-continuous-delivery-doc.git'],
    ['bonita', 'https://github.com/bonitasoft/bonita-doc.git'],
    ['bpi', 'https://github.com/bonitasoft/bonita-process-insights-doc.git'],
    ['central', 'https://github.com/bonitasoft/bonita-central-doc.git'],
    ['cloud', 'https://github.com/bonitasoft/bonita-cloud-doc.git'],
    ['labs', 'https://github.com/bonitasoft/bonita-labs-doc.git'],
    ['test-toolkit', 'https://github.com/bonitasoft/bonita-test-toolkit-doc.git'],
]);
function getRepoUrl(componentName) {
    const repoUrl = repoUrls.get(componentName);
    if (!repoUrl) {
        throw new Error(`Unknown component '${componentName}'. It must be one of [${Array.from(repoUrls.keys()).join(', ')}]`);
    }
    return repoUrl;
}

function ensureArray(object) {
    if (!object) {
        return [];
    }
    // we can probably improve the implementation if needed
    if (typeof object === 'string') {
        return [object];
    }
    return object;
}

// parse arguments
const argv = require('minimist')(process.argv.slice(2), {
    string: 'branch', // as bonita branches match versions, branch could be considered as number, so this config prevents '7.10' from being converted into '7.1'
});
function getArgument(args, argName, isMandatory) {
    const value = args[argName];
    if (isMandatory && !value) {
        throw Error(`You must pass a '${argName}' argument`);
    }
    return value;
}
function getArgumentAsArray(args, argName, isMandatory) {
    return ensureArray(getArgument(args, argName, isMandatory))
}

// TODO rename options to use components instead of repositories
const useAllComponents = getArgument(argv, 'use-all-repositories', false);
const useSingleBranchPerComponent = getArgument(argv, 'single-branch-per-repo', false);
const useMultiComponents = getArgument(argv, 'use-multi-repositories', false);
const useTestSources = getArgument(argv, 'use-test-sources', false);
const siteUrl = getArgument(argv, 'site-url', false)
const prNumber = getArgument(argv, 'pr', false)
const siteTitle = getArgument(argv, 'site-title', false)
const startPage = getArgument(argv, 'start-page', false);
console.info(`PR: ${prNumber}`);
console.info(`Site Url: ${siteUrl}`);
console.info(`Site Title: ${siteTitle}`);
console.info(`Start Page: ${startPage}`);

const doc = yaml.load(fs.readFileSync('antora-playbook.yml', 'utf8'));
console.info('Antora Playbook source file loaded');

// use all components and versions (production preview)
if (useAllComponents) {
    console.info('Documentation content: all components and branches');
    doc.site.title = siteTitle || doc.site.title;
}
// single branch per component (site preview)
else if (useSingleBranchPerComponent) {
    console.info('Documentation content: single branch per component');

    doc.content.sources
        .forEach(source => {
            // keep only the latest declared branch
            source.branches = source.branches[source.branches.length - 1];
        });
    doc.site.title = siteTitle || `Preview PR #${prNumber}`;
}
// multiple components, each with its own set of branches
else if (useMultiComponents) {
    console.info('Documentation content: multi components and branches');
    const componentsWithBranches = getArgumentAsArray(argv, 'component-with-branches', true);
    console.info('Components with branches:', componentsWithBranches);

    const sources = [];
    for (let componentWithBranches of componentsWithBranches) {
        const split = componentWithBranches.split(":");
        const repoUrl = getRepoUrl(split[0]);
        const branchNames = split[1].split(',');
        sources.push({ url: repoUrl, branches: branchNames });
    }
    doc.content.sources = sources;
}
else if (useTestSources) {
    console.info('Documentation content: use test sources');
    doc.content.sources = [{
        url: './',
        branches: ['HEAD'],
        start_paths: [
            'test/documentation-content/bcd/3.4',
            'test/documentation-content/bcd/3.5',
            'test/documentation-content/bcd/4.0',
            'test/documentation-content/bcd/4.1-alpha',
            'test/documentation-content/bcd/4.2-alpha',
            'test/documentation-content/bonita/v0',
            'test/documentation-content/bonita/v7.4',
            'test/documentation-content/bonita/v7.11',
            'test/documentation-content/bonita/v2021.1',
            'test/documentation-content/bonita/v2021.2',
            'test/documentation-content/bonita/v2022.1-beta',
            'test/documentation-content/bonita/v2022.2-alpha',
            'test/documentation-content/bpi/latest',
            'test/documentation-content/central/1.0',
            'test/documentation-content/central/2.0',
            'test/documentation-content/cloud/latest',
            'test/documentation-content/labs/latest',
            'test/documentation-content/test-toolkit/1.0',
            'test/documentation-content/test-toolkit/2.0',
        ],
    }];
    const titlePreviewPart = prNumber ? `PR #${prNumber}` : `branch 'local'`;
    doc.site.title = siteTitle || `[test-content] ${titlePreviewPart}`;
}
// single branch of a single component (pr preview)
else {
    console.info('Documentation content: single branch of a single component');
    const componentName = getArgument(argv, 'component', true);
    const branchName = getArgument(argv, 'branch', true);
    console.info(`Component: ${componentName}`);
    console.info(`Branch: ${branchName}`);

    // override the sources: only the single branch of the single component
    const repoUrl = getRepoUrl(componentName);
    console.info(`Configured repo URL for the component: ${repoUrl}`);
    // if provided a specific repository, use it. Calling getRepoUrl validates that the component is known
    const repoUrlArg = getArgument(argv, 'component-repo-url', false);
    if (repoUrlArg) {
        console.info(`--> Overriding repo URL with the provided argument: ${repoUrlArg}`);
        doc.content.sources = [{ url: repoUrlArg, branches: [branchName] }];
    } else {
        doc.content.sources = [{ url: repoUrl, branches: [branchName] }];
    }

    const titlePreviewPart = prNumber ? `PR #${prNumber}` : `branch '${branchName}'`;
    doc.site.title = siteTitle || `Preview ${componentName} ${titlePreviewPart}`;
    // override the start page to use the one of the component
    doc.site.start_page = `${componentName}::index.adoc`;
}

// override the start page if startPage is given as parameter
if (startPage) {
    doc.site.start_page = startPage;
}

// use local sources for the documentation content repositories
const useLocalSources = getArgument(argv, 'local-sources', false);
console.info(`Use Local Sources: ${useLocalSources}`);
if (useLocalSources) {
    doc.content.sources
        .filter(source => source.url.includes('http') || source.url.includes('ssh'))
        .forEach(source => {
            source.url = `../${(repositoryNameForUrl(source.url))}`
        });
}
// use local source for the UI bundle
const useLocalUIBundle = getArgument(argv, 'local-ui-bundle', false)
console.info(`Use Local UI Bundle: ${useLocalUIBundle}`);
if (useLocalUIBundle) {
    doc.ui.bundle.url = '../bonita-documentation-theme/build/ui-bundle.zip';
}

// use the Antora Default UI bundle
const useDefaultUIBundle = getArgument(argv, 'default-ui-bundle', false)
console.info(`Use Default Antora UI Bundle: ${useDefaultUIBundle}`);
if (useDefaultUIBundle) {
    doc.ui.bundle.url = 'https://gitlab.com/antora/antora-ui-default/-/jobs/artifacts/HEAD/raw/build/ui-bundle.zip?job=bundle-stable';
    doc.ui.bundle.snapshot = useDefaultUIBundle === 'snapshot';
}


if (siteUrl) {
    doc.site.url = (siteUrl === 'DISABLED') ? undefined : siteUrl;
}
// We want to ensure that wherever a preview is published, Search Engines won't index it
doc.site.robots = 'disallow';


// By default, generate html pages for redirects (https://docs.antora.org/antora/2.3/playbook/urls-redirect-facility/)
// Work with file browsing and http servers that don't provide redirects.
doc.urls.redirect_facility = 'static';

// Preview type
const previewTypeArgs = getArgumentAsArray(argv, 'type', false);
// only keep the latest element
const previewType = previewTypeArgs.slice(-1)[0];
console.info(`Preview Type: ${previewType}`);
switch (previewType) {
    // Allow local file browsing
    case 'local':
        doc.urls.html_extension_style = 'default';
        break;
    // For Netlify environment simulation (use the dev server)
    case 'netlify':
        doc.urls.redirect_facility = 'netlify';
        doc.urls.html_extension_style = 'drop';
        break;
    default:
        console.info('--> no specific preview type');
}

// Fetch sources
const fetchSources = getArgument(argv, 'fetch-sources', false)
console.info(`Fetch Sources: ${fetchSources}`);
doc.runtime.fetch = fetchSources === 'true';

// Log level
const logLevel = getArgument(argv, 'log-level', false)
console.info(`Log level: ${logLevel}`);
if (logLevel) {
    doc.runtime.log.level = logLevel;
}

// Manage 'failure_level'
const ignoreErrors = getArgument(argv, 'ignore-errors', false);
console.info(`Ignore errors: ${ignoreErrors}`);
if (ignoreErrors === 'true') {
    doc.runtime.log.failure_level = 'fatal';
}
const failOnWarning = getArgument(argv, 'fail-on-warning', false);
console.info(`Fail on warning: ${failOnWarning}`);
if (failOnWarning === 'true') {
    doc.runtime.log.failure_level = 'warn';
}
console.info(`--> Antora log.failure_level: ${doc.runtime.log.failure_level}`);


// Set the non-production mode (custom navbar for preview)
const forceProductionNavbar = getArgument(argv, 'force-production-navbar', false)
console.info(`Force Production Navbar: ${forceProductionNavbar}`);
if (!forceProductionNavbar) {
    getSiteKeys(doc)['non-production'] = true;
} else {
    console.info('--> Force usage of production navbar');
}

// Let display the search bar even in the non-production mode
const forceDisplaySearchBar = getArgument(argv, 'force-display-search-bar', false)
console.info(`Force Display Search Bar: ${forceDisplaySearchBar}`);
if (forceDisplaySearchBar) {
    getSiteKeys(doc)['force-display-search-bar'] = true;
}

// Hide 'Edit this Page' links
const hideEditPageLinks = getArgument(argv, 'hide-edit-page-links', false)
console.info(`Hide Edit Page Links: ${hideEditPageLinks}`);
if (hideEditPageLinks) {
    getSiteKeys(doc)['hide-edit-page-links'] = true;
}

// Hide components list in navbar
const hideNavbarComponentsList = getArgument(argv, 'hide-navbar-components-list', false)
console.info(`Hide Navbar Components List: ${hideNavbarComponentsList}`);
if (hideNavbarComponentsList) {
    getSiteKeys(doc)['hide-navbar-components-list'] = true;
}

// Ensure we get details where xref resolution fails
// https://docs.antora.org/antora/3.0/playbook/asciidoc-sourcemap/
doc.asciidoc.sourcemap = true;

// Antora Atlas: site-manifest configuration
// Ensure that xref validation is done in partial builds. In this case, missing component version pages are resolved using the production resources stored in the site manifest
const isSiteManifestDownloadEnabled = !useAllComponents && !useTestSources;
if (isSiteManifestDownloadEnabled) {
    console.info(`Enable Antora Atlas site-manifest download`);
    // Working site-manifest generated locally and stored in the documentation site
    doc.asciidoc.attributes['primary-site-manifest-url'] = 'https://documentation.bonitasoft.com/site-manifest.json.gz';
} else {
    console.info('Keep Antora Atlas site-manifest download disabled (building all components or using test sources)')
}

// Generate the preview Antora playbook
console.info('Dumping yaml....');
const generatedYaml = `# Generated from 'antora-playbook.yml'
${(yaml.dump(doc))}`;
fs.writeFileSync(outputFile, generatedYaml);
console.info(`Antora Playbook generated in ${outputFile}`);


function repositoryNameForUrl(url) {
    const urlParts = url.split('/');
    const repositoryName = urlParts[urlParts.length - 1];
    return repositoryName.split('.git')[0];
}

function getSiteKeys(doc) {
    if (!doc.site.keys) {
        doc.site.keys = {};
    }
    return doc.site.keys;
}
