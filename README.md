# MERN-AI-Data-Validator-And-Analysis

Overview
The MERN AI Data Validator is a full-stack web application built using the MERN stack (MongoDB, Express.js, React, Node.js) and enhanced with AI-driven features. It enables users to upload CSV or JSON files, perform data quality analysis, clean datasets, execute SQL queries, and visualize data with AI-powered insights. The application integrates advanced technologies like Gemini AI for data analysis, LangChain for natural language processing, Pinecone for vector search, and Supabase for SQL-based data storage and querying. It also uses Recharts for data visualization and Tailwind CSS for a modern, responsive UI.
This project is designed to help users validate, clean, and analyze datasets while providing actionable insights through AI-driven recommendations, SQL query execution, and visualization suggestions.

Features

File Upload and Parsing: Supports CSV and JSON file uploads using react-dropzone and papaparse.
AI-Powered Data Analysis: Uses Gemini AI to analyze data quality, identify issues (e.g., missing data, inconsistencies), and provide a quality score.
Data Cleaning: Automatically cleans datasets by handling missing values, inconsistencies, and outliers with AI recommendations.
SQL Query Execution: Allows users to execute custom SQL queries on uploaded datasets stored in Supabase tables.
SQL Analysis: Provides AI-generated SQL queries, statistical insights, and optimization suggestions (e.g., recommended indexes, performance tips).
Data Categorization: Identifies categories, distributions, and insights within the dataset using AI.
Visualization Suggestions: Recommends chart types, metrics, and design suggestions (e.g., colors, interactions) for data visualization using Recharts.
Vector Search: Stores data embeddings in Pinecone for efficient vector-based search.
Responsive UI: Built with React, styled with Tailwind CSS, and includes icons from Lucide React.
Real-Time Notifications: Uses react-hot-toast for feedback on actions like file uploads, analysis, and query execution.
Objective-Based Analysis: Users can define analysis objectives to guide AI focus.


Tech Stack
Frontend

React: For building the user interface.
React-Dropzone: For drag-and-drop file uploads.
Lucide-React: For UI icons.
React-Hot-Toast: For toast notifications.
Recharts: For data visualization.
Tailwind CSS: For styling.
Vite: For fast development and production builds.

Backend

Node.js & Express: For the RESTful API.
MongoDB & Mongoose: For storing datasets and analysis results.
Multer: For handling file uploads.
Supabase: For SQL storage and querying.
Pinecone: For vector search and embeddings.
Google Generative AI (Gemini AI): For data quality analysis, cleaning, and visualization suggestions.
LangChain: For natural language processing.
Papaparse: For parsing CSV files.
CORS: For cross-origin requests.
Dotenv: For environment variables.
Nodemon: For auto-restarting the server during development.

Development Tools

ESLint: For linting JavaScript/TypeScript code.
TypeScript: For type safety.
PostCSS & Autoprefixer: For CSS processing with Tailwind.
Vite Plugin React: For React support in Vite.


Project Structure
The project follows a standard MERN stack structure with separate frontend and backend code. Key files and directories include:
```
node_modules/: Node.js dependencies.
src/: Frontend source code (React components, styles, assets).
.env: Environment variables (e.g., API keys, database URIs).
.env.example: Template for .env with placeholder values.
.gitignore: Specifies files/directories ignored by Git (e.g., node_modules, .env).
eslint.config.js: ESLint configuration for code quality.
index.html: Entry point for the React frontend.
package.json: Project metadata, scripts, and dependencies.
package-lock.json: Locks dependency versions.
postcss.config.js: PostCSS configuration for Tailwind CSS.
tailwind.config.js: Tailwind CSS configuration (themes, colors, plugins).
tsconfig.app.json: TypeScript configuration for the app.
tsconfig.json: Base TypeScript configuration.
tsconfig.node.json: TypeScript configuration for Node.js.
vite.config.ts: Vite configuration (plugins, build settings).

```
Key Files

App.tsx: Main React component for frontend UI and functionality (file upload, analysis, SQL queries, visualization).
index.js: Backend entry point (Express server, API routes, integrations with Supabase, Pinecone, Gemini AI, MongoDB).


Installation
Prerequisites

Node.js (v16 or higher)
MongoDB (local or cloud instance)
Supabase Account (for SQL storage and querying)
Pinecone Account (for vector search)
Google Generative AI API Key (for Gemini AI)

Steps

Clone the Repository:
```
git clone https://github.com/your-username/mern-ai-data-validator.git
cd mern-ai-data-validator

```
Install Dependencies:
```
npm install
```

Set Up Environment Variables:
```
Copy .env.example to .env:cp .env.example .env
```
```
Update .env with your credentials:GEMINI_API_KEY=your-gemini-api-key
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_ENVIRONMENT=your-pinecone-environment
PINECONE_INDEX=your-pinecone-index
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
MONGODB_URI=your-mongodb-uri

```


Run the Backend:

Start the Express server:npm run server

```
Runs on http://localhost:3000.
```

Run the Frontend:

In a separate terminal, start the Vite development server:npm run dev


Runs on http://localhost:5173 (or Vite-specified port).


Access the Application:

Open http://localhost:5173 in your browser.




Usage

Upload a File:

Drag and drop a CSV or JSON file into the upload area or click to select.
Supported types: .csv, .json.


Set Analysis Objectives:

Add objectives (e.g., "Identify trends in sales data") to guide AI analysis.
Add/remove objectives as needed.


Analyze Data:

Click "Analyze Data" to process the file.
AI analyzes quality, categorizes data, suggests visualizations, and performs SQL analysis.
Results include quality score, issues, missing data, and SQL insights.


Clean Data:

If issues are detected, click "Clean Data" to let AI handle missing values/inconsistencies.
Updated results are displayed.


Execute SQL Queries:

Enter a custom SQL query in the textarea.
Click "Execute Query" to run it against the dataset in Supabase.
View results in a table with visualizations.


Explore Visualizations:

Review AI-suggested chart types, metrics, and design suggestions.
Use Recharts to create visualizations.




API Endpoints

POST /api/analyze:
```
Request: multipart/form-data with file (CSV/JSON) and optional objectives (JSON string).
Response: Analysis results (quality, categories, visualizations, SQL analysis).
```

POST /api/clean:
```
Request: JSON with data (dataset) and missingData (missing data info).
Response: Cleaned dataset, updated analysis, SQL analysis.
```

POST /api/sql/query:
```
Request: JSON with query (SQL query string).
Response: Query results.
```



Screenshots
(Add screenshots here to showcase the UI, file upload, analysis results, SQL query execution, and visualizations after uploading them to the repository.)

Contributing
Contributions are welcome! Follow these steps:

Fork the repository.
Create a branch (git checkout -b feature/your-feature).
Commit changes (git commit -m "Add your feature").
Push to the branch (git push origin feature/your-feature).
Open a pull request.


License
This project is licensed under the MIT License. See the LICENSE file for details.

Acknowledgments

Google Generative AI: For data analysis and cleaning.
Pinecone: For vector search.
Supabase: For SQL storage and querying.
LangChain: For natural language processing.
Tailwind CSS: For responsive UI.
Recharts: For data visualization.
React Community: For amazing libraries and tools.


Contact
For questions or feedback, reach out to your-email@example.com.
