const moment = require("moment");

class Generator {
  static chunkString(str, length) {
    return str.match(new RegExp(".{1," + length + "}", "g"));
  }

  static createRandomString(length) {
    return Math.random()
      .toString(36)
      .substring(2, length + 2);
  }

  static generateUniqueToken() {
    const charts = "0123456789abcdefghijklmnopqrstuvwxyz";

    const randomString = Generator.createRandomString(10) + Generator.createRandomString(10)

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

  static generateRandomCode() {
    const charts = "0123456789abcdefghijklmnopqrstuvwxyz";

    const randomString = Generator.createRandomString(3)

    const strTimeStamp = moment()
      .valueOf()
      .toString();

    const splitTimeStamps = Generator.chunkString(strTimeStamp, 3);
    const timeStampConverted = splitTimeStamps.reduce(
      (accum, timePart) => accum + charts[parseInt(timePart) % charts.length],
      ""
    );
    return (randomString + timeStampConverted).toUpperCase();
  }
}

module.exports = Generator;
