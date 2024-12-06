import React, { useState, useEffect } from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource';
import { CSSProperties } from 'react';
import Charts from './Charts';

import { Amplify } from "aws-amplify"
import outputs from "../amplify_outputs.json"

Amplify.configure(outputs);

const client = generateClient<Schema>();

console.log(   await
  client.queries.sayHello({name: 'World', type: 'Steel', nonEnum: 'Auto'})
  );

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

interface NewsForm {
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

interface AppProps {
  currentScreen: string;
}

const App: React.FC<AppProps> = ({ currentScreen }) => {
  const [newsForm, setNewsForm] = useState<NewsForm>({
    title: '',
    group: 1,
    writtenBy: '',
    date: new Date().toISOString().split('T')[0], // Default to today's date
    lDate: new Date().toISOString().split('T')[0],
    source: 'User Input',
    memo: '',
    ord: 0,
    rank: 0,
    header: '',
    published: false,
    newField: false,
    type: 'Steel',
  });

  const [newsItems, setNewsItems] = useState<News[]>([]);
  const { signOut } = useAuthenticator();
  const [formWidth, setFormWidth] = useState('80%');

  useEffect(() => {
    fetchNewsItems();
    updateFormWidth();
    window.addEventListener('resize', updateFormWidth);
    return () => window.removeEventListener('resize', updateFormWidth);
  }, []);

  const updateFormWidth = () => {
    setFormWidth(`${window.innerWidth * 0.8}px`);
  };

  async function handleNewsInputChange(event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void {
    const { name, value, type } = event.target;
    const checked = (event.target as HTMLInputElement).checked;
    console.log('Field name: ', name, 'Field value: ', value, 'type: ', type, 'checked: ', checked);
    console.log(    await
      client.queries.sayHello({name: value, type: value as 'Steel' | 'Auto' | 'Aluminum', nonEnum: value})
      );
    setNewsForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  function submitNewsForm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const newNews: Omit<News, 'id'> = {
      ...newsForm,
      writtenBy: 'Anonymous', // Replace with actual user info if available
      ord: newsItems.length + 1,
      type: newsForm.type as 'Steel' | 'Auto' | 'Aluminum',
    };

    client.models.News.create(newNews) // Adjust the type as per your client library
      .then(response => {
        console.log('News created successfully:', response);
        fetchNewsItems(); // Refresh the news items list
      })
      .catch(error => {
        console.error('Error creating news:', error);
      });

    setNewsForm({
      title: '',
      group: 1,
      writtenBy: '',
      date: new Date().toISOString().split('T')[0],
      lDate: new Date().toISOString().split('T')[0],
      source: 'User Input',
      memo: '',
      ord: 0,
      rank: 0,
      header: '',
      published: false,
      newField: false,
      type: 'Auto',
    });
  }

  function fetchNewsItems() {
    client.models.News.list()
      .then(response => {
        const newsItems = response.data.map((item: any) => ({
          ...item,
          id: Number(item.id), // Cast id to number
        }));
        setNewsItems(newsItems);
      })
      .catch(error => {
        console.error('Error fetching news items:', error);
      });
  }

  const formStyle: CSSProperties = {
    marginBottom: '20px',
    padding: '20px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    backgroundColor: '#f9f9f9',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    width: formWidth,
    margin: '0 auto',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  };
  
  const mainStyle: CSSProperties = {
    padding: '20px',
    maxWidth: '1600px',
    margin: '0 auto',
    height: '100vh',
    overflowY: 'auto'
  };
  const inputStyle = {
    display: 'block',
    width: '100%',
    padding: '10px',
    margin: '10px 0',
    borderRadius: '4px',
    border: '1px solid #ccc',
  };

  const buttonStyle = {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    alignSelf: 'flex-start',
  };

  const newsItemStyle = {
    borderBottom: '1px solid #ccc',
    padding: '10px 0',
  };

  const newsItemHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'Charts':
        return <Charts />;
      case 'form':
      default:
        return (
          <main style={mainStyle}>
            <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Metal News - News Entry</h1>
            <form onSubmit={submitNewsForm} style={formStyle}>
              <div>
                <label htmlFor="type">Category:</label>
                <select id="type" name="type" value={newsForm.type} onChange={handleNewsInputChange} style={inputStyle}>
                  <option value="Steel">Steel</option>
                  <option value="Auto">Auto</option>
                  <option value="Aluminum">Aluminum</option>
                </select>
              </div>
              <div>
                <label htmlFor="title">Title:</label>
                <input type="text" id="title" name="title" value={newsForm.title} onChange={handleNewsInputChange} style={inputStyle} />
              </div>
              <div>
                <label htmlFor="source">Source:</label>
                <input type="text" id="source" name="source" value={newsForm.source} onChange={handleNewsInputChange} style={inputStyle} />
              </div>
              <div>
                <label htmlFor="date">Date:</label>
                <input type="date" id="date" name="date" value={newsForm.date} onChange={handleNewsInputChange} style={inputStyle} />
              </div>
              <div>
                <label htmlFor="memo">Body:</label>
                <textarea id="memo" name="memo" value={newsForm.memo} onChange={handleNewsInputChange} style={inputStyle}></textarea>
              </div>
              <div>
                <label htmlFor="header">Header:</label>
                <input type="text" id="header" name="header" value={newsForm.header} onChange={handleNewsInputChange} style={inputStyle} />
              </div>
              <div>
                <label htmlFor="published">Published:</label>
                <input type="checkbox" id="published" name="published" checked={newsForm.published} onChange={handleNewsInputChange} />
              </div>
              <button type="submit" style={buttonStyle}>Submit</button>
            </form>

            <section>
              <h2>News Items</h2>
              <ul style={{ listStyleType: 'none', padding: 0 }}>
                {newsItems.map((news) => (
                  <li key={news.id} style={newsItemStyle}>
                    <div style={newsItemHeaderStyle}>
                      <div>
                        <h3>{news.title}</h3>
                        <p><strong>Group:</strong> {news.group}</p>
                        <p><strong>Written by:</strong> {news.writtenBy}</p>
                        <p><strong>Type:</strong> {news.type}</p>
                      </div>
                      <div>
                        <p><strong>Date:</strong> {new Date(news.date).toLocaleDateString()}</p>
                        <p><strong>Last Date:</strong> {new Date(news.lDate).toLocaleDateString()}</p>
                        <p><strong>Source:</strong> {news.source}</p>
                      </div>
                    </div>
                    <p><strong>Memo:</strong> {news.memo}</p>
                    <p><strong>Header:</strong> {news.header}</p>
                    <p><strong>Published:</strong> {news.published ? 'Yes' : 'No'}</p>
                    <p><strong>New Field:</strong> {news.newField ? 'Yes' : 'No'}</p>
                  </li>
                ))}
              </ul>
            </section>

            <button onClick={signOut} style={buttonStyle}>Sign out</button>
          </main>
        );
    }
  };

  return renderScreen();
};

export default App;