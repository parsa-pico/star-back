class Config {
  static isValid(array) {
    if (!Array.isArray(array)) return false;
    for (let obj of array) {
      if (!obj.link || !obj.type) return false;
    }
    return true;
  }
  static encodeBase64(str) {
    return Buffer.from(str, "utf-8").toString("base64");
  }
  static configType(config) {
    const end = config.indexOf("://");

    return config.slice(0, end);
  }
  static vmessDecode(vmessConfig) {
    let config = vmessConfig.slice(8);
    config = Buffer.from(config, "base64").toString("utf-8");
    config = JSON.parse(config);

    return config;
  }
  static vlessGetAddress(config) {
    const start = config.indexOf("@") + 1;
    const slice = config.slice(start);
    const end = slice.indexOf(":");
    const portStart = end + 1;
    const portEnd = slice.indexOf("?");
    const port = slice.slice(portStart, portEnd);
    const add = slice.slice(0, end);
    return [add, port];
  }
  static strConfigsToArray(str) {
    let array = str.split("\n");
    array = array.map((str) => str.trim());
    let configs = array.filter((str) => Config.isConfig(str));
    return configs;
  }

  static isConfig(str) {
    const patterns = ["vmess", "vless", "trojan", "ss"];
    for (let pattern of patterns) {
      if (str.startsWith(pattern)) return true;
    }
    return false;
  }
}
module.exports = Config;
