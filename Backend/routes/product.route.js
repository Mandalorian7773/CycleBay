import express from "express";
import { isAuth } from "./../middlewares/authenticate.js";
import { 
  getAllProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  getProductsByUserId
} from "../controllers/product.controller.js";

const router = express.Router();

// Product routes
router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.post("/", isAuth, createProduct);
router.put("/:id", isAuth, updateProduct);
router.delete("/:id", isAuth, deleteProduct);
router.get("/user/:userId", isAuth, getProductsByUserId);

export default router;
