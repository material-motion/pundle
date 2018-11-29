This is a fork of [`pundle-dev@2.0.0-beta12`](https://github.com/steelbrain/pundle/commit/6f6918b42b68f4d57e346437eea301eb1837d040#diff-52d4bf43db96176e77cc9038a78f98e1).

That version of pundle has a dependency on `uws@0.12`, which was unfortunately unpublished from npm.  This breaks `yarn --flat`, which complains:

```
error Couldn't find any versions for "uws" that matches "^0.12.0"
```

This fork is [**identical to what's on npm**](http://unpkg.com/pundle-dev@2.0.0-beta12), but with the **broken dependency bumped to a version that still exists**.

[`material-motion-demos-react`](https://github.com/material-motion/material-motion-js/tree/develop/packages/demos-react) should be migrate its dev server to [`bazel`](https://github.com/alexeagle/angular-bazel-example), at which time **this repo will likely be deleted**.
