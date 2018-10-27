const path = require("path");
const loader = require('../');



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

console.log = jest.fn(()=>{});

describe("json glob loader", () => {

  beforeEach(()=> {
    console.log.mockClear();
  });

  test("returns empty object when json empty JSON is used", () => {
    expect(load("{}", opts).trim()).toBe("{}");
  });

  test("returns same JSON when no globable string found", () => {
    const input = {
      var1: "some data",
      var2: [1, 2, 3, "4"],
      var3: true,
      var4: {
        "var4.1": "nothing to see"
      }
    };
    expect(load(JSON.stringify(input), opts)).toBe(JSON.stringify(input));
  });
  test("returns resolved paths injected on the glob-ed array", () => {
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
    expect(load(JSON.stringify(input), opts)).toBe(JSON.stringify(expected));
  });
  test("returns resolved paths injected on the glob-ed array with mixed content", () => {
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
    expect(load(JSON.stringify(input), opts)).toBe(JSON.stringify(expected));
  });
  test("omits an out of array string, even if glob path works when transformStringsToArray === false", () => {
    const input = {
      var1: "*"
    };
    const expected = {
      var1: "*"
    };
    expect(load(JSON.stringify(input), opts)).toBe(JSON.stringify(expected));
    expect(console.log.mock.calls.length).toEqual(1);
  });
  test("replace string with array when a glob pattern is pass on a string and transformStringsToArray === true", () => {
    const input = {
      var1: "foo*"
    };
    const expected = {
      var1: ["foo.1", "foo.2"]
    };
    expect(
      load(JSON.stringify(input), {
        ...opts,
        transformStringsToArray: true
      })
    ).toBe(JSON.stringify(expected));
    expect(console.log.mock.calls.length).toEqual(0);
  });
  test("return a single item array when only one item matches", () => {
    const input = {
      var1: ["*.1"]
    };
    const expected = {
      var1: ["foo.1"]
    };
    expect(load(JSON.stringify(input), opts)).toBe(JSON.stringify(expected));
  });
  test("return an array when a string matches a path and transformStringsToArray === true", () => {
    const opts2 = { ...opts, transformStringsToArray: true};
    const input = {
      var1: "*"
    };
    const expected = {
      var1: ["bar", "foo.1", "foo.2"]
    };
    expect(load(JSON.stringify(input), opts2)).toBe(JSON.stringify(expected));
  });
  test("passes by and apply globOptions", () => {
    const opts2 = { ...opts, globOptions : { ignore : "**/foo.2" } };
    const input = {
      var1: ["*"]
    };
    const expected = {
      var1: ["bar", "foo.1"]
    };

    expect(load(JSON.stringify(input), opts2)).toBe(JSON.stringify(expected));
  });

  test("should warn if a path is found outside an array, and return unresolved", () => {
    const input = {
      var1: "foo*"
    };
    const expected = {
      var1: "foo*"
    };
    expect(load(JSON.stringify(input), opts)).toBe(JSON.stringify(expected));
    expect(console.log.mock.calls.length).toEqual(1);
  });
  test("should *not* warn if an string is found outside an array, not resolving to a file, and return unresolved", () => {
    const input = {
      var1: "not-file*"
    };
    const expected = {
      var1: "not-file*"
    };
    expect(load(JSON.stringify(input), opts)).toBe(JSON.stringify(expected));
    expect(console.log.mock.calls.length).toEqual(0);
  });
});
