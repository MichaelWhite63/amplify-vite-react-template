import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource';

import { Amplify } from "aws-amplify"
import outputs from "../amplify_outputs.json"
Amplify.configure(outputs);

const client = generateClient<Schema>();

import { TextField, Button, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import Grid from '@mui/material/Grid2';

const SendEmail: React.FC = () => {
  const [selectedType, setSelectedType] = useState<'Steel' | 'Auto' | 'Aluminum'>('Steel');
  const [recipient, setRecipient] = useState<'everyone' | 'single'>('everyone');
  const [email, setEmail] = useState('');
  const [title, setTitle] = useState('');

  useEffect(() => {
    const now = new Date();
    const month = now.getMonth() + 1; // getMonth() is zero-based
    const date = now.getDate();
    setTitle(`${month} 月 ${date} 日(土)  Metal News - `);
  }, []);

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setSelectedType(event.target.value as 'Steel' | 'Auto' | 'Aluminum');
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    console.log(await client.queries.sendEmail({ name: 'MetalNews Email', type: selectedType, email: recipient === 'single' ? email : undefined, title: title }));
  }

  return (
    <div>      
      <form onSubmit={handleSubmit}>
        <FormControl sx={{ m: 12 }} variant="standard">
        <Grid container spacing={2}>
            <Grid size={12}>
              <FormLabel>カテゴリー</FormLabel>
              <RadioGroup row value={selectedType} onChange={handleChange}>
                <FormControlLabel value="Steel" control={<Radio />} label="Steel" />
                <FormControlLabel value="Auto" control={<Radio />} label="Auto" />
                <FormControlLabel value="Aluminum" control={<Radio />} label="Aluminum" />
              </RadioGroup>
            </Grid>
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
          <Button sx={{ mt: 1, mr: 1 }} type="submit" variant="outlined">
            Submit
          </Button>
        </FormControl>
      </form>
      <p>Selected Type: {selectedType}</p>
      <p>Recipient: {recipient}</p>
    </div>
  );
};

export default SendEmail;