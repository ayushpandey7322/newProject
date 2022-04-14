const express = require('express');
const router = express.Router();

const { userAuth } = require('../middleware/userAuth');
const Auth = new userAuth;

const  policyControllers  = require('../controllers/policyControllers');
const policy = new policyControllers;


router.get('/policy', Auth.verifyToken, Auth.rolesAuth, Auth.logedinUser, policy.index);
router.post('/policy', Auth.verifyToken, Auth.rolesAuth,Auth.logedinUser, policy.store);
router.get('/policy/:id', Auth.verifyToken, Auth.rolesAuth,Auth.logedinUser,  policy.show);
router.put('/policy/:id', Auth.verifyToken, Auth.rolesAuth,Auth.logedinUser, policy.update);
router.delete('/policy/:id', Auth.verifyToken, Auth.rolesAuth, Auth.logedinUser, policy.destroy);



module.exports = router;