const githubUtils = require('./github');
const template = '<!-- previewLinksCheck-->\n';
module.exports = {
    prepareUrlLinks: async function ({github, context}) {
        let {FILES,DELETED, SITE_URL, COMPONENT_NAME} = process.env;
        const {data: pr} = await github.rest.pulls.get({
            owner: context.repo.owner,
            pull_number: context.issue.number,
            repo: context.repo.repo,
        });
        let result = {};
        // We only have a single version for preview (latest)
        // TODO: Handle "pre-release" (next)
        let version = 'latest';
        result.updated = prepareLinks({files: FILES.split(' '), siteUrl: SITE_URL, component: COMPONENT_NAME, version: version});
        result.deleted = prepareLinks({files: DELETED.split(' '), siteUrl: SITE_URL, component: COMPONENT_NAME, version: version});
        return result;
    },
    createOrUpdateComments: async function ({github, context}) {
        let {LINKS, HAS_DELETED_FILES} = process.env;
        const header = '## :memo: Check the pages that have been modified \n\n';
        let links = JSON.parse(LINKS);
        let body = buildMessage({header, links ,hasWarningMessage : (HAS_DELETED_FILES === 'true')});
        const {exists, id} = await githubUtils.isCommentExist({github, context, template});
        // Delete oldest comment if another comments exist
        if (exists && id) {
            await githubUtils.updateComment({github, context, comment_id: id, body});
            return id;
        }
        const comment = await githubUtils.createComment({github, context, body});
        return comment?.id;
    }
};

function buildMessage({header, links, hasWarningMessage}) {
    const preface = 'In order to merge this pull request, you need to check your updates with the following url.\n\n';

    const availableLinks = `### :mag: Updated pages 
The following pages were updated, please ensure that the display is correct:
${links.updated}
`;
    let warningAliasMessage = '';
    if (hasWarningMessage) {
        warningAliasMessage = `
### :warning: Check redirects
At least one page has been renamed, moved or deleted in the Pull Request. Make sure to add [aliases](https://github.com/bonitasoft/bonita-documentation-site/blob/master/docs/content/CONTRIBUTING.adoc#use-alias-to-create-redirects) and verify that the following links redirect to the right location:          
${links?.deleted}`
    }

    return template + header + preface + availableLinks + warningAliasMessage;
}

function prepareLinks({files, siteUrl, component, version}) {
    let preparedLinks = [];
    files.forEach(file => {
        const regex = /modules\/(.*?)\/pages\/(.*?).adoc/;
        const match = file.match(regex);
        if (match) {
            let moduleName = match[1] === 'ROOT' ? '' : `/${match[1]}`;
            let url = `${siteUrl}/${component}/${version}${moduleName}/${match[2]}`;
            preparedLinks.push(`- [ ] [${moduleName}/${match[2]}](${url})`);
        }
    });
    return preparedLinks.join('\n');
}
