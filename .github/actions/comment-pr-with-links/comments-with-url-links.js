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
        result.updated = prepareLinks({files: FILES.split(' '), siteUrl: SITE_URL, component: COMPONENT_NAME, branch: pr.base.ref});
        result.deleted = prepareLinks({files: DELETED.split(' '), siteUrl: SITE_URL, component: COMPONENT_NAME, branch: pr.base.ref});
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
    const preface =
        'In order to merge this pull request, you need to check your updates with the following url.\n\n';

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

function prepareLinks({files, siteUrl, component, branch}) {
    let preparedLinks = [];
    files.forEach(file => {
        const splitPath = file.split('/');
        splitPath.shift();
        const pageName = splitPath.pop();
        const moduleName = splitPath.shift();
        let url = `${siteUrl}/${component}/${branch}${moduleName === 'ROOT' ? '/' : `/${moduleName}/`}${pageName?.split('.').shift()}`;
        preparedLinks.push(`- [ ] [${moduleName}/${pageName}](${url})`);
    });
    return preparedLinks.join('\n');
}
