# CL8 Plugins

Place your plugins in subdirectories here.

## Plugin Structure

```
plugins/
  my-plugin/
    manifest.json   # Plugin manifest
    index.js        # Entry point (compiled JS)
    node_modules/   # Plugin dependencies
```

## Manifest Example

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "My awesome plugin",
  "author": "",
  "license": "MIT",
  "entry": "index.js"
}
```
