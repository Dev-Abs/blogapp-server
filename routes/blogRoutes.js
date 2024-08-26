const express = require('express');
const router = express.Router();
const { getBlogs, getBlogById, createBlogPost, updateBlogPost, deleteBlogPost, addComment, likeBlogPost, unlikeBlogPost, getMyBlogs, getBlogsByAuthorId} = require('../controllers/blogController');

const { protect } = require('../middleware/authMiddleware');

router.route('/').get(getBlogs).post(protect, createBlogPost);
router.route('/:id').get(getBlogById).put(protect, updateBlogPost).delete(protect, deleteBlogPost);
router.route('/:id/comment').post(protect, addComment)
router.route('/:id/like').put(protect, likeBlogPost)
router.route('/:id/unlike').put(protect, unlikeBlogPost)
router.route('/my/blogs').get(protect, getMyBlogs)
// get blogs of author by id
router.route('/author/:id').get(getBlogsByAuthorId)



module.exports = router;