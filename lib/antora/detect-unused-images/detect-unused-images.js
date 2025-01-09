/**
 * Registers the detect-unused-images extension.
 *
 * @param {Object} config - The configuration object.
 * @param {Array<string>} [config.excludeimageextension] - List of image extensions to exclude from detection.
 * @param {boolean} [config.failonerror] - Flag to determine if the process should exit with an error on unused images.
 */
module.exports.register = function ({config}) {
    const logger = this.getLogger('detect-unused-images');
    console.log(config);
    config ? logger.info('Override default configuration with %s', JSON.stringify(config, null, 2)) : logger.info('Prepare with default configuration') ;

    const failOnError = config.failonerror;
    const log = failOnError ? logger.error.bind(logger) : logger.warn.bind(logger);

    this.once('contentClassified', ({ contentCatalog  }) => {
        const imageReferences = new Set();
        const unusedImage = new Set();

        // Initialize the set of extensions to ignore, including '.cast'
        let extensionToIgnore = new Set([ '.cast']);

        // If excludeimageextension is provided, merge it with the default extensions to ignore
        if(config.excludeimageextension){
            extensionToIgnore = new Set([...config.excludeimageextension, ...extensionToIgnore]);
        }

        logger.info('Start unused images detection')
        logger.info('Assets with extensions will be ignore %s', Array.from(extensionToIgnore))

        // Identify unused images by comparing with the collected references
        contentCatalog.getFiles()
            .filter(file => file.src.family === 'page')
            .forEach(file => {
            const imageMatches = file.contents.toString().match(/image::?([^\[]+)/g) || [];
            imageMatches.forEach(match => {
                const imagePath = match.replace(/image::?/g, '').trim();
                imageReferences.add(imagePath);
            });
        });

        logger.info('Found %s images references', imageReferences.size)

        contentCatalog.getFiles()
            .filter(file => file.src.family === 'image' && !extensionToIgnore.has(file.src.extname))
            .forEach(img => {
                if(!imageReferences.has(img.src.relative.toString())){
                    unusedImage.add(img)
                    log('[%s] [%s] %s', img.src.component, img.src.version,img.src.path)
                }
            })
        logger.info('Finish and detecting %s unused images', unusedImage.size);

        // If failOnError is true and there are unused images, log an error and exit the process
        if( failOnError && unusedImage.size > 0 ){
            log('Some image are not used, check the previous logs and delete the unused images.')
            process.exit(1);
        }
    });
};
