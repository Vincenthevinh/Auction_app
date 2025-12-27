const Category = require('../models/Category');

// Get all categories in hierarchical structure
exports.getCategories = async (req, res, next) => {
  try {
    // Get all parent categories (level 0)
    const parentCategories = await Category.find({ 
      level: 0, 
      isActive: true 
    }).sort('order');

    // Build tree with children
    const categoriesWithChildren = await Promise.all(
      parentCategories.map(async (parent) => {
        const children = await Category.find({ 
          parentId: parent._id, 
          isActive: true 
        }).sort('order');

        return {
          _id: parent._id,
          name: parent.name,
          slug: parent.slug,
          description: parent.description,
          icon: parent.icon,
          level: parent.level,
          children: children.map(child => ({
            _id: child._id,
            name: child.name,
            slug: child.slug,
            description: child.description,
            parentId: child.parentId,
            level: child.level
          }))
        };
      })
    );

    res.json(categoriesWithChildren);
  } catch (error) {
    next(error);
  }
};

// Get category by id with its children
exports.getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // If this is a parent category, get its children
    let children = [];
    if (category.level === 0) {
      children = await Category.find({ 
        parentId: category._id,
        isActive: true 
      }).sort('order');
    }

    res.json({
      ...category.toObject(),
      children
    });
  } catch (error) {
    next(error);
  }
};

// Get flat list of all categories (useful for forms)
exports.getFlatCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ level: 1, order: 1 });

    const flatList = categories.map(cat => ({
      _id: cat._id,
      name: cat.name,
      parentId: cat.parentId,
      level: cat.level,
      // Create display name like "Electronics > Phones"
      displayName: cat.level === 0 ? cat.name : `${cat.name}`
    }));

    res.json(flatList);
  } catch (error) {
    next(error);
  }
};