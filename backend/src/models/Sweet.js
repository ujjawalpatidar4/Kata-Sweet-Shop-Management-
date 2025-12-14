import mongoose from 'mongoose';

/**
 * Sweet Schema
 * Defines the structure for sweet/candy products in the shop
 */
const sweetSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a sweet name'],
      trim: true,
      maxlength: [100, 'Name cannot be more than 100 characters'],
    },
    category: {
      type: String,
      required: [true, 'Please provide a category'],
      enum: {
        values: ['Chocolate', 'Candy', 'Gummies', 'Lollipop', 'Hard Candy', 'Sour', 'Other'],
        message: 'Please select a valid category',
      },
    },
    price: {
      type: Number,
      required: [true, 'Please provide a price'],
      min: [0, 'Price cannot be negative'],
    },
    quantity: {
      type: Number,
      required: [true, 'Please provide quantity in stock'],
      min: [0, 'Quantity cannot be negative'],
      default: 0,
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot be more than 500 characters'],
    },
    imageUrl: {
      type: String,
      default: 'https://via.placeholder.com/300x300?text=Sweet',
    },
  },
  {
    timestamps: true, 
  }
);

sweetSchema.index({ name: 'text', category: 'text', description: 'text' });

sweetSchema.methods.isInStock = function () {
  return this.quantity > 0;
};

sweetSchema.methods.decreaseQuantity = async function (amount) {
  if (this.quantity < amount) {
    throw new Error('Insufficient quantity in stock');
  }
  this.quantity -= amount;
  return await this.save();
};


sweetSchema.methods.increaseQuantity = async function (amount) {
  this.quantity += amount;
  return await this.save();
};

const Sweet = mongoose.model('Sweet', sweetSchema);

export default Sweet;
