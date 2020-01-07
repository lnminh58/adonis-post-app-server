"use strict";

const Env = use("Env");
const Mail = use("Mail");
const Helpers = use("Helpers");
const { validateAll } = use("Validator");
const Hash = use("Hash");

const User = use("App/Models/User");
const Profile = use("App/Models/Profile");
const AccountCode = use("App/Models/AccountCode");

const { Timing, Storage, Generator } = use("App/Utils");
const { SUPPORT_EMAIL, EMAIL_SUBJECT, ACCOUNT_CODE_TYPE } = use(
  "App/Constant/defaultValue"
);

const { get, first } = require("lodash");
const snakeCaseKeys = require("snakecase-keys");

class UserController {
  async create({ auth, request, response }) {
    try {
      const data = request.only(["username", "email", "password"]);

      const rules = {
        username: "required",
        email: "required|email|unique:users",
        password: "required|min:6"
      };

      const validation = await validateAll(data, rules);

      if (validation.fails()) {
        console.log(validation.messages());
        return response.badRequest(validation.messages());
      }

      const user = await User.create({
        ...data,
        activation_token: Generator.generateUniqueToken(),
        login_source: "EMAIL"
      });

      await Mail.send(
        "emails.account-activation",
        {
          username: user.username,
          activeLink: `${Env.get("APP_URL")}/account-activation/${
            user.activation_token
          }`
        },
        message => {
          message
            .from(SUPPORT_EMAIL)
            .to(user.email)
            .subject(EMAIL_SUBJECT.accountActivation);
        }
      );

      response.ok(user.toJSON());
    } catch (error) {
      console.log("error", error);
      const { status } = error;
      response.status(status).send(error);
    }
  }

  async resendAccountActivationEmail({ auth, request, response }) {
    try {
      const data = request.only(["email"]);

      const rules = {
        email: "required|email"
      };

      const validation = await validateAll(data, rules);

      if (validation.fails()) {
        console.log(validation.messages());
        return response.badRequest(validation.messages());
      }

      const { email } = data;
      const user = await User.findByOrFail({ email });
      const userData = user.toJSON();
      if (userData.isActivated) {
        return response.gone({ message: "Account have been activated!" });
      }

      await Mail.send(
        "emails.account-activation",
        {
          username: userData.username,
          activeLink: `${Env.get("APP_URL")}/account-activation/${
            user.activation_token
          }`
        },
        message => {
          message
            .from(SUPPORT_EMAIL)
            .to(email)
            .subject(EMAIL_SUBJECT.accountActivation);
        }
      );

      response.ok({ message: "email has been sent" });
    } catch (error) {
      console.log("error", error);
      const { status } = error;
      response.status(status).send(error);
    }
  }

  async activeAccount({ auth, request, response }) {
    try {
      const data = request.only(["activationToken"]);

      const user = await User.findByOrFail(snakeCaseKeys(data));
      user.is_activated = true;

      await user.save();
      response.ok({ message: "account has been activated!" });
    } catch (error) {
      console.log("error", error);
      const { status } = error;
      response.status(status).send(error);
    }
  }

  async sendPasswordResetCode({ auth, request, response }) {
    try {
      const data = request.only(["email"]);

      const rules = {
        email: "required|email"
      };

      const validation = await validateAll(data, rules);

      if (validation.fails()) {
        console.log(validation.messages());
        return response.badRequest(validation.messages());
      }

      const { email } = data;
      const user = await User.findByOrFail({ email });

      await user
        .accountCodes()
        .where({
          is_revoked: false,
          type: ACCOUNT_CODE_TYPE.passwordReset
        })
        .update({ is_revoked: true });

      const randomCode = Generator.generateRandomCode();

      await Mail.send(
        "emails.reset-password",
        {
          username: user.username,
          code: randomCode
        },
        message => {
          message
            .from(SUPPORT_EMAIL)
            .to(email)
            .subject(EMAIL_SUBJECT.resetPassword);
        }
      );
      const hashed_code = await Hash.make(randomCode);

      const isValidCode = await Hash.verify(randomCode, hashed_code);

      await user.accountCodes().create({
        hashed_code,
        type: ACCOUNT_CODE_TYPE.passwordReset
      });

      response.ok({ message: "email has been sent", userId: user.id });
    } catch (error) {
      console.log("error", error);
      const { status } = error;
      response.status(status).send(error);
    }
  }

  async verifyPasswordResetCode({ auth, request, response }) {
    try {
      const data = request.only(["code", "userId"]);
      const accountCodes = await AccountCode.query()
        .where({
          user_id: data.userId,
          is_revoked: false,
          type: ACCOUNT_CODE_TYPE.passwordReset
        })
        .fetch();

      const accountCode = first(accountCodes.rows);

      const isValidCode = await Hash.verify(data.code, accountCode.hashed_code);

      if (!isValidCode) {
        return response.badRequest({ message: "Invalid code!" });
      }

      response.ok({ isValidCode });
    } catch (error) {
      console.log("error", error);
      const { status } = error;
      response.status(status).send(error);
    }
  }

