import "dotenv/config";
import mongoose from "mongoose";
import User from "./models/User.js";
import Shop from "./models/Shop.js";
import Product from "./models/Product.js";
import Order from "./models/Order.js";
// --- ADDED: Import Invoice to clear it ---
import Invoice from "./models/Invoice.js";
// --- ADDED: Import Notification to clear it ---
import Notification from "./models/Notification.js";
import path from 'path';
import fs from 'fs';

const getRandomDate = () => {
  const end = new Date();
  const start = new Date();
  start.setMonth(start.getMonth() - 6);
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
};

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected for seeding...");

    // Clear existing data
    console.log("Clearing old data...");
    await Invoice.deleteMany({}); // --- ADDED ---
    await Notification.deleteMany({}); // --- ADDED ---
    await Order.deleteMany({});
    await Product.deleteMany({});
    await User.deleteMany({});
    await Shop.deleteMany({});

     // --- ADDED: Clear old invoice files ---
     const invoicesDir = path.join(process.cwd(), "public", "invoices");
     if (fs.existsSync(invoicesDir)) {
       const files = fs.readdirSync(invoicesDir);
       for (const file of files) {
         if (file !== '.gitkeep') { // Keep the .gitkeep file
            fs.unlinkSync(path.join(invoicesDir, file));
         }
       }
       console.log("Cleared old invoice files.");
     }
     // ------------------------------------

    console.log("Old data cleared.");

    // Create Owner and Shop
    const owner1 = await User.create({
      name: "Ankit Sharma",
      email: "owner1@example.com",
      passwordHash: "Password123", // Will be hashed by pre-save hook
      role: "owner",
    });
    const shop1 = await Shop.create({
      shopName: "Ankit's General Store",
      ownerId: owner1._id,
      address: "123 Main St, Anytown", // Add address
    });
    await User.findByIdAndUpdate(owner1._id, { shopId: shop1._id });
    console.log("Owner and Shop created and linked successfully.");

    // Create Employees
    const employee1 = await User.create({
      name: "Rahul Kumar",
      email: "rahul@example.com",
      passwordHash: "Password123", // Will be hashed
      role: "employee",
      shopId: shop1._id,
      salary: { amount: 16000, status: 'pending' }, // Start as pending
    });
    const employee2 = await User.create({
      name: "Priya Singh",
      email: "priya@example.com",
      passwordHash: "Password123", // Will be hashed
      role: "employee",
      shopId: shop1._id,
      salary: { amount: 18000, status: 'pending' }, // Start as pending
    });
    console.log("Sample employees created.");

    // Link employees to shop
    shop1.employees.push(employee1._id, employee2._id);


    // Create Products (using the same data as before)
    console.log("Creating 50 products...");
    const productsData = [
       { shopId: shop1._id, name: "Aashirvaad Atta 5kg", category: "Staples", price: 240, cost: 190, stock: 40 },
       { shopId: shop1._id, name: "India Gate Basmati Rice 1kg", category: "Staples", price: 130, cost: 100, stock: 60 },
       { shopId: shop1._id, name: "Tata Sampann Toor Dal 1kg", category: "Staples", price: 160, cost: 110, stock: 75 },
       { shopId: shop1._id, name: "Fortune Sunlite Oil 1L", category: "Staples", price: 150, cost: 115, stock: 55 },
       { shopId: shop1._id, name: "Tata Salt 1kg", category: "Staples", price: 30, cost: 20, stock: 200 },
       { shopId: shop1._id, name: "Rajdhani Besan 500g", category: "Staples", price: 70, cost: 45, stock: 80 },
       { shopId: shop1._id, name: "MTR Rava Idli Mix 500g", category: "Staples", price: 105, cost: 70, stock: 50 },
       { shopId: shop1._id, name: "Sugar 1kg", category: "Staples", price: 45, cost: 40, stock: 150 },
       { shopId: shop1._id, name: "Saffola Masala Oats 500g", category: "Staples", price: 170, cost: 130, stock: 65 },
       { shopId: shop1._id, name: "Parachute Coconut Oil 250ml", category: "Staples", price: 120, cost: 110, stock: 70 },
       { shopId: shop1._id, name: "MDH Deggi Mirch 100g", category: "Groceries", price: 70, cost: 65, stock: 90 },
       { shopId: shop1._id, name: "Everest Turmeric Powder 200g", category: "Groceries", price: 55, cost: 51, stock: 85 },
       { shopId: shop1._id, name: "Kissan Tomato Ketchup 950g", category: "Groceries", price: 130, cost: 115, stock: 45 },
       { shopId: shop1._id, name: "Maggi Noodles Family Pack", category: "Groceries", price: 45, cost: 25, stock: 200 },
       { shopId: shop1._id, name: "Kissan Mixed Fruit Jam 700g", category: "Groceries", price: 205, cost: 160, stock: 40 },
       { shopId: shop1._id, name: "Nutella Hazelnut Spread 350g", category: "Groceries", price: 400, cost: 320, stock: 25 },
       { shopId: shop1._id, name: "Ching's Schezwan Chutney", category: "Groceries", price: 80, cost: 60, stock: 50 },
       { shopId: shop1._id, name: "MDH Garam Masala 100g", category: "Groceries", price: 82, cost: 68, stock: 90 },
       { shopId: shop1._id, name: "Catch Black Pepper Powder", category: "Groceries", price: 105, cost: 80, stock: 60 },
       { shopId: shop1._id, name: "Weikfield Baking Powder 100g", category: "Groceries", price: 30, cost: 24, stock: 70 },
       { shopId: shop1._id, name: "Amul Milk 1L", category: "Dairy", price: 60, cost: 52, stock: 50 },
       { shopId: shop1._id, name: "Britannia Cheese Slices 100g", category: "Dairy", price: 80, cost: 72, stock: 65 },
       { shopId: shop1._id, name: "Amul Butter 100g", category: "Dairy", price: 52, cost: 47, stock: 100 },
       { shopId: shop1._id, name: "McCain Smiles 415g", category: "Frozen Foods", price: 99, cost: 85, stock: 30 },
       { shopId: shop1._id, name: "Kwality Wall's Cornetto", category: "Frozen Foods", price: 40, cost: 35, stock: 80 },
       { shopId: shop1._id, name: "Coca-Cola 750ml", category: "Beverages", price: 40, cost: 35, stock: 80 },
       { shopId: shop1._id, name: "Paper Boat Aamras 1L", category: "Beverages", price: 110, cost: 95, stock: 50 },
       { shopId: shop1._id, name: "Tata Tea Gold 500g", category: "Beverages", price: 280, cost: 245, stock: 40 },
       { shopId: shop1._id, name: "Bru Instant Coffee 100g", category: "Beverages", price: 210, cost: 185, stock: 35 },
       { shopId: shop1._id, name: "Bournvita Health Drink 500g", category: "Beverages", price: 240, cost: 210, stock: 45 },
       { shopId: shop1._id, name: "Parle-G Biscuit 100g", category: "Snacks", price: 10, cost: 8, stock: 500 },
       { shopId: shop1._id, name: "Cadbury Dairy Milk", category: "Snacks", price: 20, cost: 17, stock: 250 },
       { shopId: shop1._id, name: "Lays Chips - Magic Masala", category: "Snacks", price: 20, cost: 17, stock: 300 },
       { shopId: shop1._id, name: "Haldiram's Bhujia 400g", category: "Snacks", price: 90, cost: 82, stock: 100 },
       { shopId: shop1._id, name: "Britannia Good Day Cookies", category: "Snacks", price: 30, cost: 25, stock: 150 },
       { shopId: shop1._id, name: "Sunfeast Dark Fantasy", category: "Snacks", price: 35, cost: 31, stock: 120 },
       { shopId: shop1._id, name: "Bingo Mad Angles", category: "Snacks", price: 10, cost: 8, stock: 250 },
       { shopId: shop1._id, name: "Kurkure Masala Munch", category: "Snacks", price: 10, cost: 8, stock: 280 },
       { shopId: shop1._id, name: "Too Yumm Karare", category: "Snacks", price: 20, cost: 17, stock: 180 },
       { shopId: shop1._id, name: "Pop Pringles", category: "Snacks", price: 105, cost: 90, stock: 50 },
       { shopId: shop1._id, name: "Dettol Soap 75g", category: "Personal Care", price: 35, cost: 31, stock: 120 },
       { shopId: shop1._id, name: "Colgate MaxFresh Toothpaste 150g", category: "Personal Care", price: 95, cost: 84, stock: 70 },
       { shopId: shop1._id, name: "Head & Shoulders Shampoo 180ml", category: "Personal Care", price: 160, cost: 135, stock: 60 },
       { shopId: shop1._id, name: "Nivea Body Lotion 200ml", category: "Personal Care", price: 220, cost: 190, stock: 50 },
       { shopId: shop1._id, name: "Gillette Mach3 Razor", category: "Personal Care", price: 130, cost: 110, stock: 40 },
       { shopId: shop1._id, name: "Surf Excel 1kg", category: "Household", price: 250, cost: 190, stock: 30 },
       { shopId: shop1._id, name: "Lizol Floor Cleaner 975ml", category: "Household", price: 195, cost: 170, stock: 45 },
       { shopId: shop1._id, name: "Harpic Toilet Cleaner 500ml", category: "Household", price: 93, cost: 80, stock: 50 },
       { shopId: shop1._id, name: "Good Knight Refill", category: "Household", price: 75, cost: 60, stock: 95 },
       { shopId: shop1._id, name: "Vim Dishwash Bar", category: "Household", price: 10, cost: 8, stock: 200 },
     ];
    const products = await Product.insertMany(productsData);
    shop1.products = products.map((p) => p._id);
    await shop1.save(); // Saves employees and products to the shop document
    console.log(`${products.length} products created.`);

    // --- Generate Orders with Profit ---
    console.log("Generating 250 random orders with profit calculation...");
    const billerNames = [employee1.name, employee2.name];
    const ordersToCreate = [];
    const customerNames = [
      "Suresh", "Priya", "Amit", "Sunita", "Rahul", "Deepa",
      "Vikas", "Pooja", "Rohan", "Walk-in Customer",
    ];

    for (let i = 0; i < 250; i++) {
      let orderTotalRevenue = 0;
      let orderTotalCost = 0; // --- ADDED ---
      const orderItems = [];
      const itemCount = Math.floor(Math.random() * 5) + 1;

      for (let j = 0; j < itemCount; j++) {
        const randomProduct = products[Math.floor(Math.random() * products.length)];
        const quantity = Math.floor(Math.random() * 4) + 1;

        // Ensure we don't 'sell' more than available in seed data (optional, good practice)
        const sellQuantity = Math.min(quantity, randomProduct.stock || 0);
        if (sellQuantity <= 0) continue; // Skip if product somehow has 0 stock

        orderItems.push({
          productId: randomProduct._id,
          name: randomProduct.name,
          quantity: sellQuantity,
          price: randomProduct.price,
          cost: randomProduct.cost, // --- ADDED ---
        });
        orderTotalRevenue += randomProduct.price * sellQuantity;
        orderTotalCost += randomProduct.cost * sellQuantity; // --- ADDED ---
      }

      if (orderItems.length === 0) continue; // Skip if no valid items added

      const orderTotalProfit = orderTotalRevenue - orderTotalCost; // --- ADDED ---
      const randomBiller = billerNames[Math.floor(Math.random() * billerNames.length)];

      ordersToCreate.push({
        shopId: shop1._id,
        customerName: customerNames[Math.floor(Math.random() * customerNames.length)],
        billerName: randomBiller,
        items: orderItems,
        total: orderTotalRevenue, // Total Revenue
        totalProfit: orderTotalProfit, // --- ADDED ---
        date: getRandomDate(),
      });
    }

    await Order.insertMany(ordersToCreate);
    console.log(`${ordersToCreate.length} orders created.`);
    // Note: This seed script does not generate PDF invoices or update stock like the API does.

    console.log("Database seeding completed successfully! 🎉");
  } catch (error) {
    console.error("Error during seeding:", error);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB disconnected.");
  }
};

seedData();