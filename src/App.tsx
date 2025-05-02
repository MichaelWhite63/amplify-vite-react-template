import React, { useState, useEffect, useRef } from 'react';
import { CSSProperties } from 'react';
//import { useAuthenticator } from '@aws-amplify/ui-react';
import { generateClient } from 'aws-amplify/data';
import { Schema } from '../amplify/data/resource';
import { Editor } from '@tinymce/tinymce-react';
import { Amplify } from "aws-amplify"
import outputs from "../amplify_outputs.json"
import { TextField, Button, FormControl, FormLabel, Select, MenuItem, InputLabel, SelectChangeEvent, List, ListItem, ListItemText, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import NewsAppBar from './components/NewsAppBar';

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
  type: 'Steel' | 'Auto' | 'Aluminum';// | '鉄鋼' | '自動車' | 'アルミ';
}

interface FileWithContent {
  file: File;
  content?: string;
}

const App: React.FC = () => {
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

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
  const [uploadedFiles, setUploadedFiles] = useState<FileWithContent[]>([]);

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

  const readFileContent = async (file: File): Promise<string> => {
    if (!file.type.includes('text/') && !file.name.endsWith('.txt')) {
      return '非テキストファイルの内容は表示できません';
    }
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      const filesWithContent = await Promise.all(
        files.map(async (file) => ({
          file,
          content: await readFileContent(file)
        }))
      );
      setUploadedFiles(filesWithContent);
    }
  };

  const handleFileDelete = (index: number) => {
    setUploadedFiles(files => files.filter((_, i) => i !== index));
  };

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
    marginTop: '30px',
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
    fontSize: '1.2rem', // Increased base font size
    fontWeight: 'bold', // Add bold font weight
  };
  
  const mainStyle: CSSProperties = {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
    height: '120vh',
    overflowY: 'auto',
    fontSize: '1.2rem', // Increased base font size
    fontWeight: 'bold', // Add bold font weight
    backgroundColor: '#ffffff', // Add explicit white background
  };

  const renderFormScreen = () => (
    <main style={{
      ...mainStyle,
      backgroundColor: '#ffffff', // Add explicit white background to main container
    }}>
      <NewsAppBar />
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
            boxShadow: 1,
            '& .MuiInputLabel-root': {
              fontSize: '1.2rem', // Increase label font size
              fontWeight: 'bold', // Add bold font weight
            },
            '& .MuiInputBase-input': {
              fontSize: '1.2rem', // Increase input font size
              fontWeight: 'bold', // Add bold font weight
            },
            '& .MuiMenuItem-root': {
              fontSize: '1.2rem', // Increase dropdown menu font size
              fontWeight: 'bold', // Add bold font weight
            },
            '& .MuiFormLabel-root': {
              fontSize: '1.2rem', // Increase form label font size
              fontWeight: 'bold', // Add bold font weight
            }
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
                     // 'checklist', 'mediaembed', 'casechange', 'export', 'formatpainter', 'pageembed', 'a11ychecker', 'tinymcespellchecker', 'permanentpen', 'powerpaste', 'advtable', 'advcode', 'editimage', 'advtemplate', 'ai', 'mentions', 'tinycomments', 'tableofcontents', 'footnotes', 'mergetags', 'autocorrect', 'typography', 'inlinecss', 'markdown','importword', 'exportword', 'exportpdf'
                    ],
                    toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat',
                    tinycomments_mode: 'embedded',
                    tinycomments_author: 'Kuromatsu',
                    language: 'ja',
                    mergetags_list: [
                      { value: 'First.Name', title: 'First Name' },
                      { value: 'Email', title: 'Email' },
                    ] as { value: string; title: string }[],
                    }}
            />
          </FormControl>
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
          </Box>
          <Button type="submit" variant="contained" color="primary">
            Submit
          </Button>
        </Box>
      </form>

    </main>
  );

  return renderFormScreen();
};

export default App;