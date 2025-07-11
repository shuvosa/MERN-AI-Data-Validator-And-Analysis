
const express = require('express');
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { PineconeClient } = require('@pinecone-database/pinecone');
const { Document } = require('langchain/document');
const Papa = require('papaparse');
const mongoose = require('mongoose');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

require('dotenv').config();

const app = express();
const port = 3000;

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Middleware
app.use(cors());
app.use(express.json());

// Multer configuration for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Initialize Pinecone
const pinecone = new PineconeClient();
await pinecone.init({
  environment: process.env.PINECONE_ENVIRONMENT,
  apiKey: process.env.PINECONE_API_KEY,
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

// Data Schema
const DatasetSchema = new mongoose.Schema({
  name: String,
  data: Object,
  analysis: Object,
  categories: Object,
  visualizations: Object,
  sqlAnalysis: Object,
  createdAt: { type: Date, default: Date.now }
});

const Dataset = mongoose.model('Dataset', DatasetSchema);

// Helper function to parse CSV data
function parseCSV(buffer) {
  return new Promise((resolve, reject) => {
    Papa.parse(buffer.toString(), {
      header: true,
      complete: (results) => resolve(results.data),
      error: (error) => reject(error)
    });
  });
}

// Helper function to create Supabase table from data
async function createSupabaseTable(data) {
  if (!data || data.length === 0) return null;

  const tableName = 'dataset_' + Date.now();
  const sample = data[0];
  const columns = Object.keys(sample);

  // Create table with dynamic columns
  const columnDefs = columns.map(col => {
    const value = sample[col];
    let type = 'text';
    if (typeof value === 'number') type = 'numeric';
    else if (typeof value === 'boolean') type = 'boolean';
    return `${col.replace(/[^a-zA-Z0-9_]/g, '_')} ${type}`;
  });

  try {
    // Create the table
    await supabase.rpc('create_dynamic_table', {
      table_name: tableName,
      column_definitions: columnDefs
    });

    // Insert data
    const { error } = await supabase
      .from(tableName)
      .insert(data);

    if (error) throw error;

    return tableName;
  } catch (error) {
    console.error('Error creating Supabase table:', error);
    throw error;
  }
}

// Helper function to perform SQL analysis
async function analyzeSQLData(tableName) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  // Get table information
  const { data: tableInfo, error: tableError } = await supabase
    .from('information_schema.columns')
    .select('*')
    .eq('table_name', tableName);

  if (tableError) throw tableError;

  // Get sample data
  const { data: sampleData, error: sampleError } = await supabase
    .from(tableName)
    .select('*')
    .limit(5);

  if (sampleError) throw sampleError;

  // Get basic statistics for each column
  const stats = {};
  for (const column of tableInfo) {
    const { data: colStats, error: statsError } = await supabase
      .rpc('column_statistics', {
        table_name: tableName,
        column_name: column.column_name
      });

    if (statsError) throw statsError;
    stats[column.column_name] = colStats[0];
  }

  const prompt = `Analyze this SQL database schema and statistics:
    Schema: ${JSON.stringify(tableInfo)}
    Sample Data: ${JSON.stringify(sampleData)}
    Column Statistics: ${JSON.stringify(stats)}
    
    Please provide:
    1. Key SQL queries for data analysis
    2. Statistical insights
    3. Data quality metrics
    4. Recommended indexes
    5. Performance optimization suggestions
    
    Format the response as JSON with the following structure:
    {
      "queries": {
        "basic": string[],
        "advanced": string[]
      },
      "insights": {
        "statistical": string[],
        "relationships": string[]
      },
      "quality": {
        "metrics": object,
        "suggestions": string[]
      },
      "optimization": {
        "indexes": string[],
        "performance": string[]
      }
    }`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return JSON.parse(response.text());
}

// Helper function to analyze data quality
async function analyzeDataQuality(data) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `Analyze this dataset for quality and consistency issues:
    ${JSON.stringify(data)}
    
    Please provide:
    1. Overall data quality score (0-100)
    2. List of potential issues
    3. Recommendations for cleaning
    4. Identify missing data rows and fields
    
    Format the response as JSON with the following structure:
    {
      "qualityScore": number,
      "issues": string[],
      "recommendations": string[],
      "missingData": {
        "rows": number[],
        "fields": string[]
      }
    }`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return JSON.parse(response.text());
}

