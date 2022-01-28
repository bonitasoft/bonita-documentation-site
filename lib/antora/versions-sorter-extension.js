// For more details, see
// https://antora.zulipchat.com/#narrow/stream/282400-users/topic/.E2.9C.94.20Antora.203.20question.20-.20component.20prerelease.20versions.20order/near/264316724
// https://github.com/bonitasoft/bonita-documentation-site/pull/266

module.exports.register = function () {
    // see https://github.com/pinojs/pino/blob/master/docs/api.md
    const logger = this.getLogger('bonita-versions-sorter');

    this.on('contentClassified', ({contentCatalog}) => {
        logger.info('Start sorting');

        for (const component of contentCatalog.getComponents()) {
            logger.info('Processing component %s', component.name);
            debugLogVersionsArray('Original version order', component.versions);
            const sortedVersions = [];
            const alphaVersions = [];

            component.versions.forEach(version => version.prerelease?.includes('alpha') ? alphaVersions.push(version) : sortedVersions.push(version))
            debugLogVersionsArray('Detected alpha versions', alphaVersions);
            sortedVersions.push(...alphaVersions);
            debugLogVersionsArray('Computed sorted versions', sortedVersions);

            component.versions = sortedVersions;
        }

        logComponentsVersions('Sort done', contentCatalog);
    })

    // hack, log as info, bug logs are only produced if the debug level is enable (avoid function duplication)
    function debugLogVersionsArray(message, versions) {
        if(!logger.isLevelEnabled('debug')) {
            return;
        }
        logVersionsArray(message, versions);
    }

    function logVersionsArray(message, versions) {
        if(!logger.isLevelEnabled('info')) {
            return;
        }
        logger.info(`${message} %o`, versions.map(v => {
            return {
                version: v.version,
                displayVersion: v.displayVersion
            }
        }));
    }

    function logComponentsVersions(message, contentCatalog) {
        if(!logger.isLevelEnabled('info')) {
            return;
        }
        logger.info(message);
        contentCatalog.getComponents().forEach(component => {
            logVersionsArray(`Component ${component.name} versions`, component.versions);
        });
    }
}
