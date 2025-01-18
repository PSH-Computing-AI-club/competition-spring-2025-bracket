// We want a script file to collect all of the depenedencies we are using
// so that Deno can easily cache them ahead-of-time rather than just-in-time.

import '@octokit/app';
import '@octokit/auth-app';
import '@std/path';
import '@std/random';
import 'preact';
import 'preact-render-to-string';
import 'slug';
