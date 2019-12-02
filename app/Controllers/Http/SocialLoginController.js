"use strict";

const User = use("App/Models/User");
const Profile = use("App/Models/Profile");

const snakeCaseKeys = require("snakecase-keys");
const { get } = require("lodash");

class SocialLoginController {
  async loginWithSocial({ ally, auth, request, response }) {
    try {
      const body = request.post();

      const loginSource = get(body, 'loginSource')
      const accessToken = get(body, 'accessToken')
      let allyUser = null;
      
      switch (loginSource) {
        case 'FACEBOOK':
          allyUser = await ally.driver('facebook').getUserByToken(accessToken);
          break;
        case 'GOOGLE':
          allyUser = await ally.driver('google').getUserByToken(accessToken);
          break;
      
        default:
      }
      
      const whereClause = {
        email: allyUser.getEmail()
      }

      const userDetails = {
        email: allyUser.getEmail(),
        username: allyUser.getName(),
        login_source: loginSource,
        is_activated: true,
      }
      
      const user = await User.findOrCreate(whereClause, userDetails)
      
      const tokenRes = await auth.generate(user)

      response.ok({ ...tokenRes, ...user.toJSON() });
    } catch (error) {
      console.log('error', error);
      const { status } = error;
      response.status(status).send(error);
    }
  }
}

module.exports = SocialLoginController;
