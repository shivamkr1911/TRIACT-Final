# TRIACT - AI-Powered Inventory Management System

TRIACT is a full-stack web application designed for small shop owners to manage inventory, track sales, and handle employees. It features a powerful local-first AI assistant to answer complex questions about your inventory and provides AI-powered stock forecasting to predict when you'll run out of products.

## ✨ Features

  * **Role-Based Authentication:** Separate accounts and interfaces for Owners and Employees.
  * **Comprehensive Owner Dashboard:** At-a-glance KPIs for revenue, profit, and units sold, with charts for sales trends and category performance.
  * **AI-Powered Stock Forecasting:** An "AI Forecast" column in the stock manager predicts the exact number of days until stock out for every product based on its 90-day sales velocity.
  * **AI Chatbot Assistant:** A local-first AI (powered by Ollama) that uses Retrieval-Augmented Generation (RAG) to answer natural language questions about your database (e.g., "Which snacks are low on stock?" or "What's Rahul's salary status?").
  * **Full Product Management:** A dedicated page to add, edit (price, cost, stock), and filter all products.
  * **Employee & Payroll Management:** A complete interface to add/remove employees and track their salary payments ("Paid" vs. "Due").
  * **Point of Sale (POS):** A "Smart POS" page for creating orders with a fast, searchable product grid.
  * **Automatic PDF Invoice Generation:** Invoices are automatically created, saved to the server, and linked to each order using `pdfkit`.
  * **Real-time Notifications:** In-app alerts for owners when any product's stock runs low.
  * **OCR Invoice Scanning:** Upload an image of an invoice, and the app will use Tesseract.js to extract items and check them against your inventory.

## 🛠 Tech Stack

  * **Frontend:** React (Vite), JavaScript, Tailwind CSS, Chart.js
  * **Backend:** Next.js API Routes (Node.js)
  * **Database:** MongoDB (with Mongoose)
  * **Authentication:** JSON Web Tokens (JWT)
  * **AI (Local RAG & Query):** Ollama (running `gemma3:4b` or a similar model)
  * **AI (OCR):** Tesseract.js

## 🚀 Getting Started

### Prerequisites

  * Node.js (v18 or higher)
  * A MongoDB Atlas account (the free tier is sufficient)
  * Ollama installed on your machine.
  * Git

### 1\. Install Ollama & Pull a Model

This project relies on a locally running AI model.

1.  Download and install [Ollama](https://ollama.com/).

2.  Once installed, run the following command in your terminal to download the AI model this app is configured for:

    ```bash
    ollama pull gemma3:4b
    ```

    (Ensure the Ollama application is running in the background).

### 2\. Clone the Repository

```bash
git clone https://github.com/your-username/TRIACT.git
cd TRIACT
```

### 3\. Backend Setup

Navigate to the `backend` directory:

```bash
cd backend
```

Install all necessary packages:

```bash
npm install
```

Create your own environment file by copying the example:

```bash
cp .env.example .env
```

Open the new `.env` file and add your MongoDB Connection String, a unique JWT Secret, and the port.

```ini
MONGODB_URI="mongodb+srv://<user>:<password>@cluster0.mongodb.net/<dbname>?retryWrites=true&w=majority"
JWT_SECRET="THIS_IS_A_SECRET_KEY_REPLACE_IT"
PORT=3001
FRONTEND_URL="http://localhost:5173"
```

*(No AI API key is needed since we are using the local Ollama server)*

### 4\. Frontend Setup

In a separate terminal, navigate to the `frontend` directory:

```bash
cd frontend
```

Install all necessary packages:

```bash
npm install
```

### 5\. Running the Application

**Run the AI Server:**
Ensure the Ollama application you installed is running.

**Seed the Database (First time only):**
In your **backend** terminal, run the seed script. This will wipe the database and populate it with realistic sample data.

```bash
npm run seed
```

**Start the Backend Server:**
In your **backend** terminal, run:

```bash
npm run dev
```

The backend API will now be running at `http://localhost:3001`.

**Start the Frontend Server:**
In your **frontend** terminal, run:

```bash
npm run dev
```

The React application will now be running at `http://localhost:5173`.

## 🧪 Test Credentials

You can log in and explore the application using the pre-made sample accounts:

**Owner Account:**

  * **Email:** `owner1@example.com`
  * **Password:** `Password123`

**Employee Account:**

  * **Email:** `rahul@example.com`
  * **Password:** `Password123`

## 🤖 Example AI Assistant Questions

Try asking your AI chatbot these questions:

> "Which products are low on stock?"

> "List all products in the 'Beverages' category."

> "Which employees are currently due for payment?"

-----
