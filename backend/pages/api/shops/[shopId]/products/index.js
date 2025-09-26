import connectDB from "../../../../../lib/db";
import Product from "../../../../../models/Product";
import Shop from "../../../../../models/Shop";
import { authMiddleware } from "../../../../../lib/auth";

async function handler(req, res) {
  const { shopId } = req.query;

  // Security Check: Ensure the user belongs to the shop they are trying to access
  if (req.user.shopId !== shopId) {
    return res
      .status(403)
      .json({ message: "Access denied to this shop's resources." });
  }

  await connectDB();

  switch (req.method) {
    case "GET":
      try {
        const products = await Product.find({ shopId }).sort({ createdAt: -1 });
        res.status(200).json({ products });
      } catch (error) {
        console.error("Get Products Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
      }
      break;

    case "POST":
      // Role Check: Only owners can add products
      if (req.user.role !== "owner") {
        return res
          .status(403)
          .json({ message: "Only owners can add new products." });
      }

      try {
        const { name, category, price, stock } = req.body;
        if (!name || !category || price === undefined || stock === undefined) {
          return res
            .status(400)
            .json({ message: "Missing required product fields." });
        }

        const newProduct = new Product({
          shopId,
          name,
          category,
          price,
          stock,
        });

        const savedProduct = await newProduct.save();

        await Shop.findByIdAndUpdate(shopId, {
          $push: { products: savedProduct._id },
        });

        res.status(201).json({
          message: "Product added successfully",
          product: savedProduct,
        });
      } catch (error) {
        console.error("Add Product Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
      }
      break;

    default:
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default authMiddleware(handler);
