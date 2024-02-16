'use strict'

module.exports.register = function () {
    const logger = this.getLogger('bonita-version-alias');

    this.once('contentClassified', ({ playbook, contentCatalog }) => {
        // see https://github.com/pinojs/pino/blob/master/docs/api.md
        logger.info('Start version alias computation');

        // from https://antora.zulipchat.com/#narrow/stream/282400-users/topic/.E2.9C.94.20Get.20latest.20version.20segment.20in.20template
        const latestVersionSegment = playbook.urls.latestVersionSegment;
        const latestPrereleaseVersionSegment = playbook.urls.latestPrereleaseVersionSegment; // latest_prerelease_version_segment
        logger.info('Playbook latestVersionSegment %s', latestVersionSegment)
        logger.info('Playbook latestPrereleaseVersionSegment %s', latestPrereleaseVersionSegment)

        contentCatalog.getComponents().forEach((component) => {
            logger.info('Processing component %s', component.name);
            let latestVersion = component.latest?.version;
            logger.info(`latestVersion=${latestVersion}`);
            let nextVersion = component.latestPrerelease?.version;
            logger.info(`nextVersion=${nextVersion}`);

            component.versions.forEach((version) => {
                logger.info(`Checking version ${version.version}`);
                logger.debug(version);

                // Do not add the latest/next alias when the actual version already references this value
                if (version.version === latestVersion && version.version !== latestVersionSegment) {
                    logger.info('--> add alias: %s', latestVersionSegment);
                    version.asciidoc.attributes['page-version-alias'] = latestVersionSegment;
                }
                if (version.version === nextVersion && version.version !== latestPrereleaseVersionSegment) {
                    logger.info('--> add alias: %s', latestPrereleaseVersionSegment);
                    version.asciidoc.attributes['page-version-alias'] = latestPrereleaseVersionSegment;
                }
             })
            logger.info('Done processing component %s', component.name);
        })

        logger.info('Done version alias computation');
    })
}
