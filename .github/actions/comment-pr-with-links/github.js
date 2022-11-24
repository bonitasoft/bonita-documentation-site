module.exports = {
    isCommentExist: async function ({github, context, template}) {
        const {data: comments} = await github.rest.issues.listComments({
            owner: context.repo.owner,
            issue_number: context.issue.number,
            repo: context.repo.repo,
        });
        for (const comment of comments) {
            if (comment.body?.startsWith(template)) {
                return {
                    exists: true,
                    id: comment.id,
                    body: comment.body
                };
            }
        }

        return {
            exists: false,
            id: null,
            body: ''
        };
    },
    createComment: async function ({github, context, body}) {
        const comment = await github.rest.issues.createComment({
            issue_number: context.issue.number,
            owner: context.repo.owner,
            repo: context.repo.repo,
            body: body
        })
        return comment?.id;
    },
    updateComment: async function ({github, context, body, comment_id}) {
        const comment = await github.rest.issues.updateComment({
            comment_id: comment_id,
            owner: context.repo.owner,
            repo: context.repo.repo,
            body: body
        })
        return comment?.id;
    },
    deleteComment: async function ({github, context, commentIdToDelete}) {
        await github.rest.issues.deleteComment({
            issue_number: context.issue.number,
            owner: context.repo.owner,
            repo: context.repo.repo,
            comment_id: commentIdToDelete,
        });
    }
}



