import React, { useState } from 'react';
import { API } from 'aws-amplify';
import type { Schema } from '../amplify/data/resource';

const NewsSearch: React.FC = () => {
  const [searchString, setSearchString] = useState('');
  const [results, setResults] = useState<any[]>([]);

  const handleSearch = async () => {
    try {
      const response = await API.graphql<Schema['newsSearch']['returnType']>({
        query: `query NewsSearch($searchString: String!) {
          newsSearch(searchString: $searchString)
        }`,
        variables: { searchString },
      });
      setResults(JSON.parse(response.data.newsSearch));
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