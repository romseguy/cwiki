// https://www.npmjs.com/package/is_ts
interface IRegexes {
  ipv4: RegExp;
  ipv6: RegExp;
}

const regexes: IRegexes = {
  ipv4: /^(?:(?:\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])\.){3}(?:\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])$/,
  ipv6: /^((?=.*::)(?!.*::.+::)(::)?([\dA-F]{1,4}:(:|\b)|){5}|([\dA-F]{1,4}:){6})((([\dA-F]{1,4}((?!\3)::|:\b|$))|(?!\2\3)){2}|(((2[0-4]|1\d|[1-9])?\d|25[0-5])\.?\b){4})$/i
};

function not(func: any): any {
  return function () {
    return !func.apply(null, Array.prototype.slice.call(arguments));
  };
}

function existy(value: any) {
  return value != null;
}

function ipAddress(value: any) {
  if (!value) return false;
  return (
    (existy(value) && regexes.ipv4.test(value)) || regexes.ipv6.test(value)
  );
}

function object(value: any) {
  return Object(value) === value;
}

function string(value: any) {
  return Object.prototype.toString.call(value) === "[object String]";
}

export const is = {
  existy,
  ipAddress,
  object,
  string,
  not: {
    existy: not(existy),
    ipAddress: not(ipAddress),
    object: not(object),
    string: not(string)
  }
};
