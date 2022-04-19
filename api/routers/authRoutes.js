const express = require('express');
const router = express.Router();
const { userAuth } = require('../middleware/userAuth');
const Auth = new userAuth;

const authControllers = require('../controllers/authControllers');
const user = new authControllers;



router.post('/register', user.createSuperAdmin,user.register)
router.post('/login', user.login);
router.post("/logout", Auth.verifyToken, user.logout);
router.post('/createUser', Auth.verifyToken, Auth.rolesAuth, user.createUsers);
router.put('/updateUser/:id', Auth.verifyToken, Auth.rolesAuth, user.updateUsers);


module.exports = router;