const express = require('express');
const router = express.Router();
const { userAuth } = require('../middleware/userAuth');
const Auth = new userAuth;



const { rolesControllers } = require('../controllers/rolesControllers');
const roles = new rolesControllers;

router.post('/roles', Auth.verifyToken, Auth.rolesAuth, roles.store);
router.get('/roles', Auth.verifyToken, Auth.rolesAuth, roles.index);
router.get('/roles/:id', Auth.verifyToken,Auth.rolesAuth, roles.show);
router.delete('/roles/:id', Auth.verifyToken, Auth.rolesAuth, roles.destroy);
router.put('/roles/:id', Auth.verifyToken, Auth.rolesAuth, roles.update);

module.exports = router;