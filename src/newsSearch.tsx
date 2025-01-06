import React, { useState, useRef } from 'react';

import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource';
import { Amplify } from "aws-amplify";
import outputs from "../amplify_outputs.json";

import { Editor } from '@tinymce/tinymce-react';

Amplify.configure(outputs);

const client = generateClient<Schema>();

import { Paper, TextField, Button, FormControl, FormLabel, Select, MenuItem, InputLabel, Box } from '@mui/material';
import Grid from '@mui/material/Grid2';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

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
  //const [selected, setSelected] = useState<number | null>(null);
  const editorRef   = useRef<Editor | null>(null);
    
  const handleSearch = async () => {
    console.log('Searching for:', searchString);
    try {
      const response = await client.queries.newsSearch({ searchString });
      console.log('Search response:', response);
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
        await client.models.News.update({ ...newsForm, id: editingNews.id.toString(), memo: (editorRef.current as any).getContent(), });
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
/*
  const handleSelect = (id: number) => {
    setSelected((prevSelected) => (prevSelected === id ? null : id));
    const news = results.find((item) => item.id === id);
    if (news) {
      handleEdit(news);
    }
  };
*/
  return (
    <div>
      {!editingNews && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '0 auto', paddingTop: '20px'  }}>
          キーワード 検索
          <TextField
            value={searchString}
            onChange={(e) => setSearchString(e.target.value)}
            placeholder="Enter search string"
            variant="outlined"
          />
          <Button onClick={handleSearch} variant="contained" color="primary">
          検索
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
                    <TableCell style={{ width: '70%' }}>タイトル</TableCell>
                    <TableCell style={{ width: '20%' }}>Date</TableCell>
                    <TableCell style={{ width: '10%' }}>Edit</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {results.map((item, index) => (
                    <TableRow key={index} >
                      <TableCell>{item.title}</TableCell>
                      <TableCell>{new Date(item.date).toISOString().split('T')[0]}</TableCell>
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
          <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
            <Box sx={{ flexGrow: 1, p: 2, backgroundColor: 'background.paper', borderRadius: 1 }}>
              <Grid container spacing={2}>
                <Grid size={6}>
                  <FormControl variant="outlined" fullWidth>
                    <InputLabel>カテゴリー</InputLabel>
                    <Select
                      value={newsForm.type}
                      onChange={(e) => handleNewsFormChange('type', e.target.value)}
                      label="Type"
                    >
                      <MenuItem value="Steel" style={{ color: 'white' }}>Steel</MenuItem>
                      <MenuItem value="Auto" style={{ color: 'white' }}>Auto</MenuItem>
                      <MenuItem value="Aluminum" style={{ color: 'white' }}>Aluminum</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={6}>
                  <TextField
                    label="発行日"
                    type="date"
                    variant="outlined"
                    value={new Date(newsForm.date).toISOString().split('T')[0]}
                    onChange={(e) => handleNewsFormChange('date', e.target.value)}
                    fullWidth
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>
                <Grid size={12}>
                  <TextField
                    label="タイトル"
                    variant="outlined"
                    value={newsForm.title}
                    onChange={(e) => handleNewsFormChange('title', e.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid size={12}>
                  <TextField
                    label="見出し"
                    variant="outlined"
                    value={newsForm.header}
                    onChange={(e) => handleNewsFormChange('header', e.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid size={12}>
                  <TextField
                    label="タグ、キーワード"
                    variant="outlined"
                    value={newsForm.source}
                    onChange={(e) => handleNewsFormChange('source', e.target.value)}
                    fullWidth
                  />
                </Grid>
              </Grid>
            </Box>
            <FormControl fullWidth>
              <FormLabel>本文</FormLabel>
              <Editor
                onInit={(_evt, editor) => editorRef.current = editor as any}
                apiKey='thy152883h9u8suplywk8owqmkt3xxday4soiygj58l8actt'
                initialValue={newsForm.memo}
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
                ai_request: (request: any, respondWith: any) => respondWith.string(() => Promise.reject(`See docs to implement AI Assistant ${request}`)),
                }}
              />
            </FormControl>

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