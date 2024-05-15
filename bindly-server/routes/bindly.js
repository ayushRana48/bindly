const express = require('express');
const router = express.Router();

const userController = require('../controllers/usersController.js');
const groupController = require('../controllers/groupController.js');
const usergroupController = require('../controllers/userGroupController.js');
const historyController =  require('../controllers/historyController.js');
const postController =  require('../controllers/postController.js');
const authController =  require('../controllers/authController.js');


router.post('/users/createUser',userController.createUserController)
router.get('/users/',userController.getAllUsersController)
router.get('/users/:username',userController.getUserController)
router.delete('/users/deleteUser/:username',userController.deleteUserController)
router.put('/users/updateUser/:username',userController.updateUserController)

router.post('/group/createGroup',groupController.createGroupController)
router.get('/group/:groupId',groupController.getGroupController)
router.get('/group/getGroupByHost/:hostId',groupController.getGroupsByHostIdController)
router.get('/group/',groupController.getAllGroupsController)
router.delete('/group/deleteGroup/:groupId',groupController.deleteGroupController)
router.put('/group/updateGroup/:groupId',groupController.updateGroupController)


router.post('/usergroup/createUsergroup',usergroupController.createUserGroupController)
router.get('/usergroup/:usergroupId',usergroupController.getUserGroupController)
router.get('/usergroup/',usergroupController.getAllUserGroupsController)
router.get('/usergroup/getUsergroupByUsername/:username',usergroupController.getUserGroupsByUsernameontroller)
router.get('/usergroup/getUsergroupByGroup/:groupId',usergroupController.getUserGroupsByGroupIdController)
router.delete('/usergroup/deleteUsergroup/:usergroupId',usergroupController.deleteUserGroupController)
router.put('/usergroup/updateUsergroup/:usergroupId',usergroupController.updateUserGroupController)


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
router.put('/post/updateUsergroup/:postId',postController.updatePostController)

router.post('/auth/signIn',authController.signInController)
router.post('/auth/signUp',authController.signUpController)


module.exports = router;
//k