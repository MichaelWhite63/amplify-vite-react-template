import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource';

import { Paper } from '@mui/material';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import { TextField, Button, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';
import { Stack } from '@mui/material';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { List, ListItem, ListItemText } from '@mui/material';
import { Authenticator } from '@aws-amplify/ui-react';

import { Amplify } from "aws-amplify"
import outputs from "../amplify_outputs.json"
Amplify.configure(outputs);

import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import IconButton from '@mui/material/IconButton';
import NewsAppBar from './components/NewsAppBar';
import Box from '@mui/material/Box';

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

const StyledTableHeadRow = styled(TableRow)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  '& > *': {
    color: theme.palette.common.white,
  },
}));

const formStyle = {
  width: '100%',
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '20px',
};

const mainStyle = {
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'center',
  width: '100%',
  minHeight: '100vh',
  backgroundColor: '#f5f5f5',
};

const SendEmail: React.FC = () => {
  const [selectedType, setSelectedType] = useState<'Steel' | 'Auto' | 'Aluminum'>('Steel');
  const [recipient, setRecipient] = useState<'everyone' | 'single'>('everyone');
  const [email, setEmail] = useState('');
  const [title, setTitle] = useState('');
  const [unpublishedNews, setUnpublishedNews] = useState<News[]>([]);
  const [selectedNewsIDs, setSelectedNewsIDs] = useState<string[]>([]); // Change type to string[]
  const [queryDate, setQueryDate] = useState(new Date().toISOString().split('T')[0]);
  const [header, setHeader] = useState('');  // Add header state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState<News[]>([]);

  useEffect(() => {
    const now = new Date();
    const month = now.getMonth() + 1; // getMonth() is zero-based
    const date = now.getDate();
    setTitle(`${month} 月 ${date} 日(土)  Metal News - `);
  }, []);

  useEffect(() => {
    async function fetchUnpublishedNews() {
      const result = await client.queries.getUnpublished({ 
        type: selectedType,
        date: queryDate
      });
      setUnpublishedNews(result.data ? (JSON.parse(result.data) as News[]) : []);
    }
    fetchUnpublishedNews();
  }, [selectedType, queryDate]); // Add queryDate as dependency

  // Add new useEffect to select all news items by default when they are loaded
  useEffect(() => {
    if (unpublishedNews.length > 0) {
      const allIds = unpublishedNews.map(news => news.id.toString());
      setSelectedNewsIDs(allIds);
    }
  }, [unpublishedNews]);

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setSelectedType(event.target.value as 'Steel' | 'Auto' | 'Aluminum');
    console.log(`Need to set selected News to []  
      when the type is changed to ${event.target.value}`);
    setSelectedNewsIDs([]); // Clear selectedNewsIDs when type is changed 
  }

  const handlePreview = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Get full news details for selected IDs
    const selectedNews = unpublishedNews.filter(news => 
      selectedNewsIDs.includes(news.id.toString())
    );
    setPreviewContent(selectedNews);
    setPreviewOpen(true);
  };

  const handleSendEmail = async () => {
    console.log('Send Email');
    console.log(`email = ${email} | type = ${selectedType} | title = ${title} | header = ${header} | selectedNewsIDs = ${selectedNewsIDs}`);
    console.log({ 
      name: 'MetalNews Email',
      email: recipient === 'single' ? email : null, 
      type: selectedType,
      title: title,
      header: header,
      selectedNewsIDs: selectedNewsIDs
    });
    console.log(await client.queries.sendEmail({ 
      name: 'MetalNews Email',
      email: recipient === 'single' ? email : null, 
      type: selectedType,
      title: title,
      header: header,
      selectedNewsIDs: selectedNewsIDs
    }));
    setPreviewOpen(false);
  };

  const handleSelectNews = (id: number) => {
    const idString = id.toString(); // Convert id to string
    setSelectedNewsIDs((prevSelected) =>
      prevSelected.includes(idString) ? prevSelected.filter((newsId) => newsId !== idString) : [...prevSelected, idString]
    );
    console.log(`Selected News IDs: ${selectedNewsIDs} | New ID: ${id}` ); // Log selectedNewsIDs
  };

  const isSelected = (id: number) => selectedNewsIDs.includes(id.toString());

  const moveRow = (currentIndex: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= unpublishedNews.length) return;

    const newUnpublishedNews = [...unpublishedNews];
    const [movedItem] = newUnpublishedNews.splice(currentIndex, 1);
    newUnpublishedNews.splice(newIndex, 0, movedItem);
    setUnpublishedNews(newUnpublishedNews);
  };

  return (
    <Authenticator>
      <NewsAppBar />
      <Box sx={mainStyle}>
        <Box sx={{ ...formStyle, mt: '50px', width: '100%' }}>
          <form onSubmit={handlePreview}>
            <FormControl sx={{ width: '100%' }} variant="standard">
              {/* Entry fields container */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center',
                width: '100%',
                marginBottom: '20px'
              }}>
                <Grid 
                  container 
                  spacing={2} 
                  sx={{
                    width: '100%',
                  }}
                >
                  <Grid size={6}>
                    <Paper sx={{ p: 2 }}>
                      <Stack spacing={2}>
                        <div>
                          <FormLabel>配信グループ</FormLabel>
                          <RadioGroup row value={recipient} onChange={(e) => setRecipient(e.target.value as 'everyone' | 'single')}>
                            <FormControlLabel value="everyone" control={<Radio />} label="全員" />
                            <FormControlLabel value="single" control={<Radio />} label="シングル" />
                          </RadioGroup>
                          {recipient === 'single' && (
                            <TextField
                              id="email"
                              label="Email Address"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              fullWidth
                              margin="normal"
                            />
                          )}
                        </div>
                        <div>
                          <FormLabel>カテゴリー</FormLabel>
                          <RadioGroup row value={selectedType} onChange={handleChange}>
                            <FormControlLabel value="Steel" control={<Radio />} label="鉄鋼" />
                            <FormControlLabel value="Auto" control={<Radio />} label="自動車" />
                            <FormControlLabel value="Aluminum" control={<Radio />} label="アルミ" />
                          </RadioGroup>
                        </div>

                        <TextField
                          id="title"
                          label="タイトル"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          fullWidth
                        />

                        <TextField
                          label="発行日"
                          type="date"
                          value={queryDate}
                          onChange={(e) => setQueryDate(e.target.value)}
                          fullWidth
                          InputLabelProps={{
                            shrink: true,
                          }}
                        />
                      </Stack>
                    </Paper>
                  </Grid>
                  <Grid size={6}>
                    <Paper sx={{ p: 2, height: '100%' }}>
                      <TextField
                        id="header"
                        label="ヘッダー"
                        value={header}
                        onChange={(e) => setHeader(e.target.value)}
                        multiline
                        rows={10}
                        fullWidth
                      />
                    </Paper>
                  </Grid>
                </Grid>
              </div>

              {/* Table container */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                width: '100%'
              }}>
                <TableContainer component={Paper} sx={{ width: '100%' }}>
                  <Table>
                    <TableHead>
                      <StyledTableHeadRow>
                        <TableCell padding="checkbox">
                          <Checkbox
                            indeterminate={selectedNewsIDs.length > 0 && selectedNewsIDs.length < unpublishedNews.length}
                            checked={unpublishedNews.length > 0 && selectedNewsIDs.length === unpublishedNews.length}
                            onChange={(e) => setSelectedNewsIDs(e.target.checked ? unpublishedNews.map((news) => news.id.toString()) : [])}
                          />
                        </TableCell> 
                        <TableCell style={{ width: '77%', color: 'white' }}>カテゴリー {selectedType}</TableCell>
                        <TableCell style={{ width: '20%', color: 'white' }}>ニュースの日付</TableCell>
                        <TableCell style={{ width: '5%', color: 'white' }}>移動</TableCell>
                      </StyledTableHeadRow>
                    </TableHead> 
                    <TableBody>
                      {unpublishedNews.map((news, index) => (
                        <TableRow
                          key={news.id}
                          hover
                          onClick={() => handleSelectNews(news.id)}
                          role="checkbox"
                          aria-checked={isSelected(news.id)}
                          selected={isSelected(news.id)}
                        >
                          <TableCell padding="checkbox">
                            <Checkbox checked={isSelected(news.id)} />
                          </TableCell>
                          <TableCell style={{ width: '65%' }}>{news.title}</TableCell>
                          <TableCell style={{ width: '15%' }}>{news.date}</TableCell>
                          <TableCell style={{ width: '10%' }}>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                moveRow(index, 'up');
                              }}
                              disabled={index === 0}
                            >
                              <ArrowUpwardIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                moveRow(index, 'down');
                              }}
                              disabled={index === unpublishedNews.length - 1}
                            >
                              <ArrowDownwardIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'center',  // Changed to center
                width: '90%',
                margin: '0 auto',
                marginTop: '20px'
              }}>
                <Button 
                  type="submit" 
                  variant="contained"       // Changed from outlined
                  sx={{
                    backgroundColor: '#1a237e', // Dark blue background
                    color: 'white',            // White text
                    '&:hover': {
                      backgroundColor: '#0d47a1' // Slightly different blue on hover
                    }
                  }}
                >
                  プレビュー
                </Button>
              </div>
            </FormControl>
          </form>

          <Dialog
            open={previewOpen}
            onClose={() => setPreviewOpen(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle sx={{ textAlign: 'center' }}>メールのプレビュー</DialogTitle>
            <DialogContent>
              <div style={{ marginBottom: 20 }}>
                <Typography paragraph>{header}</Typography>
              </div>

              {/* Add title list */}
              <Paper sx={{ p: 2, mb: 3, backgroundColor: '#f5f5f5' }}>
                <Typography variant="h6" gutterBottom>Headlines:</Typography>
                <List>
                  {previewContent.map((news) => (
                    <ListItem key={`title-${news.id}`}>
                      <ListItemText primary={`${news.title}`} />
                    </ListItem>
                  ))}
                </List>
              </Paper>

              {/* Full content */}
              <Typography variant="h6" gutterBottom>Full Content:</Typography>
              {previewContent.map((news) => (
                <Paper key={news.id} sx={{ p: 2, mb: 2 }}>
                  <Typography variant="h6">
                    {news.title}
                  </Typography>
                  <Typography 
                    dangerouslySetInnerHTML={{ __html: news.memo }}
                    sx={{ mt: 1 }}
                  />
                </Paper>
              ))}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setPreviewOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSendEmail} variant="contained" color="primary">
                Send Email
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Box>
    </Authenticator>
  );
};

export default SendEmail;