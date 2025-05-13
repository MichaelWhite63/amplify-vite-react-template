import React, { useEffect, useState } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';

const textStyle = {
  fontWeight: 'bold',
  fontSize: '1.2rem'
};

const client = generateClient<Schema>();

interface Chart1 {
  id: string;
  Order: number;
  Title: string;
  ThisWeek: number;
  LastWeek: number;
  LastYear: number;
}

const Chart1Component: React.FC = () => {
  const [chart1Data, setChart1Data] = useState<Chart1[]>([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editRowData, setEditRowData] = useState<Chart1 | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response1 = await client.models.Chart1.list();
        const sortedData1 = response1.data
          .map(item => ({
            id: item.id ?? '',
            Order: item.Order ?? 0,
            Title: item.Title ?? '',
            ThisWeek: item.ThisWeek ?? 0,
            LastWeek: item.LastWeek ?? 0,
            LastYear: item.LastYear ?? 0,
          }))
          .sort((a, b) => a.Order - b.Order);

        setChart1Data(sortedData1);
      } catch (error) {
        console.error('Error fetching chart data:', error);
      }
    };

    fetchData();
  }, []);

  const formatNumber = (num: number) => {
    return num.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  };

  const handleEditClick = (row: Chart1) => {
    setEditRowData(row);
    setEditDialogOpen(true);
  };

  const handleDialogClose = () => {
    setEditDialogOpen(false);
    setEditRowData(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editRowData) {
      setEditRowData({ ...editRowData, [e.target.name]: e.target.value });
    }
  };

  const handleSave = async () => {
    if (editRowData) {
      try {
        await client.models.Chart1.update(editRowData);
        setChart1Data(prevData =>
          prevData.map(item => (item.Order === editRowData.Order ? editRowData : item))
        );
        handleDialogClose();
      } catch (error) {
        console.error('Error saving chart data:', error);
      }
    }
  };

  return (
    <Box width="100%" mx="auto" mt={4}>
      <Paper elevation={3} style={{ padding: '20px', width: '100%' }}>
        <Typography 
          variant="h4" 
          gutterBottom 
          sx={{ 
            fontWeight: 'bold',
            backgroundColor: '#191970', // Dark blue to match header in Default.tsx
            color: 'white',
            padding: '8px',
            borderRadius: '4px',
            marginBottom: '16px',
            textAlign: 'center'
          }}
        >
          米国鉄鋼景気指標
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={textStyle} style={{ width: '15%' }}>Order</TableCell>
                <TableCell sx={textStyle} style={{ width: '80%' }}>タイトル</TableCell>
                <TableCell sx={textStyle} style={{ width: '15%', textAlign: 'right' }}>今週</TableCell>
                <TableCell sx={textStyle} style={{ width: '15%', textAlign: 'right' }}>前週</TableCell>
                <TableCell sx={textStyle} style={{ width: '15%', textAlign: 'right' }}>前年同週</TableCell>
                <TableCell sx={textStyle} style={{ width: '25%' }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {chart1Data.map((item, index) => (
                <TableRow key={index}>
                  <TableCell sx={textStyle}>{item.Order}</TableCell>
                  <TableCell sx={textStyle}>{item.Title}</TableCell>
                  <TableCell sx={textStyle} align="right">{formatNumber(item.ThisWeek)}</TableCell>
                  <TableCell sx={textStyle} align="right">{formatNumber(item.LastWeek)}</TableCell>
                  <TableCell sx={textStyle} align="right">{formatNumber(item.LastYear)}</TableCell>
                  <TableCell>
                    <Button variant="contained" color="primary" sx={{ fontWeight: 'bold' }} onClick={() => handleEditClick(item)}>
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={editDialogOpen} onClose={handleDialogClose}>
        <DialogTitle sx={textStyle}>Edit Row</DialogTitle>
        <DialogContent>
          {editRowData && (
            <>
              <TextField
                sx={{
                  '& .MuiInputLabel-root': { fontWeight: 'bold' },
                  '& .MuiInputBase-input': { fontWeight: 'bold' }
                }}
                margin="dense"
                label="Order"
                name="Order"
                value={editRowData.Order}
                onChange={handleInputChange}
                fullWidth
              />
              <TextField
                sx={{
                  '& .MuiInputLabel-root': { fontWeight: 'bold' },
                  '& .MuiInputBase-input': { fontWeight: 'bold' }
                }}
                margin="dense"
                label="Title"
                name="Title"
                value={editRowData.Title}
                onChange={handleInputChange}
                fullWidth
              />
              <TextField
                sx={{
                  '& .MuiInputLabel-root': { fontWeight: 'bold' },
                  '& .MuiInputBase-input': { fontWeight: 'bold' }
                }}
                margin="dense"
                label="This Week"
                name="ThisWeek"
                value={editRowData.ThisWeek}
                onChange={handleInputChange}
                fullWidth
              />
              <TextField
                sx={{
                  '& .MuiInputLabel-root': { fontWeight: 'bold' },
                  '& .MuiInputBase-input': { fontWeight: 'bold' }
                }}
                margin="dense"
                label="Last Week"
                name="LastWeek"
                value={editRowData.LastWeek}
                onChange={handleInputChange}
                fullWidth
              />
              <TextField
                sx={{
                  '& .MuiInputLabel-root': { fontWeight: 'bold' },
                  '& .MuiInputBase-input': { fontWeight: 'bold' }
                }}
                margin="dense"
                label="Last Year"
                name="LastYear"
                value={editRowData.LastYear}
                onChange={handleInputChange}
                fullWidth
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="secondary" sx={{ fontWeight: 'bold' }}>
            Cancel
          </Button>
          <Button onClick={handleSave} color="primary" sx={{ fontWeight: 'bold' }}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Chart1Component;