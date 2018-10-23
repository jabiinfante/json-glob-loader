const glob = require("glob"),
  path = require("path");
(getOptions = require("loader-utils").getOptions),
  (validateOptions = require("schema-utils"));

const schema = {
  type: "object",
  properties: {
    transformStringsToArray: {
      type: "boolean",
      default: false
    },
    baseDir: {
      type: "string"
    },
    globOptions : {
      type: "object",
      default: {}
    }
  }
};

module.exports = function(source) {
  const options = getOptions(this);
  validateOptions(schema, options, "json-glob Loader");
  let data = typeof source === "string" ? JSON.parse(source) : source;
  data = JSON.stringify(resolveGlob(data, options))
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
  return `${data}`;
};

function resolveGlob(data, options) {
  if (Array.isArray(data)) {
    return data.reduce((acc, _cur) => {
      const _procData = resolveGlob(_cur, options);
      if (Array.isArray(_procData) && typeof _cur === "string") {
        acc.push(..._procData);
      } else {
        acc.push(_procData);
      }
      return acc;
    }, []);
  } else if (typeof data === "object") {
    return Object.keys(data).reduce((acc, key) => {
      const _procData = resolveGlob(data[key], options);
      if (
        !options.transformStringsToArray &&
        typeof data[key] === "string" &&
        Array.isArray(_procData)
      ) {
        acc[key] = data[key];
        console.log("A path has been found outside an array.");
        console.log("You might need to use 'transformStringsToArray' option.");
      } else {
        acc[key] = _procData;
      }
      return acc;
    }, {});
  } else if (typeof data === "string") {
    const items = glob
      .sync(path.join(options.baseDir, data), options.globOptions)
      .map(_path => _path.substr(options.baseDir.length));
    // If glob returns nothing, let's assume no glob expression is used
    return items.length && items.length >= 1 ? items : data;
  } else {
    return data;
  }
}
