import React, { useState, useEffect, useRef } from 'react';
import { CSSProperties } from 'react';
//import { useAuthenticator } from '@aws-amplify/ui-react';
import { generateClient } from 'aws-amplify/data';
import { Schema } from '../amplify/data/resource';
import { Editor } from '@tinymce/tinymce-react';
import { Amplify } from "aws-amplify"
import outputs from "../amplify_outputs.json"
import { TextField, Button, FormControl, FormLabel, Select, MenuItem, InputLabel, SelectChangeEvent } from '@mui/material';
import Grid from '@mui/material/Grid2';
import Box from '@mui/material/Box';
import NewsAppBar from './components/NewsAppBar';
//const logoUrl = 'https://metal-news-image.s3.us-east-1.amazonaws.com/imgMetalNewsLogoN3.gif';
import { Authenticator } from '@aws-amplify/ui-react';

Amplify.configure(outputs);
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
  type: 'Steel' | 'Auto' | 'Aluminum';// | '鉄鋼' | '自動車' | 'アルミ';
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
  type: 'Steel' | 'Auto' | 'Aluminum';// | '鉄鋼' | '自動車' | 'アルミ';
}

const App: React.FC = () => {
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };
  console.log('1) getTomorrowDate:', getTomorrowDate());
  const [newsForm, setNewsForm] = useState<NewsForm>({
    title: '',
    group: 1,
    writtenBy: '',
    date: getTomorrowDate(), // Set to tomorrow's date
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
//  const { signOut } = useAuthenticator();
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
//    function handleSelectChange(event: SelectChangeEvent<"Steel" | "Auto" | "Aluminum" | '鉄鋼' | '自動車' | 'アルミ'>) {
      const { name, value } = event.target;
    setNewsForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function submitNewsForm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const memoContent = (editorRef.current as any)?.getContent();

    // Validate required fields
    if (!newsForm.header.trim()) {
      alert('見出しを入力してください');
      return;
    }
    if (!newsForm.title.trim()) {
      alert('タイトルを入力してください');
      return;
    }
    if (!newsForm.source.trim()) {
      alert('タグ、キーワードを入力してください');
      return;
    }
    if (!memoContent.trim()) {
      alert('本文を入力してください');
      return;
    }

    const newNews: Omit<News, 'id'> = {
      ...newsForm,
      memo: memoContent,
      writtenBy: 'Anonymous',
      ord: newsItems.length + 1,
    //  type: newsForm.type as 'Steel' | 'Auto' | 'Aluminum'  | '鉄鋼' | '自動車' | 'アルミ',
      type: newsForm.type as 'Steel' | 'Auto' | 'Aluminum',
    };

    client.models.News.create(newNews)
      .then(response => {
        console.log('News created successfully:', response);
        fetchNewsItems();
        
        // Reset form only after successful creation
        setNewsForm({
          title: '',
          group: 1,
          writtenBy: '',
          date: getTomorrowDate(),
          lDate: new Date().toISOString().split('T')[0],
          source: 'User Input',
          memo: '',
          ord: 0,
          rank: 0,
          header: '',
          published: false,
          type: 'Auto',
        });
        
        // Clear the editor content
        if (editorRef.current) {
          (editorRef.current as any).setContent('');
        }
      })
      .catch(error => {
        console.error('Error creating news:', error);
        alert('ニュースの作成中にエラーが発生しました');
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
    padding: '00px',
    maxWidth: '1600px',
    margin: '130px auto 0', // Increased to account for both bars (65px + 65px)
    height: 'calc(100vh - 130px)',
    overflowY: 'auto'
  };

  const renderFormScreen = () => (
     <Authenticator>
    <>
      <main style={mainStyle}>
        <NewsAppBar />
        <Box>
          <form onSubmit={submitNewsForm} style={formStyle}>
            <Box 
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                p: 2
              }}
            >
              <Box sx={{ 
                flexGrow: 1, 
                p: 3, 
                backgroundColor: 'background.paper',
                borderRadius: 2,
                boxShadow: 1
              }}>
                <Grid container spacing={2}>
                  <Grid size={6}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel>カテゴリー</InputLabel>
                      <Select
                        id="type"
                        name="type"
                        value={newsForm.type}
                        onChange={handleSelectChange}
                        label="Category"
                      >
                        <MenuItem value="Steel" style={{ color: 'white' }}>鉄鋼</MenuItem>
                        <MenuItem value="Auto" style={{ color: 'white' }}>自動車</MenuItem>
                        <MenuItem value="Aluminum" style={{ color: 'white' }}>アルミ</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid size={6}>
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
                  </Grid>

                  <Grid size={12}>
                    <TextField
                      label="タイトル"
                      variant="outlined"
                      id="title"
                      name="title"
                      value={newsForm.title}
                      onChange={handleNewsInputChange}
                      fullWidth
                    />
                  </Grid>

                  <Grid size={12}>
                    <TextField
                      label="見出し"
                      variant="outlined"
                      id="header"
                      name="header"
                      value={newsForm.header}
                      onChange={handleNewsInputChange}
                      fullWidth
                    />
                  </Grid>

                  <Grid size={12}>
                    <TextField
                      label="タグ、キーワード"
                      variant="outlined"
                      id="source"
                      name="source"
                      value={newsForm.source}
                      onChange={handleNewsInputChange}
                      fullWidth
                    />
                  </Grid>
                </Grid>
              </Box>


              <FormControl fullWidth style={{ marginBottom: '40px' }}>
                <FormLabel>本文</FormLabel>
                <Editor
                  onInit={(_evt, editor) => editorRef.current = editor as any}
                  apiKey='nlumqbl8xd3g3re2cf0oi2p8q65cjiodifj3oux9zuz7813p'
                  initialValue=""
                  init={{
                    plugins: [
                      // Core editing features
                      'anchor', 'autolink', 'charmap', 'codesample', 'emoticons', 'image', 'link', 'lists', 'media', 'searchreplace', 'table', 'visualblocks', 'wordcount',
                      // Your account includes a free trial of TinyMCE premium features
                      // Try the most popular premium features until Mar 20, 2025:
                      'checklist', 'mediaembed', 'casechange', 'export', 'formatpainter', 'pageembed', 'a11ychecker', 'tinymcespellchecker', 'permanentpen', 'powerpaste', 'advtable', 'advcode', 'editimage', 'advtemplate', 'mentions', 'tinycomments', 'tableofcontents', 'footnotes', 'mergetags', 'autocorrect', 'typography', 'inlinecss', 'markdown','importword', 'exportword', 'exportpdf'
                    ],
                    toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat',
                    powerpaste_word_import: 'merge',
                    powerpaste_html_import: 'clean',
                    powerpaste_allow_local_images: true,
                    tinycomments_mode: 'embedded',
                    tinycomments_author: 'Kuromatsu',
                    language_url: '/path/to/langs/ja.js',
                    language: 'ja',
                    mergetags_list: [
                      { value: 'First.Name', title: 'First Name' },
                      { value: 'Email', title: 'Email' },
                    ] as { value: string; title: string }[],
                  }}
                />
              </FormControl>
      
              <Button type="submit" variant="contained" color="primary">
                Submit
              </Button>
            </Box>
          </form>
        </Box>
      </main>
    </>
      </Authenticator>
  
  );

  return renderFormScreen();
};

export default App;