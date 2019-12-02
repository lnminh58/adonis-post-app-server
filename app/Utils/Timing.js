class Timing {
  static delay(ms) {
    return new Promise((resolve, reject) => {
      setTimeout(() => resolve(ms), ms);
    });
  }
}


module.exports = Timing
