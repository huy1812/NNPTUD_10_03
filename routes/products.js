var express = require('express');
var router = express.Router();
let productModel = require('../schemas/products')
const slugify = require('slugify');

router.get('/', async function(req, res, next) {
  try {
    let result = await productModel.find({ isDeleted: false }).populate('category');
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async function(req, res, next) {
  try {
    let product = await productModel.findById(req.params.id).populate('category');
    if (!product || product.isDeleted) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async function(req, res, next) {
  try {
    const { title, price, description, images, category } = req.body;
    const slug = slugify(title, { lower: true });
    const newProduct = new productModel({
      title,
      slug,
      price,
      description,
      images,
      category
    });
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', async function(req, res, next) {
  try {
    const { title, price, description, images, category } = req.body;
    const updateData = { price, description, images, category };
    if (title) {
      updateData.title = title;
      updateData.slug = slugify(title, { lower: true });
    }
    const updatedProduct = await productModel.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('category');
    if (!updatedProduct || updatedProduct.isDeleted) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', async function(req, res, next) {
  try {
    const deletedProduct = await productModel.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );
    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
