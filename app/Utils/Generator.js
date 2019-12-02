const moment = require("moment");

class Generator {
  static chunkString(str, length) {
    return str.match(new RegExp(".{1," + length + "}", "g"));
  }

  static generateUniqueToken() {
    const charts = "0123456789abcdefghijklmnopqrstuvwxyz";

    const randomString =
      Math.random()
        .toString(36)
        .substring(2, 15) +
      Math.random()
        .toString(36)
        .substring(2, 15);

    const strTimeStamp = moment()
      .valueOf()
      .toString();

    const splitTimeStamps = Generator.chunkString(strTimeStamp, 2);
    const timeStampConverted = splitTimeStamps.reduce(
      (accum, timePart) => accum + charts[parseInt(timePart) % charts.length],
      ""
    );
    return randomString + timeStampConverted;
  }
}

module.exports = Generator
