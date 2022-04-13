const express = require('express');
const router = express.Router();
const { userAuth } = require('../middleware/userAuth');
const Auth = new userAuth;

const authControllers = require('../controllers/authControllers');
const user = new authControllers;



router.post('/register',user.register)
router.post('/login', Auth.verifyToken, Auth.rolesAuth, user.login);
router.post("/logout", Auth.verifyToken, Auth.rolesAuth, Auth.verifyToken, user.logout);
router.post('/createUsers', Auth.verifyToken, Auth.rolesAuth, user.createUsers);
router.put('/updateUsers/:id', Auth.verifyToken, Auth.rolesAuth, user.updateUsers);


module.exports = router;