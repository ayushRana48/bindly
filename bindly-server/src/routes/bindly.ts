import { Router } from 'express';
import type { RequestHandler } from 'express';
import * as userController from '../controllers/usersController';
import * as groupController from '../controllers/groupController';
import * as usergroupController from '../controllers/userGroupController';
import * as postController from '../controllers/postController';
import * as authController from '../controllers/authController';
import * as inviteController from '../controllers/inviteController';
import * as notifyvetoController from '../controllers/notifyVetoController';
import * as stripeController from '../controllers/stripeController';
import * as paypalController from '../controllers/paypalController';
import * as stravaController from '../controllers/stravaController';
import * as notificationController from '../controllers/notificationController';
import * as commentController from '../controllers/commentController';
import { authenticateUser } from '../middleware/authenticateUser';

const router = Router();



// Auth routes
router.post('/auth/signIn', authController.signInController as unknown as RequestHandler);
router.post('/auth/signUp', authController.signUpController as unknown as RequestHandler);
router.post('/auth/signOut', authController.signOutController as unknown as RequestHandler);
router.get('/auth/getUser', authController.getUserController as unknown as RequestHandler);
router.post('/auth/refreshToken', authController.refreshTokenController as unknown as RequestHandler);

// router.use(authenticateUser as RequestHandler);
// Users routes
router.get('/users/', userController.getAllUsersController as unknown as RequestHandler);
router.get('/users/:username', userController.getUserController as unknown as RequestHandler);
router.delete('/users/deleteUser/:username', userController.deleteUserController as unknown as RequestHandler);
router.put('/users/updateUser/:username', userController.updateUserController as unknown as RequestHandler);
router.get('/users/email/:email', userController.getUserByEmailController as unknown as RequestHandler);

// Group routes
router.post('/group/createGroup', groupController.createGroupController as unknown as RequestHandler);
router.get('/group/:groupId', groupController.getGroupController as unknown as RequestHandler);
router.get('/group/getLeaderboard/:groupId', groupController.getLeaderBoardController as unknown as RequestHandler);
router.get('/group/getGroupByHost/:hostId', groupController.getGroupsByHostIdController as unknown as RequestHandler);
router.get('/group/', groupController.getAllGroupsController as unknown as RequestHandler);
router.delete('/group/deleteGroup', groupController.deleteGroupController as unknown as RequestHandler);
router.put('/group/updateGroup/:groupId', groupController.updateGroupController as unknown as RequestHandler);
router.put('/group/changeHost', groupController.changeHostController as unknown as RequestHandler);
// router.put('/group/endGroup', groupController.endGroupController as unknown as RequestHandler);
router.get('/group/proccessVetoDemo/:groupId', groupController.processVetoDemoController as unknown as RequestHandler);

// UserGroup routes
router.post('/usergroup/createUsergroup', usergroupController.createUserGroupController as unknown as RequestHandler);
router.get('/usergroup/:usergroupId', usergroupController.getUserGroupController as unknown as RequestHandler);
router.get('/usergroup/', usergroupController.getAllUserGroupsController as unknown as RequestHandler);
router.get('/usergroup/getUsergroupByUsername/:username', usergroupController.getUserGroupsByUsernameController as unknown as RequestHandler);
router.get('/usergroup/getUsergroupByGroup/:groupId', usergroupController.getUserGroupsByGroupIdController as unknown as RequestHandler);
router.put('/usergroup/updateUsergroup/:usergroupId', usergroupController.updateUserGroupController as unknown as RequestHandler);
router.delete('/usergroup/leaveGroup', usergroupController.leaveGroupController as unknown as RequestHandler);
router.delete('/usergroup/kickUser', usergroupController.kickUserController as unknown as RequestHandler);
router.put('/usergroup/inGroup', usergroupController.inGroupController as unknown as RequestHandler);


// Invite routes
router.post('/invite/createInvite', inviteController.createInviteController as unknown as RequestHandler);
router.get('/invite/getInviteByReciever/:reciverId', inviteController.getInvitesByRecieverController as unknown as RequestHandler);
router.get('/invite/getInviteByGroup/:groupId', inviteController.getInvitesByGroupIdController as unknown as RequestHandler);
router.post('/invite/acceptInvite', inviteController.acceptInviteController as unknown as RequestHandler);
router.delete('/invite/deleteInvite/:inviteId', inviteController.deleteInviteController as unknown as RequestHandler);
router.get('/invite/getAvailableInvites/:groupId', inviteController.getAvailableInvites as unknown as RequestHandler);


// Post routes
router.post('/post/createPost', postController.createPostController as unknown as RequestHandler);
router.get('/post/:postId', postController.getPostController as unknown as RequestHandler);
router.get('/post/', postController.getAllPostsController as unknown as RequestHandler);
router.get('/post/getPostByUsername/:username', postController.getPostsByUsernameController as unknown as RequestHandler);
router.get('/post/getPostByGroup/:groupId', postController.getPostsByGroupIdController as unknown as RequestHandler);
router.delete('/post/deletePost/:postId', postController.deletePostController as unknown as RequestHandler);
router.put('/post/updatePost/:postId', postController.updatePostController as unknown as RequestHandler);
router.post('/post/getPresignedUrl', postController.getPresignedUrlController as unknown as RequestHandler);
router.post('/post/compressVideo', postController.compressVideoController as unknown as RequestHandler);
router.post('/post/postStatus', postController.postStatusController as unknown as RequestHandler);
router.put('/post/addVeto', postController.addVetoController as unknown as RequestHandler);
router.put('/post/removeVeto', postController.removeVetoController as unknown as RequestHandler);
router.put('/post/addLike', postController.addLikeController as unknown as RequestHandler);
router.put('/post/removeLike', postController.removeLikeController as unknown as RequestHandler);
router.get('/post/getInvalid/:username', postController.getInvalidPostsController as unknown as RequestHandler);

// Comment routes
router.post('/comment/addComment', commentController.addCommentController as unknown as RequestHandler);
router.get('/comment/getComment/:postid', commentController.getCommentByPostController as unknown as RequestHandler);



// NotifyVeto routes
router.get('/notifyveto/:username', notifyvetoController.getNotifyVetoByGroupController as unknown as RequestHandler);

// Notification routes
router.post('/notification/registerToken', notificationController.registerTokenController as unknown as RequestHandler);
router.post('/notification/removeToken', notificationController.removeTokenController as unknown as RequestHandler);

// Stripe routes
router.post('/stripe/saveCard', stripeController.saveCardController as unknown as RequestHandler);
router.post('/stripe/addMoney', stripeController.addMoneyController as unknown as RequestHandler);
router.post('/stripe/detachOldPaymentMethods', stripeController.detachOldPaymentMethods as unknown as RequestHandler);
router.get('/stripe/getSavedCards/:customerId', stripeController.getSavedCardsController as unknown as RequestHandler);

// PayPal routes
router.post('/paypal/payout', paypalController.createPayoutController as unknown as RequestHandler);
router.post('/paypal/checkPayout', paypalController.checkPayoutStatusController as unknown as RequestHandler);

// Strava routes
router.post('/strava/addRefresh', stravaController.addStravaRefreshController as unknown as RequestHandler);
router.post('/strava/reauthorize', stravaController.reauthorizeStravaController as unknown as RequestHandler);
router.post('/strava/revoke', stravaController.revokeStravaController as unknown as RequestHandler);
router.get('/strava/getActivities', stravaController.getActivitiesController as unknown as RequestHandler);

export default router;