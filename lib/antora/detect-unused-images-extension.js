// detect-unused-images-extension.js
const fs = require('fs');
const path = require('path');


module.exports.register = function () {
    const logger = this.getLogger('detect-unused-images');

    this.once('contentClassified', ({ contentCatalog }) => {
        const imageReferences = new Set();
        const imageFiles = new Set();

        // Collect all image references from the content files
        // contentCatalog.getPages().forEach(page => {
        //    console.log(page.con);
        // });

        contentCatalog.getFiles()
            .filter(file => file.src.family === 'page')
            .forEach(file => {
            const imageMatches = file.contents.toString().match(/image::?([^\[]+)/g) || [];
            imageMatches.forEach(match => {
                const imagePath = match.replace(/image::?/g, '').trim();
                imageReferences.add(imagePath);
            });
        });

        imageReferences.forEach(img => {
            if(img.includes('case_overview_update_mode-ascii.cast')){
                console.log(img);
            }
        })

        logger.info('Found %s images references', imageReferences.size)

        contentCatalog.getFiles()
            .filter(file => file.src.family === 'image' && file.src.extname !== '.cast')
            .forEach(img => {
                if(!imageReferences.has(img.src.relative.toString())){
                    logger.error('Unused images detected %s', img.src.relative)
                }
            })
    });
};
