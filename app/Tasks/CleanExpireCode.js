"use strict";

const Task = use("Task");

const AccountCode = use("App/Models/AccountCode");
const { ACCOUNT_CODE_TYPE } = use(
  "App/Constant/defaultValue"
);

const moment = require("moment");

class CleanExpireCode extends Task {
  static get schedule() {
    return "*/5 * * * * *";
  }

  async handle() {
    this.info("Task CleanExpireCode handle");

    await this.cleanExpirePasswordResetCode();

    this.info(`Task CleanExpireCode done`);
  }

  async cleanExpirePasswordResetCode() {
    try {
      const expireTime = moment()
        .subtract(20, "s")
        .toDate();
      await AccountCode.query()
        .where("created_at", "<", expireTime)
        .where({
          is_revoked: false,
          type: ACCOUNT_CODE_TYPE.passwordReset
        })
        .update({ is_revoked: true });
    } catch (error) {
      console.log('error', error)
    }
  }
}

module.exports = CleanExpireCode;
