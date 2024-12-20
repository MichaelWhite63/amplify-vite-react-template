import React, { useState } from 'react';
import { generateClient } from 'aws-amplify/data';

import type { Schema } from '../amplify/data/resource';

const client = generateClient<Schema>();

interface News {
    id: number;
    title: string;
    group: number;
    writtenBy: string;
    date: string;
    lDate: string;
    source: string;
    memo: string;
    ord: number;
    rank: number;
    header: string;
    published: boolean;
    newField: boolean;
    type: 'Steel' | 'Auto' | 'Aluminum';
  }
  
const NewsSearch: React.FC = () => {
  const [searchString, setSearchString] = useState('');
  const [results, setResults] = useState<News[]>([]);

  const handleSearch = async () => {
    try {
      const response = await client.queries.newsSearch({ searchString });
      setResults(response.data ? (JSON.parse(response.data) as News[]) : []);
    } catch (error) {
      console.error('Error fetching news:', error);
    }
  };

  return (
    <div>
      <h1>News Search</h1>
      <input
        type="text"
        value={searchString}
        onChange={(e) => setSearchString(e.target.value)}
        placeholder="Enter search string"
      />
      <button onClick={handleSearch}>Search</button>
      <div>
        {results.length > 0 ? (
          <ul>
            {results.map((item, index) => (
              <li key={index}>{item.title}</li>
            ))}
          </ul>
        ) : (
          <p>No results found</p>
        )}
      </div>
    </div>
  );
};

export default NewsSearch;