const express = require('express');
const router = express.Router();
const { userAuth } = require('../middleware/userAuth');
const Auth = new userAuth;

const  userControllers  = require('../controllers/userControllers');
const user = new userControllers;


router.get("/users", Auth.verifyToken, Auth.rolesAuth, user.index);
router.get('/me',  Auth.verifyToken, Auth.rolesAuth, user.me);
router.get('/users/:id',  Auth.verifyToken, Auth.rolesAuth, user.show);

router.put('/users/:id', Auth.personalAuth, Auth.verifyToken, Auth.rolesAuth, user.update);
router.put('/updatePassword/:id', Auth.personalAuth, Auth.verifyToken, Auth.rolesAuth, user.updatePassword);
router.delete('/users:id', Auth.verifyToken, Auth.rolesAuth, user.destroy);

module.exports =  router;