// Helper function to clean data
async function cleanData(data, missingData) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `Clean this dataset by handling missing and inconsistent data:
    Dataset: ${JSON.stringify(data)}
    Missing Data Info: ${JSON.stringify(missingData)}
    
    Please:
    1. Fill missing values with appropriate defaults or predictions
    2. Remove or fix inconsistent entries
    3. Standardize formats
    4. Handle outliers
    
    Return the cleaned dataset as a JSON array.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return JSON.parse(response.text());
}

// Helper function to categorize data
async function categorizeData(data) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `Analyze and categorize this dataset:
    ${JSON.stringify(data)}
    
    Please provide:
    1. Main data categories identified
    2. Distribution of data across categories (in percentages)
    3. Key patterns and insights for each category
    4. Suggested data groupings
    
    Format the response as JSON with the following structure:
    {
      "categories": [],
      "distribution": {},
      "insights": {},
      "groupings": []
    }`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return JSON.parse(response.text());
}

// Helper function to suggest visualizations
async function suggestVisualizations(data, objectives) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `Based on this dataset and user objectives:
    Dataset: ${JSON.stringify(data)}
    Objectives: ${JSON.stringify(objectives)}
    
    Suggest appropriate visualizations that best represent the data and meet the objectives.
    
    Please provide:
    1. List of recommended chart types with explanations
    2. Key metrics to highlight
    3. Color schemes and design suggestions
    4. Interactive features to consider
    
    Format the response as JSON with the following structure:
    {
      "recommendations": [
        {
          "chartType": "",
          "explanation": "",
          "metrics": [],
          "design": {
            "colors": [],
            "interactions": []
          }
        }
      ],
      "priority": []
    }`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return JSON.parse(response.text());
}

// API Routes
app.post('/api/analyze', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const objectives = req.body.objectives || [];

    // Parse the file
    let data;
    if (req.file.mimetype === 'text/csv') {
      data = await parseCSV(req.file.buffer);
    } else if (req.file.mimetype === 'application/json') {
      data = JSON.parse(req.file.buffer.toString());
    } else {
      return res.status(400).json({ error: 'Unsupported file type' });
    }

    // Create Supabase table and perform SQL analysis
    const tableName = await createSupabaseTable(data);
    const sqlAnalysis = await analyzeSQLData(tableName);

    // Analyze data quality using Gemini AI
    const analysis = await analyzeDataQuality(data);
    
    // Categorize data
    const categories = await categorizeData(data);

    // Get visualization suggestions
    const visualizations = await suggestVisualizations(data, objectives);

    // Store in MongoDB
    const dataset = new Dataset({
      name: req.file.originalname,
      data: data,
      analysis: analysis,
      categories: categories,
      visualizations: visualizations,
      sqlAnalysis: sqlAnalysis
    });
    await dataset.save();

    // Create embeddings and store in Pinecone for vector search
    const docs = data.map(row => new Document({ pageContent: JSON.stringify(row) }));
    
    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX);
    await PineconeStore.fromDocuments(docs, {
      pineconeIndex,
      namespace: req.file.originalname,
    });

    res.json({ analysis, categories, visualizations, sqlAnalysis });
  } catch (error) {
    console.error('Error processing file:', error);
    res.status(500).json({ error: 'Error processing file' });
  }
});

// Execute custom SQL query
app.post('/api/sql/query', express.json(), async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'No query provided' });
    }

    const { data, error } = await supabase.rpc('execute_query', {
      query_text: query
    });

    if (error) throw error;
    res.json({ results: data });
  } catch (error) {
    console.error('Error executing SQL query:', error);
    res.status(500).json({ error: 'Error executing SQL query' });
  }
});

// New endpoint for cleaning data
app.post('/api/clean', express.json(), async (req, res) => {
  try {
    const { data, missingData } = req.body;
    if (!data || !missingData) {
      return res.status(400).json({ error: 'Missing required data' });
    }

    // Clean the data
    const cleanedData = await cleanData(data, missingData);
    
    // Re-analyze the cleaned data
    const newAnalysis = await analyzeDataQuality(cleanedData);
    
    // Update Supabase table with cleaned data
    const tableName = await createSupabaseTable(cleanedData);
    const sqlAnalysis = await analyzeSQLData(tableName);
    
    res.json({
      data: cleanedData,
      analysis: newAnalysis,
      sqlAnalysis
    });
  } catch (error) {
    console.error('Error cleaning data:', error);
    res.status(500).json({ error: 'Error cleaning data' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});