const express = require('express');
const router = express.Router();
const { postAuth } = require('../middleware/postAuth');
const Auth = new postAuth;

const { postControllers } = require('../controllers/postControllers');
const post = new postControllers;


router.get('/posts', Auth.verifyToken, Auth.rolesAuth, Auth.auth,  post.index);
router.post('/posts',  Auth.verifyToken, Auth.rolesAuth, Auth.auth, post.store);
router.get('/posts/:id',  Auth.verifyToken, Auth.rolesAuth, Auth.auth,  post.show);
router.put('/posts/:id',  Auth.verifyToken, Auth.rolesAuth, Auth.auth,  post.update);
router.delete('/posts/:id', Auth.verifyToken, Auth.rolesAuth, Auth.auth, post.destroy);



module.exports = router;