// Extension to print the component + version that will be processed
// Inspired by https://antora.zulipchat.com/#narrow/stream/282405-tips-.F0.9F.92.A1/topic/Show.20all.20components.20and.20versions.20processed.20when.20building
// And review with content of https://docs.antora.org/antora/latest/extend/extension-use-cases/#list-discovered-component-versions

'use strict'

module.exports.register = function () {
  // see https://github.com/pinojs/pino/blob/master/docs/api.md
  const logger = this.getLogger('bonita-log-aggregated-component');

  this.once('contentAggregated', ({ contentAggregate }) => {
    logger.info('Discovered the following component versions')
    contentAggregate.forEach((bucket) => {
      logger.info(`name: ${bucket.name}, version: ${bucket.version}, files: ${bucket.files.length}`)
      if (logger.isLevelEnabled('debug')) {
        const sources = bucket.origins.map(({url, refname}) => ({url, refname}));
        logger.debug('sources: %o', sources);
      }
    })
  })
}
