const Menu = require('../models/Menu');
const Restaurant = require('../models/Restaurant');

/**
 * @desc    Get menu for a restaurant
 * @route   GET /api/restaurants/:restaurantId/menu
 * @access  Public
 */
exports.getMenu = async (req, res, next) => {
  try {
    const menu = await Menu.findOne({ restaurantId: req.params.restaurantId });

    if (!menu) {
      return res.status(404).json({
        success: false,
        message: `No menu found for restaurant ${req.params.restaurantId}`
      });
    }

    res.status(200).json({
      success: true,
      data: menu
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Add menu items to a restaurant
 * @route   POST /api/restaurants/:restaurantId/menu
 * @access  Private/Admin
 */
exports.addMenu = async (req, res, next) => {
  try {
    const restaurantId = req.params.restaurantId;
    
    // Check if restaurant exists
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: `No restaurant found with id ${restaurantId}`
      });
    }

    // Check if menu already exists
    let menu = await Menu.findOne({ restaurantId });

    if (menu) {
      // Append items
      menu.items.push(...req.body.items);
      await menu.save();
    } else {
      // Create new menu
      menu = await Menu.create({
        restaurantId,
        items: req.body.items
      });
    }

    res.status(201).json({
      success: true,
      data: menu
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update menu item
 * @route   PUT /api/menu/:itemId
 * @access  Private/Admin
 */
exports.updateMenuItem = async (req, res, next) => {
  try {
    const menu = await Menu.findOne({ 'items._id': req.params.itemId });

    if (!menu) {
      return res.status(404).json({
        success: false,
        message: `Menu item not found`
      });
    }

    const itemIndex = menu.items.findIndex(item => item._id.toString() === req.params.itemId);
    
    // Update fields
    Object.keys(req.body).forEach(key => {
      menu.items[itemIndex][key] = req.body[key];
    });

    await menu.save();

    res.status(200).json({
      success: true,
      data: menu.items[itemIndex]
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Delete menu item
 * @route   DELETE /api/menu/:itemId
 * @access  Private/Admin
 */
exports.deleteMenuItem = async (req, res, next) => {
  try {
    const menu = await Menu.findOneAndUpdate(
      { 'items._id': req.params.itemId },
      { $pull: { items: { _id: req.params.itemId } } },
      { new: true }
    );

    if (!menu) {
      return res.status(404).json({
        success: false,
        message: `Menu item not found`
      });
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};
