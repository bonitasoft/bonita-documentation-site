'use strict'

module.exports.register = function () {
    const logger = this.getLogger('bonita-next-version');

    this.once('contentClassified', ({ playbook, contentCatalog }) => {
        logger.info('Start next-version-extension');

        contentCatalog.getComponents().forEach((component) => {
            logger.info('Processing component %s', component.name);
            logger.info('component=');
            logger.info(component);
            let latestVersion = component.latest?.version;
            logger.info('latestVersion=' + latestVersion);
            let nextVersion = component.latestPrerelease?.version;
            logger.info('nextVersion=' + nextVersion);

            component.versions.forEach((version) => {
                logger.info('version=' + version.version);

                if (version.version === latestVersion) {
                    logger.info('latest!');
                    version.asciidoc.attributes['page-is-latest-release'] = true;
                }
                if (version.version === nextVersion) {
                    logger.info('next!');
                    version.asciidoc.attributes['page-is-next-release'] = true;
                }
             })
        })
    })
}
