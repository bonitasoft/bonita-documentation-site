import {createPrComment, getPullRequest} from './github';
import {getInput} from '@actions/core';

export function generateUrl(
  prRef: string,
  siteUrl: string,
  files: Array<string>,
  componentName: string
) {
  const urls: string[] = [];
  files.forEach(file => {
    const splitted = file.split('/');
    splitted.shift();
    const pageName = splitted.pop();
    const moduleName = splitted.shift();

    urls.push(
      `- ${siteUrl}/${componentName}/${prRef}${
        moduleName === 'ROOT' ? '/' : `/${moduleName}/`
      }${pageName?.split('.').shift()}`
    );
  });
  return urls.join('\n');
}

export async function getAllLinks(): Promise<string> {
  const pr = await getPullRequest();
  const prRef = pr.base.ref;
  const files: Array<string> = getInput('files').split(' ');
  const siteUrl = getInput('siteUrl');
  const componentName = getInput('componentName');
  return generateUrl(prRef, siteUrl, files, componentName);
}

export async function listUrl() {
  await createPrComment();
}
