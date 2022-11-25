const githubUtils = require('./github');
const templateCommentId= '<!-- previewLinksCheck-->\n';
module.exports = {
    prepareUrlLinks:  async function ({github, context}) {
            let {FILES, SITE_URL, COMPONENT_NAME} = process.env;
            const {data: pr} = await github.rest.pulls.get({
                owner: context.repo.owner,
                pull_number: context.issue.number,
                repo: context.repo.repo,
            });
            let files = FILES.split(' ');
            let urls = [];
            files.forEach(file => {
                const splitted = file.split('/');
                splitted.shift();
                const pageName = splitted.pop();
                const moduleName = splitted.shift();
                let url = `${SITE_URL}/${COMPONENT_NAME}/${pr.base.ref}${moduleName === 'ROOT' ? '/' : `/${moduleName}/`}${pageName?.split('.').shift()}`;
                urls.push(`- [ ] [${moduleName}/${pageName}](${url})`);
            });
            return urls.join('\n');
    },
    createOrUpdateComments: async function ({github,context}){
        let {LINKS, RENAMED_FILES, HAS_DELETED_FILES} = process.env;
        const header='## :memo: Check the pages that have been modified\n\n';
        let body = buildMessage(header,LINKS,HAS_DELETED_FILES === 'true' || RENAMED_FILES != '');
        const {exists, id} = await githubUtils.isCommentExist({github,context,template: templateCommentId});
        // Delete oldest comment if another comments exist
        if (exists && id){
            await githubUtils.updateComment({github,context,comment_id: id, body});
            return id;
        }
        const comment = await githubUtils.createComment({github,context, body});
        return comment?.id;
    }

};

function buildMessage(header,links,hasWarningMessage){
    const preface =
        'In order to merge this pull request, you need to check your updates with the following url.\n\n';

    const availableLinks = `### :mag: Page list: \n ${links}\n\n\n\n`;

    let warningAliasMessage = '';
    if(hasWarningMessage){
        warningAliasMessage='\n \n ### :warning: At least one page has been deleted in the Pull Request. Make sure to add [aliases](https://github.com/bonitasoft/bonita-documentation-site/blob/master/docs/content/CONTRIBUTING.adoc#use-alias-to-create-redirects)'
    }

    return templateCommentId + header + preface + availableLinks + warningAliasMessage;
}
