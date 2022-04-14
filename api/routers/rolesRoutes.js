const express = require('express');
const router = express.Router();
const { userAuth } = require('../middleware/userAuth');
const Auth = new userAuth;



const { rolesControllers } = require('../controllers/rolesControllers');
const roles = new rolesControllers;

router.post('/roles', Auth.verifyToken, Auth.rolesAuth,Auth.logedinUser, roles.store);
router.get('/roles', Auth.verifyToken, Auth.rolesAuth,Auth.logedinUser, roles.index);
router.get('/roles/:id', Auth.verifyToken,Auth.rolesAuth,Auth.logedinUser, roles.show);
router.delete('/roles/:id', Auth.verifyToken, Auth.rolesAuth,Auth.logedinUser, roles.destroy);
router.put('/roles/:id', Auth.verifyToken, Auth.rolesAuth,Auth.logedinUser, roles.update);

module.exports = router;