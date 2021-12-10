module.exports.register = function () {
    // see https://github.com/pinojs/pino/blob/master/docs/api.md
    const logger = this.getLogger('bonita-versions-sorter');

    this.on('contentClassified', ({contentCatalog}) => {
        logger.info('Start sorting');

        for (const component of contentCatalog.getComponents()) {
            logger.info('Processing component %s', component.name);
            logVersionsArray('Original version order', component.versions);
            const sortedVersions = [];
            const alphaVersions = [];

            component.versions.forEach(version => version.prerelease?.includes('alpha') ? alphaVersions.push(version) : sortedVersions.push(version))
            logVersionsArray('Detected alpha versions', alphaVersions);
            sortedVersions.push(...alphaVersions);
            logVersionsArray('Computed sorted versions', sortedVersions);

            component.versions = sortedVersions;
        }

        logComponentsVersions('Sort done', contentCatalog);
    })

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
