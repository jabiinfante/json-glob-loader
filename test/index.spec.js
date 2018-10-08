const should = require("should");
const loader = require("../index");
const path = require("path");

function load(content, params) {
  const options = {
    cacheable: () => {},
    addDependency: () => {},
    context: __dirname
  };
  options.query = params;

  return loader.call(options, content);
}
const opts = { baseDir: path.join(__dirname, "files/") };

describe("json glob loader", () => {
  it("returns empty objectn whe json empty JSON is used", () => {
    load("{}", opts)
      .trim()
      .should.equal("{}");
  });

  it("returns same JSON when no globable string found", () => {
    const input = {
      var1: "some data",
      var2: [1, 2, 3, "4"],
      var3: true,
      var4: {
        "var4.1": "nothing to see"
      }
    };
    load(JSON.stringify(input), opts).should.equal(JSON.stringify(input));
  });
  it("returns resolved paths injected on the glob-ed array", () => {
    const input = {
      var1: "some data",
      var2: ["*"],
      var4: {
        "var4.1": "nothing to see"
      }
    };
    const expected = {
      var1: "some data",
      var2: ["bar", "foo.1", "foo.2"],
      var4: {
        "var4.1": "nothing to see"
      }
    };
    load(JSON.stringify(input), opts).should.equal(JSON.stringify(expected));
  });
  it("returns resolved paths injected on the glob-ed array with mixed content", () => {
    const input = {
      var1: "some data",
      var2: ["first", "*", "last"],
      var4: {
        "var4.1": "nothing to see"
      }
    };
    const expected = {
      var1: "some data",
      var2: ["first", "bar", "foo.1", "foo.2", "last"],
      var4: {
        "var4.1": "nothing to see"
      }
    };
    load(JSON.stringify(input), opts).should.equal(JSON.stringify(expected));
  });
  it("omits an out of array string, even if glob path works when transformStringsToArray === false", () => {
    const input = {
      var1: "*"
    };
    const expected = {
      var1: "*"
    };
    load(JSON.stringify(input), opts).should.equal(JSON.stringify(expected));
  });
  it("replace string with array when a glob pattern is pass on a string and transformStringsToArray === true", () => {
    const input = {
      var1: "foo*"
    };
    const expected = {
      var1: ["foo.1", "foo.2"]
    };
    load(JSON.stringify(input), {
      ...opts,
      transformStringsToArray: true
    }).should.equal(JSON.stringify(expected));
  });
});
