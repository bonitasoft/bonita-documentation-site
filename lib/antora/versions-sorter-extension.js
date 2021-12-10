module.exports.register = function () {
    this.on('contentClassified', ({contentCatalog, siteCatalog, uiCatalog}) => {
        console.info('XXXXCustom extension');
        // console.info('context catalog', contentCatalog);
        // console.info('site catalog', siteCatalog);
        // console.info('ui catalog', uiCatalog);


        for (const component of contentCatalog.getComponents()) {
            console.info('component', component.name);
            // console.info('original version order', component.versions.map(v => v.version));
            logVersionsArray('original version order', component.versions);
            // {
            //     a: v.version;
            //     b: v.displayVersion;
            // }));
            const sortedVersions = [];
            const alphaVersions = [];

            // component.versions.reverse() // or do whatever you need to do here
            // console.info('component versions', component.versions);

            for (const version of component.versions) {
                console.info('Version', version.version)
                if (version.prerelease) {
                    console.info('!!prerelease');
                    if (version.prerelease?.includes('alpha')) {
                        console.info('@@alpha prerelease');
                    }
                }

                // TODO ternary operator
                if (version.prerelease?.includes('alpha')) {
                    alphaVersions.push(version);
                } else {
                    sortedVersions.push(version);
                }

            }
            logVersionsArray('alpha versions', alphaVersions);
            sortedVersions.push(...alphaVersions);
            logVersionsArray('sorted versions', sortedVersions);

            component.versions = sortedVersions;
        }

        console.info('After version change')
        logComponentsVersions('After version change', contentCatalog);
    })

    // this.on('navigationBuilt', function ({contentCatalog, navigationCatalog}) {
    //     logComponentsVersions('IN navigationBuilt', contentCatalog);
    //     console.info('navigationCatalog', navigationCatalog);
    //
    // });

    function logVersionsArray(message, versions) {
        console.info(message, versions.map(v => v.version));
    }

    function logComponentsVersions(message, contentCatalog) {
        console.info(message);
        contentCatalog.getComponents().forEach(component => {
            console.info('component', component.name);
            logVersionsArray('versions', component.versions);
        });
    }
}
