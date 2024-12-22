import React, { useState } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource';
import { Amplify } from "aws-amplify";
import outputs from "../amplify_outputs.json";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

Amplify.configure(outputs);

const client = generateClient<Schema>();


import { styled } from '@mui/material/styles';
import { Paper } from '@mui/material';
import { TextField, Button, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, Select, MenuItem, InputLabel } from '@mui/material';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Toolbar from '@mui/material/Toolbar';
import Checkbox from '@mui/material/Checkbox';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
  ...theme.applyStyles('dark', {
    backgroundColor: '#1A2027',
  }),
}));

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

const NewsSearch: React.FC = () => {
  const [searchString, setSearchString] = useState('');
  const [results, setResults] = useState<News[]>([]);
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [newsForm, setNewsForm] = useState<NewsForm | null>(null);
  const [selected, setSelected] = useState<number | null>(null);

  const handleSearch = async () => {
    try {
      const response = await client.queries.newsSearch({ searchString });
      setResults(response.data ? (JSON.parse(response.data) as News[]) : []);
    } catch (error) {
      console.error('Error fetching news:', error);
    }
  };

  const handleEdit = (news: News) => {
    setEditingNews(news);
    setNewsForm({
      title: news.title,
      group: news.group,
      writtenBy: news.writtenBy,
      date: news.date,
      lDate: news.lDate,
      source: news.source,
      memo: news.memo,
      ord: news.ord,
      rank: news.rank,
      header: news.header,
      published: news.published,
      newField: news.newField,
      type: news.type,
    });
  };

  const handleUpdate = async () => {
    if (editingNews && newsForm) {
      try {
        await client.models.News.update({ ...newsForm, id: editingNews.id.toString() });
        setEditingNews(null);
        setNewsForm(null);
        handleSearch(); // Refresh the search results
      } catch (error) {
        console.error('Error updating news:', error);
      }
    }
  };

  const handleNewsFormChange = (field: keyof NewsForm, value: any) => {
    if (newsForm) {
      setNewsForm({ ...newsForm, [field]: value });
    }
  };

  const handleSelect = (id: number) => {
    setSelected((prevSelected) => (prevSelected === id ? null : id));
    const news = results.find((item) => item.id === id);
    if (news) {
      handleEdit(news);
    }
  };

  return (
    <div>
      <h1>ニュースの検索</h1>
      {!editingNews && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '0 auto' }}>
          キーワード: 
          <TextField
            value={searchString}
            onChange={(e) => setSearchString(e.target.value)}
            placeholder="Enter search string"
            variant="outlined"
          />
          <Button onClick={handleSearch} variant="contained" color="primary">
            Search
          </Button>
        </div>
      )}
      {!editingNews && (
        <div style={{ paddingTop: '20px' }}>
          {results.length > 0 ? (
            <TableContainer component={Paper} style={{ width: '100%', margin: '0 auto' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        indeterminate={selected !== null && selected !== results.length}
                        checked={results.length > 0 && selected === results.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelected(results[0].id);
                          } else {
                            setSelected(null);
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell style={{ width: '70%' }}>Title</TableCell>
                    <TableCell style={{ width: '20%' }}>Date</TableCell>
                    <TableCell style={{ width: '10%' }}>Edit</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {results.map((item, index) => (
                    <TableRow key={index} selected={selected === item.id}>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selected === item.id}
                          onChange={() => handleSelect(item.id)}
                        />
                      </TableCell>
                      <TableCell>{item.title}</TableCell>
                      <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button onClick={() => handleEdit(item)}>Edit</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <p>該当するニュースはありませんでした。</p>
          )}
        </div>
      )}
      {editingNews && newsForm && (
        <div style={{ maxWidth: '80%', margin: '0 auto' }}>
          <h2>Edit News</h2>
          <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <TextField
              label="Title"
              variant="outlined"
              value={newsForm.title}
              onChange={(e) => handleNewsFormChange('title', e.target.value)}
              fullWidth
            />
            <FormControl variant="outlined" fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={newsForm.type}
                onChange={(e) => handleNewsFormChange('type', e.target.value)}
                label="Type"
              >
                <MenuItem value="Steel">Steel</MenuItem>
                <MenuItem value="Auto">Auto</MenuItem>
                <MenuItem value="Aluminum">Aluminum</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Header"
              variant="outlined"
              value={newsForm.header}
              onChange={(e) => handleNewsFormChange('header', e.target.value)}
              fullWidth
            />
            <TextField
              label="Source"
              variant="outlined"
              value={newsForm.source}
              onChange={(e) => handleNewsFormChange('source', e.target.value)}
              fullWidth
            />
            <FormControl fullWidth>
              <FormLabel>Memo</FormLabel>
              <ReactQuill
                value={newsForm.memo}
                onChange={(value) => handleNewsFormChange('memo', value)}
                style={{ maxWidth: '100%' }}
              />
            </FormControl>
            <TextField
              label="Date"
              type="date"
              variant="outlined"
              value={new Date(newsForm.date).toISOString().split('T')[0]}
              onChange={(e) => handleNewsFormChange('date', e.target.value)}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
            />
            {/* Add other fields as needed */}
            <Button type="submit" variant="contained" color="primary">
              Update
            </Button>
            <Button type="button" onClick={() => { setEditingNews(null); setNewsForm(null); }}>
              Cancel
            </Button>
          </form>
        </div>
      )}
    </div>
  );
};

export default NewsSearch;