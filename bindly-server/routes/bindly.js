const express = require('express');
const router = express.Router();

const userController = require('../controllers/usersController.js');
const groupController = require('../controllers/groupController.js');
const usergroupController = require('../controllers/userGroupController.js');
const historyController =  require('../controllers/historyController.js');
const postController =  require('../controllers/postController.js');
const authController =  require('../controllers/authController.js');
const inviteController =  require('../controllers/inviteController.js');
const notifyvetoController =  require('../controllers/notifyVetoController.js');

router.post('/users/createUser',userController.createUserController)
router.get('/users/',userController.getAllUsersController)
router.get('/users/:username',userController.getUserController)
router.delete('/users/deleteUser/:username',userController.deleteUserController)
router.put('/users/updateUser/:username',userController.updateUserController)
router.get('/users/email/:email',userController.getUserByEmailController)

router.post('/group/createGroup',groupController.createGroupController)
router.get('/group/:groupId',groupController.getGroupController)
router.get('/group/getLeaderboard/:groupId',groupController.getLeaderBoardController)
router.get('/group/getGroupByHost/:hostId',groupController.getGroupsByHostIdController)
router.get('/group/',groupController.getAllGroupsController)
router.delete('/group/deleteGroup',groupController.deleteGroupController)
router.put('/group/updateGroup/:groupId',groupController.updateGroupController)
router.put('/group/changeHost',groupController.changeHostController)
router.put('/group/endGroup',groupController.endGroupController)
router.get('/group/proccessVetoDemo/:groupId',groupController.proccessVetoDemoController)


router.post('/usergroup/createUsergroup',usergroupController.createUserGroupController)
router.get('/usergroup/:usergroupId',usergroupController.getUserGroupController)
router.get('/usergroup/',usergroupController.getAllUserGroupsController)
router.get('/usergroup/getUsergroupByUsername/:username',usergroupController.getUserGroupsByUsernameontroller)
router.get('/usergroup/getUsergroupByGroup/:groupId',usergroupController.getUserGroupsByGroupIdController)
router.put('/usergroup/updateUsergroup/:usergroupId',usergroupController.updateUserGroupController)
router.delete('/usergroup/leaveGroup',usergroupController.leaveGroupController)
router.delete('/usergroup/kickUser',usergroupController.kickUserController)
router.put('/usergroup/inGroup',usergroupController.inGroupController)

router.post('/invite/createInvite',inviteController.createInviteController)
router.get('/invite/getInviteByReciever/:reciverId',inviteController.getInvitesByRecieverController)
router.get('/invite/getInviteByGroup/:groupId',inviteController.getInvitesByGroupIdController)
router.post('/invite/acceptInvite',inviteController.acceptInviteController)
router.delete('/invite/deleteInvite/:inviteId',inviteController.deleteInviteController)
router.get('/invite/getAvailableInvites/:groupId',inviteController.getAvailableInvites)


router.post('/history/createHistory', historyController.createHistoryController);
router.get('/history', historyController.getAllHistoriesController);
router.get('/history/:historyId', historyController.getHistoryByIdController);
router.get('/history/getHistoryByLoser/:loserId', historyController.getHistoryByLoserController);
router.get('/history/getHistoryByGroup/:groupId', historyController.getHistoryByGroupIdController);
router.put('/history/updateHistory/:historyId', historyController.updateHistoryController);
router.delete('/history/deleteHistory/:historyId', historyController.deleteHistoryController);


router.post('/post/createPost',postController.createPostController)
router.get('/post/:postId',postController.getPostController)
router.get('/post/',postController.getAllPostsController)
router.get('/post/getPostByUsername/:username',postController.getPostsByUsernameController)
router.get('/post/getPostByGroup/:groupId',postController.getPostsByGroupIdController)
router.delete('/post/deleteUsergroup/:postId',postController.deletePostController)
router.put('/post/updatePost/:postId',postController.updatePostController)
router.post('/post/getPresignedUrl',postController.getPresignedUrlController)
router.post('/post/compressVideo',postController.compressVideoController)
router.post('/post/postStatus',postController.postStatusController)
router.put('/post/addVeto',postController.addVetoController)
router.put('/post/removeVeto',postController.removeVetoController)
router.get('/post/getInvalid/:username',postController.getInvalidPostsController)


router.post('/auth/signIn',authController.signInController)
router.post('/auth/signUp',authController.signUpController)
router.post('/auth/signOut',authController.signOutController)
router.get('/auth/getUser',authController.getUserController)


router.get('/notifyveto/:username',notifyvetoController.getNotifyVetoByGroupController)






module.exports = router;