  async resetPassword({ auth, request, response }) {
    try {
      const data = request.only(["password", "userId"]);

      const { userId, password } = data;

      const user = await User.find(userId);

      const rules = {
        password: "required|min:6"
      };

      const validation = await validateAll({ password }, rules);

      if (validation.fails()) {
        return response.badRequest(validation.messages());
      }

      user.password = password;
      await user.save();

      await user
        .accountCodes()
        .where({
          is_revoked: false,
          type: ACCOUNT_CODE_TYPE.passwordReset
        })
        .update({ is_revoked: true });

      response.ok({ message: "Password has been updated!" });
    } catch (error) {
      console.log("error", error);
      const { status } = error;
      response.status(status).send(error);
    }
  }

  async changePassword({ auth, request, response }) {
    try {
      const data = request.only(["oldPassword", "password"]);
      const { oldPassword, password } = data;

      const user = await auth.getUser();
      const hasOldPassword = !!user.password;

      if (hasOldPassword) await auth.attempt(user.email, oldPassword);

      const rules = hasOldPassword
        ? {
            password: "required|min:6",
            oldPassword: "required|min:6"
          }
        : {
            password: "required|min:6"
          };

      const validation = await validateAll(data, rules);

      if (validation.fails()) {
        return response.badRequest(validation.messages());
      }

      user.password = password;
      await user.save();

      response.ok({ user: user.toJSON() });
    } catch (error) {
      console.log(error);
      const { status } = error;
      response.status(status).send(error);
    }
  }

  async signIn({ auth, request, response }) {
    try {
      const data = request.only(["email", "password"]);
      const { password, email } = data;

      const user = await User.findBy("email", email);

      const tokenRes = await auth.attempt(email, password);

      if (!user.is_activated) {
        return response.forbidden({
          message: "Account hasn't been activated yet!"
        });
      }
      //  add fake delay
      await Timing.delay(1000);

      response.ok({ ...tokenRes, ...user.toJSON() });
    } catch (error) {
      console.log(error);
      const { status } = error;
      response.status(status).send(error);
    }
  }

  async signOut({ auth, response }) {
    try {
      const refreshToken = request.only(["refreshToken"]);

      await auth.authenticator("jwt").revokeTokens([refreshToken]);

      response.ok({ status: "success" });
    } catch (error) {
      console.log(error);
      const { status } = error;
      response.status(status).send(error);
    }
  }

  async getUserProfile({ request, response, params }) {
    try {
      const userId = params.id;
      const user = await User.find(userId);
      const profileRes = await user.profile().fetch();

      response.send(profileRes && profileRes.toJSON());
    } catch (error) {
      console.log(error);
      const { status } = error;
      response.status(status).send(error);
    }
  }

  async setUserProfile({ auth, request, response }) {
    try {
      let data = request.only([
        "identifyCardNumber",
        "phone",
        "gender",
        "address",
        "city",
        "country"
      ]);

      data = snakeCaseKeys(data);

      const rules = {
        identifyCardNumber: "required|number|min:9|max:9",
        phone: "required|number|min:10|max:11",
        gender: "required",
        address: "required"
      };

      const validation = await validateAll(data, snakeCaseKeys(rules));

      if (validation.fails()) {
        return response.badRequest(validation.messages());
      }

      const user = await auth.getUser();

      const profile = await Profile.findOrCreate(
        snakeCaseKeys({ userId: user.id }),
        snakeCaseKeys({ userId: user.id, ...data })
      );

      profile.merge(data);
      await profile.save();
      //  add fake delay
      await Timing.delay(1000);
      response.ok(profile.toJSON());
    } catch (error) {
      console.log(error);
      const { status } = error;
      response.status(status).send(error);
    }
  }

  async setUserAvatar({ auth, request, response }) {
    try {
      const user = await auth.getUser();

      const validationOptions = {
        types: ["image"],
        size: "3mb"
      };

      const avatar = request.file("avatar", validationOptions);

      await avatar.move(Helpers.tmpPath("uploads"), {
        name: `avatar-${user.id}-${new Date().getTime()}.${avatar.extname}`,
        overwrite: true
      });

      const avatarPath = `${get(avatar, "_location")}/${get(
        avatar,
        "fileName"
      )}`;

      const avatarUrl = await Storage.addFile(avatarPath);

      const profile = await Profile.findOrCreate(
        snakeCaseKeys({ userId: user.id }),
        snakeCaseKeys({ userId: user.id, avatarUrl })
      );

      profile.merge(snakeCaseKeys({ avatarUrl }));
      await profile.save();

      response.ok(profile);
    } catch (error) {
      console.log(error);
      const { status } = error;
      response.status(status).send(error);
    }
  }

  async findUserByName({ request, response, auth }) {
    try {
      const user = await auth.getUser();
      const data = request.only(["q"]);
      const { q } = data;

      const users = await User.query()
        .select(["id", "username", "email"])
        .where("username", "ILIKE", `%${q}%`)
        .whereNot("id", user.id)
        .with("profile")
        .limit(10)
        .fetch();
      console.log(users.toJSON());
      response.ok(users.toJSON());
    } catch (error) {
      console.log("error", error);
      const { status } = error;
      response.status(status).send(error);
    }
  }
}

module.exports = UserController;
