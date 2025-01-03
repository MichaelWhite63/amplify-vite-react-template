import React, { useState, useEffect, useRef } from 'react';
import { CSSProperties } from 'react';

import { useAuthenticator } from '@aws-amplify/ui-react';
import { generateClient } from 'aws-amplify/data';
import { Schema } from '../amplify/data/resource';

//import ReactQuill from 'react-quill';
//import 'react-quill/dist/quill.snow.css';

import { Editor } from '@tinymce/tinymce-react';

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

/* Top of React Quill component

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
*/

const App: React.FC = () => {
//  const quillRef = useRef<ReactQuill | null>(null);
  
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

  const [newsItems, setNewsItems] = useState<News[]>([]);
  const { signOut } = useAuthenticator();
  const [formWidth, setFormWidth] = useState('80%');
  const editorRef   = useRef<Editor | null>(null);

  useEffect(() => {
    fetchNewsItems();
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
/*
  function handleMemoChange(value: string) {
    setNewsForm((prev) => ({
      ...prev,
      memo: value,
    }));
  }
*/
  function submitNewsForm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    //This is how you can get the content of the editor
    console.log((editorRef.current as any).getContent());

    const newNews: Omit<News, 'id'> = {
      ...newsForm,
      memo: (editorRef.current as any).getContent(),
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
/*
  const newsItemStyle = {
    borderBottom: '1px solid #ccc',
    padding: '10px 0',
  };

  const newsItemHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
  };
*/
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
          label="見出し"
          variant="outlined"
          id="header"
          name="header"
          value={newsForm.header}
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
          <Editor
          onInit={(_evt, editor) => editorRef.current = editor as any}
          apiKey='thy152883h9u8suplywk8owqmkt3xxday4soiygj58l8actt'
          initialValue=""
          init={{
                plugins: [
                  // Core editing features
                  'anchor', 'autolink', 'charmap', 'codesample', 'emoticons', 'image', 'link', 'lists', 'media', 'searchreplace', 'table', 'visualblocks', 'wordcount',
                  // Your account includes a free trial of TinyMCE premium features
                  // Try the most popular premium features until Jan 14, 2025:
                    'checklist', 'mediaembed', 'casechange', 'export', 'formatpainter', 'pageembed', 'a11ychecker', 'tinymcespellchecker', 'permanentpen', 'powerpaste', 'advtable', 'advcode', 'editimage', 'advtemplate', 'ai', 'mentions', 'tinycomments', 'tableofcontents', 'footnotes', 'mergetags', 'autocorrect', 'typography', 'inlinecss', 'markdown','importword', 'exportword', 'exportpdf'
                  ],
                  toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat',
                  tinycomments_mode: 'embedded',
                  tinycomments_author: 'Author name',
                  mergetags_list: [
                    { value: 'First.Name', title: 'First Name' },
                    { value: 'Email', title: 'Email' },
                  ] as { value: string; title: string }[],
              //    ai_request: (request: any, respondWith: any) => respondWith.string(() => Promise.reject('See docs to implement AI Assistant')),
                  }}
        />
        </FormControl>
  
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
/*Lower section that displayed the news

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
              <p><strong>Memo:</strong> <div dangerouslySetInnerHTML={{ __html: news.memo }} /></p>
              <p><strong>Header:</strong> {news.header}</p>
              <p><strong>Published:</strong> {news.published ? 'Yes' : 'No'}</p>
            </li>
          ))}
        </ul>
      </section>
*/