import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource';

import { Amplify } from "aws-amplify"
import outputs from "../amplify_outputs.json"
Amplify.configure(outputs);

const client = generateClient<Schema>();

import { styled } from '@mui/material/styles';
import { Paper } from '@mui/material';
import { TextField, Button, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, Select, MenuItem } from '@mui/material';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';

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


const SendEmail: React.FC = () => {
  const [selectedType, setSelectedType] = useState<'Steel' | 'Auto' | 'Aluminum'>('Steel');
  const [recipient, setRecipient] = useState<'everyone' | 'single'>('everyone');
  const [email, setEmail] = useState('');
  const [error, setError] = React.useState(false);
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
    console.log('handleSubmit');
    event.preventDefault();
    console.log(await client.queries.sendEmail({ name: 'MetalNews Email', type: selectedType, recipient, email: recipient === 'single' ? email : undefined, title }));
  }

  return (
    <div>      
      <form onSubmit={handleSubmit}>
        <FormControl sx={{ m: 12 }} error={error} variant="standard">
          <Grid container spacing={3}>
            <Grid size={12}>
              <FormLabel>Email Type:</FormLabel>
              <RadioGroup row value={selectedType} onChange={handleChange}>
                <FormControlLabel value="Steel" control={<Radio />} label="Steel" />
                <FormControlLabel value="Auto" control={<Radio />} label="Auto" />
                <FormControlLabel value="Aluminum" control={<Radio />} label="Aluminum" />
              </RadioGroup>
            </Grid>
            <Grid size={12}>
              <FormLabel>Recipient:</FormLabel>
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
                label="Title"
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