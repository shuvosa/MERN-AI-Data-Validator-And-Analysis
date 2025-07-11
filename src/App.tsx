import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Database, FileSpreadsheet, CheckCircle2, AlertCircle, PieChart, Layers, Lightbulb, BarChart2, Target, Sparkles, Code2 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import SQLQueryVisualizer from './components/SQLQueryVisualizer';

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [analysis, setAnalysis] = useState<any>(null);
  const [categories, setCategories] = useState<any>(null);
  const [visualizations, setVisualizations] = useState<any>(null);
  const [sqlAnalysis, setSqlAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [cleaning, setCleaning] = useState(false);
  const [objectives, setObjectives] = useState<string[]>([]);
  const [newObjective, setNewObjective] = useState('');
  const [customQuery, setCustomQuery] = useState('');
  const [queryResults, setQueryResults] = useState<any>(null);
  const [executingQuery, setExecutingQuery] = useState(false);
  const [sqlQuery, setSqlQuery] = useState('');

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'text/csv': ['.csv'],
      'application/json': ['.json']
    },
    onDrop: (acceptedFiles) => {
      setFile(acceptedFiles[0]);
      toast.success('File uploaded successfully!');
    }
  });

  const handleAddObjective = () => {
    if (newObjective.trim()) {
      setObjectives([...objectives, newObjective.trim()]);
      setNewObjective('');
    }
  };

  const handleRemoveObjective = (index: number) => {
    setObjectives(objectives.filter((_, i) => i !== index));
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('objectives', JSON.stringify(objectives));

    try {
      const response = await fetch('http://localhost:3000/api/analyze', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      setData(result.data);
      setAnalysis(result.analysis);
      setCategories(result.categories);
      setVisualizations(result.visualizations);
      setSqlAnalysis(result.sqlAnalysis);
      toast.success('Analysis complete!');
    } catch (error) {
      console.error('Error analyzing file:', error);
      toast.error('Error analyzing file');
    } finally {
      setLoading(false);
    }
  };

  const handleCleanData = async () => {
    if (!data || !analysis?.missingData) return;

    setCleaning(true);
    try {
      const response = await fetch('http://localhost:3000/api/clean', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: data,
          missingData: analysis.missingData
        })
      });

      const result = await response.json();
      setData(result.data);
      setAnalysis(result.analysis);
      setSqlAnalysis(result.sqlAnalysis);
      toast.success('Data cleaned successfully!');
    } catch (error) {
      console.error('Error cleaning data:', error);
      toast.error('Error cleaning data');
    } finally {
      setCleaning(false);
    }
  };

  const executeCustomQuery = async () => {
    if (!customQuery.trim()) return;

    setExecutingQuery(true);
    try {
      const response = await fetch('http://localhost:3000/api/sql/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: customQuery })
      });

      const result = await response.json();
      setQueryResults(result.results);
      toast.success('Query executed successfully!');
    } catch (error) {
      console.error('Error executing query:', error);
      toast.error('Error executing query');
    } finally {
      setExecutingQuery(false);
    }
  };

  const handleExecuteQuery = async () => {
    if (!sqlQuery.trim()) return;

    try {
      const response = await fetch('http://localhost:3000/api/sql/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: sqlQuery })
      });
      
      const result = await response.json();
      if (result.error) {
        toast.error(result.error);
      } else {
        setQueryResults(result.results);
        toast.success('Query executed successfully!');
      }
    } catch (error) {
      console.error('Error executing query:', error);
      toast.error('Error executing query');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Toaster position="top-right" />
      
      <div className="container mx-auto px-4 py-8">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4">AI Data Validator</h1>
          <p className="text-gray-400">Powered by Gemini AI & LangChain</p>
        </header>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div
              {...getRootProps()}
              className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
            >
              <input {...getInputProps()} />
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg mb-2">Drop your CSV or JSON file here</p>
              <p className="text-sm text-gray-500">or click to select files</p>
            </div>

            {/* Objectives Input */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <Target className="mr-2" />
                Analysis Objectives
              </h3>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newObjective}
                  onChange={(e) => setNewObjective(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddObjective()}
                  placeholder="Enter analysis objective..."
                  className="flex-1 px-3 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleAddObjective}
                  className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {objectives.map((objective, index) => (
                  <div key={index} className="flex items-center gap-2 bg-gray-700 px-3 py-1 rounded-full">
                    <span>{objective}</span>
                    <button
                      onClick={() => handleRemoveObjective(index)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {file && (
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileSpreadsheet className="text-green-500" />
                  <span>{file.name}</span>
                </div>
                <button
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? 'Analyzing...' : 'Analyze Data'}
                </button>
              </div>
            )}

            {/* SQL Query Section */}
            {sqlAnalysis && (
              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <Code2 className="mr-2" />
                  Custom SQL Query
                </h3>
                <div className="space-y-4">
                  <textarea
                    value={customQuery}
                    onChange={(e) => setCustomQuery(e.target.value)}
                    placeholder="Enter your SQL query..."
                    className="w-full h-32 px-3 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                  />
                  <button
                    onClick={executeCustomQuery}
                    disabled={executingQuery || !customQuery.trim()}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {executingQuery ? 'Executing...' : 'Execute Query'}
                  </button>
                  
                  {queryResults && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Query Results:</h4>
                      <div className="overflow-x-auto">
                        <table className="min-w-full bg-gray-700 rounded-lg">
                          <thead>
                            <tr>
                              {Object.keys(queryResults[0] || {}).map((key) => (
                                <th key={key} className="px-4 py-2 text-left text-sm font-medium text-gray-300">
                                  {key}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {queryResults.map((row: any, i: number) => (
                              <tr key={i} className="border-t border-gray-600">
                                {Object.values(row).map((value: any, j: number) => (
                                  <td key={j} className="px-4 py-2 text-sm">
                                    {String(value)}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {/* Analysis Results */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Database className="mr-2" />
                Analysis Results
              </h2>
              
              {analysis ? (
                <div className="space-y-4">
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <h3 className="font-medium mb-2 flex items-center">
                      <CheckCircle2 className="text-green-500 mr-2" />
                      Data Quality Score
                    </h3>
                    <div className="text-2xl font-bold">{analysis.qualityScore}%</div>
                  </div>

                  <div className="bg-gray-700 p-4 rounded-lg">
                    <h3 className="font-medium mb-2 flex items-center">
                      <AlertCircle className="text-yellow-500 mr-2" />
                      Issues Found
                    </h3>
                    <ul className="list-disc list-inside space-y-2">
                      {analysis.issues?.map((issue: string, index: number) => (
                        <li key={index} className="text-gray-300">{issue}</li>
                      ))}
                    </ul>
                  </div>

                  {analysis.missingData && (
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <h3 className="font-medium mb-2 flex items-center">
                        <Sparkles className="text-blue-500 mr-2" />
                        Missing Data
                      </h3>
                      <div className="space-y-2">
                        <p className="text-gray-300">
                          Rows with missing data: {analysis.missingData.rows.length}
                        </p>
                        <p className="text-gray-300">
                          Fields with missing values: {analysis.missingData.fields.join(', ')}
                        </p>
                      </div>
                      <button
                        onClick={handleCleanData}
                        disabled={cleaning}
                        className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {cleaning ? 'Cleaning...' : 'Clean Data'}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-12">
                  Upload and analyze a file to see results
                </div>
              )}
            </div>

            {/* SQL Analysis Section */}
            {sqlAnalysis && (
              <div className="bg-gray-800 rounded-lg p-6 mt-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Database className="mr-2" />
                  SQL Analysis
                </h2>

                {/* SQL Query Interface */}
                <div className="bg-gray-700 p-4 rounded-lg mb-4">
                  <h3 className="font-medium mb-3">Custom SQL Query</h3>
                  <div className="space-y-3">
                    <textarea
                      value={sqlQuery}
                      onChange={(e) => setSqlQuery(e.target.value)}
                      placeholder="Enter your SQL query..."
                      className="w-full h-32 px-3 py-2 bg-gray-800 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleExecuteQuery}
                      className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Execute Query
                    </button>
                  </div>
                </div>

                {/* Query Results */}
                {queryResults.length > 0 && (
                  <>
                    <div className="bg-gray-700 p-4 rounded-lg mb-4 overflow-x-auto">
                      <h3 className="font-medium mb-3">Query Results</h3>
                      <table className="min-w-full">
                        <thead>
                          <tr>
                            {Object.keys(queryResults[0]).map((key) => (
                              <th key={key} className="px-4 py-2 text-left text-gray-300">
                                {key}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {queryResults.map((row, i) => (
                            <tr key={i} className="border-t border-gray-600">
                              {Object.values(row).map((value: any, j) => (
                                <td key={j} className="px-4 py-2 text-gray-300">
                                  {value?.toString() || ''}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Visualization */}
                    <SQLQueryVisualizer data={queryResults} query={sqlQuery} />
                  </>
                )}

                {/* Recommended Queries */}
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="font-medium mb-3">Recommended Queries</h3>
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-2">Basic Analysis:</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {sqlAnalysis.queries.basic.map((query: string, index: number) => (
                          <li key={index} className="text-sm text-gray-300">
                            <code className="bg-gray-800 px-2 py-1 rounded">{query}</code>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-2">Advanced Analysis:</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {sqlAnalysis.queries.advanced.map((query: string, index: number) => (
                          <li key={index} className="text-sm text-gray-300">
                            <code className="bg-gray-800 px-2 py-1 rounded">{query}</code>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Statistical Insights */}
                <div className="bg-gray-700 p-4 rounded-lg mt-4">
                  <h3 className="font-medium mb-3">Statistical Insights</h3>
                  <ul className="list-disc list-inside space-y-2">
                    {sqlAnalysis.insights.statistical.map((insight: string, index: number) => (
                      <li key={index} className="text-gray-300">{insight}</li>
                    ))}
                  </ul>
                </div>

                {/* Data Relationships */}
                <div className="bg-gray-700 p-4 rounded-lg mt-4">
                  <h3 className="font-medium mb-3">Data Relationships</h3>
                  <ul className="list-disc list-inside space-y-2">
                    {sqlAnalysis.insights.relationships.map((relationship: string, index: number) => (
                      <li key={index} className="text-gray-300">{relationship}</li>
                    ))}
                  </ul>
                </div>

                {/* Optimization Suggestions */}
                <div className="bg-gray-700 p-4 rounded-lg mt-4">
                  <h3 className="font-medium mb-3">Optimization Suggestions</h3>
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-2">Recommended Indexes:</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {sqlAnalysis.optimization.indexes.map((index: string, i: number) => (
                          <li key={i} className="text-gray-300">{index}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-2">Performance Tips:</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {sqlAnalysis.optimization.performance.map((tip: string, i: number) => (
                          <li key={i} className="text-gray-300">{tip}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Data Categories */}
            {categories && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Layers className="mr-2" />
                  Data Categories
                </h2>
                
                <div className="space-y-4">
                  {/* Main Categories */}
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <h3 className="font-medium mb-2 flex items-center">
                      <PieChart className="text-blue-500 mr-2" />
                      Category Distribution
                    </h3>
                    <div className="space-y-2">
                      {Object.entries(categories.distribution).map(([category, percentage]: [string, any]) => (
                        <div key={category} className="flex justify-between items-center">
                          <span className="text-gray-300">{category}</span>
                          <span className="font-semibold">{percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Insights */}
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <h3 className="font-medium mb-2 flex items-center">
                      <Lightbulb className="text-yellow-500 mr-2" />
                      Key Insights
                    </h3>
                    <div className="space-y-2">
                      {Object.entries(categories.insights).map(([category, insight]: [string, any]) => (
                        <div key={category} className="mb-3">
                          <h4 className="font-medium text-blue-400 mb-1">{category}</h4>
                          <p className="text-gray-300 text-sm">{insight}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Suggested Groupings */}
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Suggested Groupings</h3>
                    <div className="flex flex-wrap gap-2">
                      {categories.groupings.map((group: string, index: number) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-600 rounded-full text-sm"
                        >
                          {group}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Visualization Suggestions */}
            {visualizations && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <BarChart2 className="mr-2" />
                  Visualization Suggestions
                </h2>
                
                <div className="space-y-4">
                  {visualizations.recommendations.map((rec: any, index: number) => (
                    <div key={index} className="bg-gray-700 p-4 rounded-lg">
                      <h3 className="font-medium text-blue-400 mb-2">{rec.chartType}</h3>
                      <p className="text-gray-300 text-sm mb-3">{rec.explanation}</p>
                      
                      {/* Metrics */}
                      <div className="mb-3">
                        <h4 className="text-sm font-medium text-gray-400 mb-1">Key Metrics:</h4>
                        <div className="flex flex-wrap gap-2">
                          {rec.metrics.map((metric: string, i: number) => (
                            <span key={i} className="px-2 py-1 bg-gray-600 rounded-full text-xs">
                              {metric}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Design Suggestions */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-400">Design Suggestions:</h4>
                        <div className="flex gap-2">
                          {rec.design.colors.map((color: string, i: number) => (
                            <div
                              key={i}
                              className="w-6 h-6 rounded-full"
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>
                        <div className="text-sm text-gray-400">
                          <span className="font-medium">Interactions: </span>
                          {rec.design.interactions.join(', ')}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Priority Order */}
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Recommended Implementation Order</h3>
                    <ol className="list-decimal list-inside space-y-1">
                      {visualizations.priority.map((item: string, index: number) => (
                        <li key={index} className="text-gray-300">{item}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;