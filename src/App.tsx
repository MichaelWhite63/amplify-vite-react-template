import React, { useState, useEffect } from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { generateClient } from 'aws-amplify/data';
import { Schema } from '../amplify/data/resource';
import { CSSProperties } from 'react';

import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

import { Amplify } from "aws-amplify"
import outputs from "../amplify_outputs.json"
Amplify.configure(outputs);

const client = generateClient<Schema>();

import { TextField, Button, FormControl, FormLabel, Select, MenuItem, InputLabel, SelectChangeEvent } from '@mui/material';

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
  type: 'Steel' | 'Auto' | 'Aluminum';
}
// Top of React Quill component

const modules = {
  toolbar: [
    [{ 'header': [1, 2, false] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
    ['link', 'image'],
    ['clean']
  ],
};

const formats = [
  'header',
  'bold', 'italic', 'underline', 'strike', 'blockquote',
  'list', 'bullet', 'indent',
  'link', 'image'
];
// Bottom of React Quill component


const App: React.FC = () => {
  const [newsForm, setNewsForm] = useState<NewsForm>({
    title: '',
    group: 1,
    writtenBy: '',
    date: new Date().toISOString().split('T')[0], // Default to today's date
    lDate: new Date().toISOString().split('T')[0],
    source: '',
    memo: '',
    ord: 0,
    rank: 0,
    header: '',
    published: false,
    type: 'Steel',
  });

  const { signOut } = useAuthenticator();
  const [formWidth, setFormWidth] = useState('80%');

  useEffect(() => {
    updateFormWidth();
    window.addEventListener('resize', updateFormWidth);
    return () => window.removeEventListener('resize', updateFormWidth);
  }, []);

  const updateFormWidth = () => {
    setFormWidth(`${window.innerWidth * 0.8}px`);
  };

  function handleNewsInputChange(event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void {
    const { name, value, type } = event.target;
    const checked = (event.target as HTMLInputElement).checked;

    setNewsForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  function handleSelectChange(event: SelectChangeEvent<"Steel" | "Auto" | "Aluminum">) {
    const { name, value } = event.target;
    setNewsForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleMemoChange(value: string) {
    setNewsForm((prev) => ({
      ...prev,
      memo: value,
    }));
  }

  function submitNewsForm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const newNews: Omit<News, 'id'> = {
      ...newsForm,
      writtenBy: 'Anonymous', // Replace with actual user info if available
      ord: 0, // Remove the ord calculation
      type: newsForm.type as 'Steel' | 'Auto' | 'Aluminum',
    };

    client.models.News.create(newNews) // Adjust the type as per your client library
      .then(response => {
        console.log('News created successfully:', response);
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
      type: 'Auto',
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

  const renderFormScreen = () => (
    <main style={mainStyle}>
      <form onSubmit={submitNewsForm} style={formStyle}>
        <FormControl fullWidth variant="outlined">
          <InputLabel>カテゴリー</InputLabel>
          <Select
            id="type"
            name="type"
            value={newsForm.type}
            onChange={handleSelectChange}
            label="Category"
          >
            <MenuItem value="Steel" style={{ color: 'white' }}>Steel</MenuItem>
            <MenuItem value="Auto" style={{ color: 'white' }}>Auto</MenuItem>
            <MenuItem value="Aluminum" style={{ color: 'white' }}>Aluminum</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="タイトル"
          variant="outlined"
          id="title"
          name="title"
          value={newsForm.title}
          onChange={handleNewsInputChange}
          fullWidth
        />
        <TextField
          label="タグ、キーワード"
          variant="outlined"
          id="source"
          name="source"
          value={newsForm.source}
          onChange={handleNewsInputChange}
          fullWidth
        />
        <TextField
          label="発行日"
          type="date"
          variant="outlined"
          id="date"
          name="date"
          value={newsForm.date}
          onChange={handleNewsInputChange}
          fullWidth
          InputLabelProps={{
            shrink: true,
          }}
        />
        <FormControl fullWidth style={{ marginBottom: '40px' }}>
          <FormLabel>本文</FormLabel>
          <ReactQuill 
              value={newsForm.memo} 
              formats={formats}
              modules={modules}
              onChange={handleMemoChange} />
        </FormControl>
        
        <TextField
          label="見出し"
          variant="outlined"
          id="header"
          name="header"
          value={newsForm.header}
          onChange={handleNewsInputChange}
          fullWidth
        />
        <Button type="submit" variant="contained" color="primary">
          Submit
        </Button>
      </form>

      <Button onClick={signOut} variant="contained" color="primary">
        Sign out
      </Button>
    </main>
  );

  return renderFormScreen();
};

export default App;