const express = require('express');
const router = express.Router();
const { postAuth } = require('../middleware/postAuth');
const Auth = new postAuth;

const { postControllers } = require('../controllers/postControllers');
const post = new postControllers;


router.get('/posts', Auth.auth, Auth.verifyToken, Auth.rolesAuth,  post.index);
router.post('/posts', Auth.auth, Auth.verifyToken, Auth.rolesAuth,  post.store);
router.get('/posts/:id', Auth.auth, Auth.verifyToken, Auth.rolesAuth,  post.show);
router.put('/posts/:id', Auth.auth, Auth.verifyToken, Auth.rolesAuth,  post.update);
router.delete('/posts/:id', Auth.auth, Auth.verifyToken, Auth.rolesAuth, post.destroy);



module.exports = router;