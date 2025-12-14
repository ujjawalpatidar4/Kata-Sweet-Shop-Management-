import Sweet from '../models/Sweet.js';

export const createSweet = async (req, res, next) => {
  try {
    const { name, category, price, quantity, description, imageUrl } = req.body;

    if (!name || !category || price === undefined || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, category, price, and quantity',
      });
    }

    const sweet = await Sweet.create({
      name,
      category,
      price,
      quantity,
      description,
      imageUrl,
    });

    res.status(201).json({
      success: true,
      data: sweet,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }
    next(error);
  }
};

export const getAllSweets = async (req, res, next) => {
  try {
    const sweets = await Sweet.find({}).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: sweets.length,
      data: sweets,
    });
  } catch (error) {
    next(error);
  }
};


export const getSweetById = async (req, res, next) => {
  try {
    const sweet = await Sweet.findById(req.params.id);

    if (!sweet) {
      return res.status(404).json({
        success: false,
        message: 'Sweet not found',
      });
    }

    res.status(200).json({
      success: true,
      data: sweet,
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Sweet not found',
      });
    }
    next(error);
  }
};

export const updateSweet = async (req, res, next) => {
  try {
    const sweet = await Sweet.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!sweet) {
      return res.status(404).json({
        success: false,
        message: 'Sweet not found',
      });
    }

    res.status(200).json({
      success: true,
      data: sweet,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }

    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Sweet not found',
      });
    }

    next(error);
  }
};

export const deleteSweet = async (req, res, next) => {
  try {
    const sweet = await Sweet.findByIdAndDelete(req.params.id);

    if (!sweet) {
      return res.status(404).json({
        success: false,
        message: 'Sweet not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Sweet deleted successfully',
      data: {},
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Sweet not found',
      });
    }
    next(error);
  }
};

export const searchSweets = async (req, res, next) => {
  try {
    const { name, category, minPrice, maxPrice } = req.query;

    const query = {};

    if (name) {
      query.name = { $regex: name, $options: 'i' };
    }

    if (category) {
      query.category = category;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) {
        query.price.$gte = parseFloat(minPrice);
      }
      if (maxPrice !== undefined) {
        query.price.$lte = parseFloat(maxPrice);
      }
    }

    const sweets = await Sweet.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: sweets.length,
      data: sweets,
    });
  } catch (error) {
    next(error);
  }
};

export const purchaseSweet = async (req, res, next) => {
  try {
    const { quantity } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid quantity',
      });
    }

    const sweet = await Sweet.findById(req.params.id);

    if (!sweet) {
      return res.status(404).json({
        success: false,
        message: 'Sweet not found',
      });
    }

    try {
      await sweet.decreaseQuantity(quantity);

      res.status(200).json({
        success: true,
        message: `Successfully purchased ${quantity} ${sweet.name}`,
        data: sweet,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  } catch (error) {
    next(error);
  }
};

export const restockSweet = async (req, res, next) => {
  try {
    const { quantity } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid quantity',
      });
    }

    const sweet = await Sweet.findById(req.params.id);

    if (!sweet) {
      return res.status(404).json({
        success: false,
        message: 'Sweet not found',
      });
    }

    await sweet.increaseQuantity(quantity);

    res.status(200).json({
      success: true,
      message: `Successfully restocked ${quantity} ${sweet.name}`,
      data: sweet,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  createSweet,
  getAllSweets,
  getSweetById,
  updateSweet,
  deleteSweet,
  searchSweets,
  purchaseSweet,
  restockSweet,
};
