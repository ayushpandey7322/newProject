const express = require('express');
const router = express.Router();
const { userAuth } = require('../middleware/userAuth');
const Auth = new userAuth;

const  userControllers  = require('../controllers/userControllers');
const user = new userControllers;


router.get("/users", Auth.verifyToken, Auth.rolesAuth,Auth.logedinUser, user.index);
router.get('/me',  Auth.verifyToken, Auth.rolesAuth,Auth.logedinUser, user.me);
router.get('/users/:id',  Auth.verifyToken, Auth.rolesAuth,Auth.logedinUser, user.show);

router.put('/users/:id', Auth.personalAuth, Auth.verifyToken, Auth.rolesAuth,Auth.logedinUser, user.update);
router.put('/user/updatePassword/:id', Auth.personalAuth, Auth.verifyToken, Auth.rolesAuth,Auth.logedinUser, user.updatePassword);
router.delete('/users:id', Auth.verifyToken, Auth.rolesAuth,Auth.logedinUser, user.destroy);

module.exports =  router;