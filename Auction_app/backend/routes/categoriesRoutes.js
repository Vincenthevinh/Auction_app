const express = require('express');
const Category = require('../models/Category');

const router = express.Router();

// Lấy tất cả danh mục (cây phân cấp)
router.get('/', async (req, res, next) => {
  try {
    const categories = await Category.find({ level: 0 }).sort('order');
    
    const buildTree = async (parent) => {
      const children = await Category.find({ parentId: parent._id }).sort('order');
      return {
        ...parent.toObject(),
        children: await Promise.all(children.map(buildTree))
      };
    };
    
    const tree = await Promise.all(categories.map(buildTree));
    res.json(tree);
  } catch (error) {
    next(error);
  }
});

module.exports = router;