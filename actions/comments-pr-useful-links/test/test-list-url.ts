import * as github from '../src/github';
import {SinonStub, stub} from 'sinon';

import {deepStrictEqual} from 'assert';
import {generateUrl, getAllLinks} from '../src/build-url';

describe('CommentsUrlPr tests', () => {
  let createPrCommentStub: SinonStub;
  let getPullRequest: SinonStub;

  before(() => {
    createPrCommentStub = stub(github, 'createPrComment');
    getPullRequest = stub(github, 'getPullRequest');
  });

  after(() => {
    createPrCommentStub.restore();
    getPullRequest.restore();
  });

  const files = [
    'modules/applications/pages/appearance.adoc',
    'modules/process/pages/actors.adoc',
    'modules/ROOT/pages/bonita-bpm-applications-urls.adoc',
  ];
  const siteUrl = 'https://documentation.bonitasoft.com';
  const tests = [
    {
      args: '2022.1',
      files: files,
      siteUrl: siteUrl,
      componentName: 'bonita',
      expected:
        '- https://documentation.bonitasoft.com/bonita/2022.1/applications/appearance\n- https://documentation.bonitasoft.com/bonita/2022.1/process/actors\n- https://documentation.bonitasoft.com/bonita/2022.1/bonita-bpm-applications-urls',
    },
    {
      args: '2022.1',
      files: files,
      siteUrl: siteUrl,
      componentName: 'bcd',
      expected:
        '- https://documentation.bonitasoft.com/bcd/2022.1/applications/appearance\n- https://documentation.bonitasoft.com/bcd/2022.1/process/actors\n- https://documentation.bonitasoft.com/bcd/2022.1/bonita-bpm-applications-urls',
    },
    {
      args: '2023.1',
      files: files,
      siteUrl: siteUrl,
      componentName: 'bonita',
      expected:
        '- https://documentation.bonitasoft.com/bonita/2023.1/applications/appearance\n- https://documentation.bonitasoft.com/bonita/2023.1/process/actors\n- https://documentation.bonitasoft.com/bonita/2023.1/bonita-bpm-applications-urls',
    },
  ];

  tests.forEach(({args, siteUrl, files, componentName, expected}) => {
    it(`should pass or fail linting ['${args}', ${files}, ${siteUrl}, ${componentName}, '${expected}']`, async () => {
      deepStrictEqual(
        generateUrl(args, siteUrl, files, componentName),
        expected
      );
    });
  });
});
