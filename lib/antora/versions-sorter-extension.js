module.exports.register = function () {
    const logger = this.getLogger('bonita-versions-sorter');

    this.on('contentClassified', ({contentCatalog, siteCatalog, uiCatalog}) => {
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
        // TODO only log if info enabled
        logger.info(`${message} %s`, versions.map(v => v.version));
        // TODO log version and displayVersion
        // {
        //     a: v.version;
        //     b: v.displayVersion;
        // }));
    }

    function logComponentsVersions(message, contentCatalog) {
        // TODO only log if info enabled
        logger.info(message);
        contentCatalog.getComponents().forEach(component => {
            logVersionsArray(`Component ${component.name} versions`, component.versions);
        });
    }
}
