// backend/pages/api/shops/[shopId]/ai/chat.js

import connectDB from "../../../../../lib/db.js";
import { authMiddleware } from "../../../../../lib/auth.js";
import { SCHEMAS } from "../../../../../lib/schemas.js";

// Import all the models the AI is allowed to query
import Product from "../../../../../models/Product.js";
import Order from "../../../../../models/Order.js";
import Invoice from "../../../../../models/Invoice.js";
import User from "../../../../../models/User.js";

// A security-focused map of allowed models
const ALLOWED_MODELS = {
  Product,
  Order,
  Invoice,
  User,
};

// --- ADD THIS NEW FUNCTION ---
// --- THIS IS THE NEW REGEX ---
const objectIdRegex = /ObjectId\((?:'([^']*)'|([^)]*))\)/;

/**
 * Recursively cleans a query object from the AI.
 * It finds strings like "ObjectId('...')" and extracts the inner ID.
 */
function cleanMongoQuery(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(cleanMongoQuery);
  }

  const newObj = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];

      if (typeof value === 'string') {
        const match = value.match(objectIdRegex);
        if (match) {
          // Found a bad ObjectId string, extract the real ID
          // --- THIS IS THE NEW LOGIC ---
          // match[1] is for 'id', match[2] is for id (no quotes)
          newObj[key] = match[1] || match[2];
        } else {
          newObj[key] = value;
        }
      } else if (typeof value === 'object') {
        // Recurse into nested objects (like $in, $gte, etc.)
        newObj[key] = cleanMongoQuery(value);
      } else {
        newObj[key] = value;
      }
    }
  }
  return newObj;
}
// --- END OF NEW FUNCTION ---

// --- This helper function calls your local Ollama server ---
async function callOllama(prompt, format) {
  const body = {
    model: "gemma3:4b", // <-- Use the gemma:2b model
    prompt: prompt, 
    stream: false,
    format: format,
    keep_alive: "5m" // <-- ADD THIS LINE // This will be 'json' for the first step
  };

  try {
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      if (response.status === 500) {
         const errorBody = await response.text();
         console.error("Ollama 500 Error Body:", errorBody);
         throw new Error(`Ollama request failed with status 500. Is the model too large for your RAM? Body: ${errorBody}`);
      }
      throw new Error(`Ollama request failed with status ${response.status}`);
    }

    const json = await response.json();
    return json.response; // Ollama puts the text string in the 'response' key
  } catch (e) {
    if (e.code === "ECONNREFUSED") {
      throw new Error("Ollama connection refused. Is Ollama running?");
    }
    throw e;
  }
}

// --- Prompts remain the same ---
const getQueryGenerationPrompt = (question, schemas) => `
You are an expert MongoDB query assistant. Your job is to convert a user's natural language question into a valid, secure MongoDB find() query.
You must only respond with a single JSON object. Do not include any other text, markdown, or explanations.

The database schemas you can use are:
${schemas}

Rules:
1.  Always use regex for string matching (e.g., "lays chips") to make it case-insensitive.
2.  If the question implies sorting, add an "options" key with a "sort" object.
3.  If the question implies a number, add an "options" key with a "limit" object (max 50).
4.  Provide a short "comment" explaining your query.
5.  Only use the models provided: Product, Order, Invoice, User.

Example Question: "Which products are low on stock?"
Example Response:
{
  "model": "Product",
  "query": { "stock": { "$lte": 10 } },
  "options": { "sort": { "stock": 1 }, "limit": 10 },
  "comment": "Searching for products with stock less than or equal to 10, sorting by stock ascending."
}

Now, generate the JSON for the user's question.
User Question: "${question}"
JSON Response:
`;

const getAnswerGenerationPrompt = (question, dbResults) => `
You are a helpful shop assistant AI. You will be given a user's question and the data retrieved from the database.
Your job is to answer the user's question in a friendly, concise, natural language response.

User Question: "${question}"

Database Results (as JSON):
${JSON.stringify(dbResults)}

Rules:
1.  If the results are empty, say you couldn't find any matching information.
2.  If the results are not empty, directly answer the question using the data.
3.  Do not just repeat the JSON. Summarize it.
4.  Be friendly and professional.

Assistant's Answer:
`;

// --- The handler logic is updated ---
async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  await connectDB();
  const { shopId } = req.query;
  const { query: userQuestion } = req.body;

  if (req.user.shopId !== shopId) {
    return res.status(403).json({ message: "Access denied." });
  }
  if (!userQuestion) {
    return res.status(400).json({ message: "Query is required." });
  }

  try {
    // === Step 1: Generate the MongoDB Query ===
    const queryPrompt = getQueryGenerationPrompt(userQuestion, SCHEMAS);
    const combinedQueryPrompt = `You are a MongoDB expert that only replies with a single, valid JSON object and no other text. ${queryPrompt}`;

    const queryGenText = await callOllama(combinedQueryPrompt, "json");

    // --- THIS IS THE NEW (FIXED) CODE ---
    let parsedQuery;
    try {
      // This regex finds the first '{' and the last '}' in the string.
      // This is very effective at extracting a JSON object from text.
      const jsonMatch = queryGenText.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        // If we found a JSON-like block, try to parse *only that block*
        parsedQuery = JSON.parse(jsonMatch[0]);
      } else {
        // If no '{...}' block was found at all, it's an invalid response.
        throw new Error("No JSON object found in AI response");
      }

  } catch (e) {
      console.error("AI failed to generate valid JSON. Raw response:", queryGenText);
      console.error("Parse Error:", e.message); // Log the specific parse error
      return res.status(500).json({ answer: "The AI assistant had trouble understanding that. Please rephrase your question." });
  }
  // ---

    // --- THIS IS THE FIXED CODE ---
    const modelName = parsedQuery.model || parsedQuery.model_name;
    const { query, options, comment } = parsedQuery;

    // === Step 2: Securely Execute the Query ===
    const Model = ALLOWED_MODELS[modelName];
    if (!Model) { 
      console.error("AI returned invalid JSON structure. 'model' key is missing or invalid. Full AI Response:", parsedQuery); 
      return res.status(400).json({ answer: "I can't answer questions about that topic." });
    }

    // --- ADD THIS LINE TO CLEAN THE QUERY ---
    const cleanedQuery = cleanMongoQuery(query);

    // IMPORTANT: Inject the shopId into every query for security
    const secureQuery = { ...cleanedQuery, shopId: shopId }; // <-- Use cleanedQuery

    const queryOptions = {
        limit: options?.limit || 20, 
        sort: options?.sort || { createdAt: -1 },
    };

    const dbResults = await Model.find(secureQuery, null, queryOptions).lean();

    // === Step 3: Generate the Final Answer ===
    const answerPrompt = getAnswerGenerationPrompt(userQuestion, dbResults);
    const combinedAnswerPrompt = `You are a friendly and helpful shop assistant. ${answerPrompt}`;

    const finalAnswer = await callOllama(combinedAnswerPrompt, null); // null format = plain text

    res.status(200).json({ answer: finalAnswer, debugComment: comment });

  } catch (error) {
    console.error("AI Chat Error:", error);
    if (error.message.includes("Ollama connection refused")) {
       return res.status(500).json({ answer: "I can't connect to the local AI server. Did you install and run Ollama?" });
    }
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export default authMiddleware(handler);