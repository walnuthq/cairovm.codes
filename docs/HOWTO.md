# Documentation How-To

## Sierra LibFuncs

Each Sierra libfunc is described in its own mdx file, where the filename is the name of the libfunc. For example,`alloc_local.mdx` for the `alloc_local` libfunc.

Each mdx file is composed of:

- a header of metadata with the following shape:

```
---
shortDescription: A short description of the function
invokeRefs: A string of invokeRefs separated by a | (like "[0] | [1]")
resultRefs: see invokeRefs
ouputRefs: see invokeRefs
---
```

- a content which is the body of the mdx file.
