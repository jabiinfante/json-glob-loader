[![npm][npm]][npm-url]
[![Build Status](https://travis-ci.com/jabiinfante/json-glob-loader.svg?branch=master)](https://travis-ci.com/jabiinfante/json-glob-loader)

# json-glob-loader

A loader for webpack that analyzes any JSON searching for file paths using (glob)[https://www.npmjs.com/package/glob]'s patterns, so they will be replaced inside the JSON.

Assuming this file tree:
```console
└── my-files-dir
    ├── a.foo
    ├── a2.foo
    └── b.foo
```

This simple a JSON with this content:
```json
{
  "foo":true,
  "files":[
    "*"
  ],
  "some-more": {
    "data": [
      "first",
      "a*",
      "last"
    ]
  }
}
```

Will be loaded as:
```json
{
  "foo":true,
  "files":[
    "a.foo",
    "a2.foo"
    "b.foo"
  ],
  "some-more": {
    "data": [
      "first",
      "a.foo",
      "a2.foo",
      "last"
    ]
  }
}
```

## Getting Started

To begin, you'll need to install `json-glob-loader`:

```console
$ npm install json-glob-loader --save-dev
```


Then add the loader to your `webpack` config. For example:

```js
import myFile from '../wherever/my/json/is/config.js';
```

```js
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /config\.json$/,
        use: [{
          loader: 'json-glob-loader',
          options: {
            baseDir: path.join(__dirname, 'my-files-dir/'),
          }
        }]
      }
    ]
  }
}
```

## config

* **baseDir**<string>: baseDir from where glob will be applied (omitted from the resultant JSON declaration).
* **transformStringsToArray**<boolean>: if set to true, will replace strings outside Arrays, transforming this into Arrays (optional, false by default).

## testing

```
$ npm test
```



## License

#### [MIT](./LICENSE)

[npm]: https://img.shields.io/npm/v/json-glob-loader.svg
[npm-url]: https://npmjs.com/package/json-glob-loader
