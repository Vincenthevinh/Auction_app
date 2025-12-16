const Category = require('../models/Category');

// Get all categories (hierarchical)
exports.getCategories = async (req, res, next) => {
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
};

// Get category by id
exports.getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
    next(error);
  }
};