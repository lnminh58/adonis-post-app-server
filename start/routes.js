"use strict";

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URL's and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use("Route");
const Helpers = use("Helpers");

Route.on("/account-activation/:token").render("account-activation");

Route.post("users/create", "UserController.create");

Route.group(() => {
  Route.post("users/create", "UserController.create");
  Route.post(
    "users/resend-account-activation-email",
    "UserController.resendAccountActivationEmail"
  );
  Route.post(
    "users/send-password-reset-code",
    "UserController.sendPasswordResetCode"
  );
  Route.post(
    "users/verify-password-reset-code",
    "UserController.verifyPasswordResetCode"
  );
  Route.post("users/reset-password", "UserController.resetPassword");
  Route.post("users/active-account", "UserController.activeAccount");
  Route.get("users/test-mail", "UserController.testMail");
  Route.post("users/sign-in", "UserController.signIn");
  Route.post(
    "users/login-with-social",
    "SocialLoginController.loginWithSocial"
  );
  Route.get("users/sign-out", "UserController.signOut");
}).prefix("api/v1");

Route.group(() => {
  Route.get("users/profile/:id", "UserController.getUserProfile");
  Route.post("users/set-user-profile", "UserController.setUserProfile");
  Route.post("users/set-user-avatar", "UserController.setUserAvatar");
  Route.post("users/change-password", "UserController.changePassword");
  Route.get("users/post", "PostController.getPostByUser");
  Route.get("users/post-liked", "PostController.getLikedPostByUser");
  Route.post("users/post/like", "PostController.likePost");
  Route.get("categories", "PostController.getCategories");
  Route.post("post/save", "PostController.savePost");
  Route.get("post/get", "PostController.getPosts");
  Route.get("post/get-post-detail/:id", "PostController.getPostDetail");
  Route.delete("post/delete", "PostController.deletePost");
  Route.patch("post/open-post-linking", "PostController.openPostLinking");
  Route.get("message/:conversation", "ChatController.getMessageByConversation");
})
  .prefix("api/v1")
  .middleware(["auth"]);

Route.any("*", ({ response }) => {
  return response.download(Helpers.tmpPath("../public/index.html"));
});
