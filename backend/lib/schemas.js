// backend/lib/schemas.js

// This is a simplified, text-based representation of your Mongoose models
// for the AI to understand.

export const SCHEMAS = `
You have access to the following Mongoose models and schemas:

1.  **Product Model** (Collection: "products")
    * Description: Represents a single product in the shop's inventory.
    * Schema:
        {
          "shopId": { "type": "ObjectId", "ref": "Shop" },
          "name": { "type": "String" },
          "category": { "type": "String" },
          "price": { "type": "Number" }, // Selling price to customer
          "cost": { "type": "Number" }, // Purchase cost from supplier
          "stock": { "type": "Number" } // Current quantity in stock
        }

2.  **Order Model** (Collection: "orders")
    * Description: Represents a single sale/order made.
    * Schema:
        {
          "shopId": { "type": "ObjectId", "ref": "Shop" },
          "customerName": { "type": "String" },
          "billerName": { "type": "String" }, // The employee who made the sale
          "items": [
            {
              "productId": { "type": "ObjectId", "ref": "Product" },
              "name": { "type": "String" },
              "quantity": { "type": "Number" },
              "price": { "type": "Number" } // The price at the time of sale
            }
          ],
          "total": { "type": "Number" },
          "date": { "type": "Date" }
        }

3.  **Invoice Model** (Collection: "invoices")
    * Description: Stores the PDF invoice reference for an order.
    * Schema:
        {
          "shopId": { "type": "ObjectId", "ref": "Shop" },
          "orderId": { "type": "ObjectId", "ref": "Order" },
          "pdfPath": { "type": "String" },
          "customerName": { "type": "String" },
          "billerName": { "type": "String" },
          "total": { "type": "Number" },
          "date": { "type": "Date" }
        }

4.  **User Model** (Collection: "users")
    * Description: Represents an owner or employee.
    * Schema:
        {
          "name": { "type": "String" },
          "email": { "type": "String" },
          "role": { "type": "String", "enum": ["owner", "employee"] },
          "shopId": { "type": "ObjectId", "ref": "Shop" },
          "salary": {
            "amount": { "type": "Number" },
            "status": { "type": "String", "enum": ["paid", "pending"] }
          }
        }
`;