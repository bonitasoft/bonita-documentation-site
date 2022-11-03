import {context, getOctokit} from '@actions/github';
import {getInput, setSecret} from '@actions/core';
import {GitHub} from '@actions/github/lib/utils';
import {getAllLinks} from './build-url';

let octokit: InstanceType<typeof GitHub>;
let once = false;
const HEADER = '## Pull request files update :memo:\n\n';

function getClient(): InstanceType<typeof GitHub> {
  if (once) return octokit;
  const token = getInput('token');
  setSecret(token);

  octokit = getOctokit(token);
  once = true;
  return octokit;
}

export async function getPullRequest() {
  const {data: pr} = await getClient().rest.pulls.get({
    owner: context.repo.owner,
    pull_number: context.issue.number,
    repo: context.repo.repo,
  });

  return pr;
}

export async function buildMessage(): Promise<string> {
  const preface =
    'In order to merge this pull request, you need to check your updates with the following url.\n\n';

  const availableLinks = `### Url to check: \n ${await getAllLinks()}\n\n\n\n`;

  return HEADER + preface + availableLinks;
}

type CommentExists = {
  exists: boolean;
  id: number | null;
};

async function isCommentExists(): Promise<CommentExists> {
  const {data: comments} = await getClient().rest.issues.listComments({
    owner: context.repo.owner,
    issue_number: context.issue.number,
    repo: context.repo.repo,
  });

  for (const comment of comments) {
    if (comment.body?.startsWith(HEADER)) {
      return {
        exists: true,
        id: comment.id,
      };
    }
  }

  return {
    exists: false,
    id: null,
  };
}

export async function createPrComment() {
  const body = await buildMessage();
  const {exists, id} = await isCommentExists();
  // Delete oldest comment if another comments exist
  if (exists && id) {
    await getClient().rest.issues.deleteComment({
      owner: context.repo.owner,
      issue_number: context.issue.number,
      repo: context.repo.repo,
      comment_id: id,
    });
  }
  await getClient().rest.issues.createComment({
    owner: context.repo.owner,
    issue_number: context.issue.number,
    repo: context.repo.repo,
    body,
  });
}
