import {setFailed} from '@actions/core';
import {listUrl} from './build-url';

/**
 * Entrypoint for action.
 */
export async function entrypoint() {
  try {
    await listUrl();
  } catch (error: unknown) {
    setFailed(error as Error);
  }
}

void entrypoint();
