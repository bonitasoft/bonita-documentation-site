// detect-unused-images-extension.js
module.exports.register = function () {
    const logger = this.getLogger('bonita-detect-unused-images');

    this.once('contentClassified', ({ contentCatalog }) => {
        const imageReferences = new Set();
        const unusedImage = new Set();
        logger.info('Start unused images detection')
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
            .filter(file => file.src.family === 'image' && file.src.extname !== '.cast')
            .forEach(img => {
                if(!imageReferences.has(img.src.relative.toString())){
                    unusedImage.add(img)
                    logger.warn('[%s] [%s] %s', img.src.component, img.src.version,img.src.path)
                }
            })
        logger.info('Finish and detecting %s unused images', unusedImage.size)
    });
};
