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
import { TextField, Button, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { styled } from '@mui/material/styles';

import { Amplify } from "aws-amplify"
import outputs from "../amplify_outputs.json"
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

const StyledTableHeadRow = styled(TableRow)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  '& > *': {
    color: theme.palette.common.white,
  },
}));

const SendEmail: React.FC = () => {
  const [selectedType, setSelectedType] = useState<'Steel' | 'Auto' | 'Aluminum'>('Steel');
  const [recipient, setRecipient] = useState<'everyone' | 'single'>('everyone');
  const [email, setEmail] = useState('');
  const [title, setTitle] = useState('');
  const [unpublishedNews, setUnpublishedNews] = useState<News[]>([]);
  const [selectedNews, setSelectedNews] = useState<string[]>([]); // Change type to string[]

  useEffect(() => {
    const now = new Date();
    const month = now.getMonth() + 1; // getMonth() is zero-based
    const date = now.getDate();
    setTitle(`${month} 月 ${date} 日(土)  Metal News - `);
  }, []);

  useEffect(() => {
    async function fetchUnpublishedNews() {
      const result = await client.queries.getUnpublished({ type: selectedType });
      setUnpublishedNews(result.data ? (JSON.parse(result.data) as News[]) : []);
    }
    fetchUnpublishedNews();
  }, [selectedType]);

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setSelectedType(event.target.value as 'Steel' | 'Auto' | 'Aluminum');
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const selectedIds = selectedNews.map(String); // Ensure selectedNews is an array of strings
    console.log('Selected IDs:', selectedIds);
    
    console.log(await client.queries.sendEmail({ 
      name: 'MetalNews Email', 
      type: selectedType, 
      email: recipient === 'single' ? email : undefined, 
      selectedNewsIDs: selectedIds // Add selectedNewsIDs to the sendEmail call
    }));
    
  }

  const handleSelectNews = (id: number) => {
    const idString = id.toString(); // Convert id to string
    setSelectedNews((prevSelected) =>
      prevSelected.includes(idString) ? prevSelected.filter((newsId) => newsId !== idString) : [...prevSelected, idString]
    );
  };

  const isSelected = (id: number) => selectedNews.includes(id.toString());

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <FormControl sx={{ m: 2 }} variant="standard">
        {/* Reduced margin value from 12 to 3 */}
        <Grid container spacing={2}>
            <Grid size={12}>
              <FormLabel>配信グループ</FormLabel>
              <RadioGroup row value={recipient} onChange={(e) => setRecipient(e.target.value as 'everyone' | 'single')}>
                <FormControlLabel value="everyone" control={<Radio />} label="Everyone" />
                 <FormControlLabel value="single" control={<Radio />} label="Single" />
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
            </Grid>
            <Grid size={12}>
              <TextField
                id="title"
                label="タイトル"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                fullWidth
              />
            </Grid>
          </Grid>
          <Grid size={12}>
              <FormLabel>カテゴリー</FormLabel>
              <RadioGroup row value={selectedType} onChange={handleChange}>
                <FormControlLabel value="Steel" control={<Radio />} label="Steel" />
                <FormControlLabel value="Auto" control={<Radio />} label="Auto" />
                <FormControlLabel value="Aluminum" control={<Radio />} label="Aluminum" />
              </RadioGroup>
            </Grid>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <StyledTableHeadRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selectedNews.length > 0 && selectedNews.length < unpublishedNews.length}
                    checked={unpublishedNews.length > 0 && selectedNews.length === unpublishedNews.length}
                    onChange={(e) => setSelectedNews(e.target.checked ? unpublishedNews.map((news) => news.id.toString()) : [])}
                  />
                </TableCell>
                <TableCell style={{ width: '85%' }}>Unpublished News</TableCell>
                <TableCell style={{ width: '15%' }}>Date</TableCell>
              </StyledTableHeadRow>
            </TableHead>
            <TableBody>
              {unpublishedNews.map((news) => (
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
                  <TableCell style={{ width: '85%' }}>{news.title}</TableCell>
                  <TableCell style={{ width: '15%' }}>{news.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Button sx={{ mt: 1, mr: 1 }} type="submit" variant="outlined">
              Submit
        </Button>
      </FormControl>
      </form>
    </div>
  );
};

export default SendEmail;