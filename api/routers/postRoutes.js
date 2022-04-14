const express = require('express');
const router = express.Router();
const { postAuth } = require('../middleware/postAuth');
const Auth = new postAuth;

const { postControllers } = require('../controllers/postControllers');
const post = new postControllers;


router.get('/posts', Auth.auth, Auth.verifyToken, Auth.rolesAuth, Auth.logedinUser, post.index);
router.post('/posts', Auth.auth, Auth.verifyToken, Auth.rolesAuth,Auth.logedinUser,  post.store);
router.get('/posts/:id', Auth.auth, Auth.verifyToken, Auth.rolesAuth,Auth.logedinUser,  post.show);
router.put('/posts/:id', Auth.auth, Auth.verifyToken, Auth.rolesAuth,Auth.logedinUser,  post.update);
router.delete('/posts/:id', Auth.auth, Auth.verifyToken, Auth.rolesAuth,Auth.logedinUser, post.destroy);



module.exports = router;