import React, { useEffect, useState } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';

const textStyle = {
  fontWeight: 'bold',
  fontSize: '1.2rem'
};

const client = generateClient<Schema>();

interface Chart5 {
    id: string;
    Order: number;
    Title: string;
    ThisMonth: number;
    LastMonth: number;
    LastYear: number;
}

const Chart5Component: React.FC = () => {
  const [chart5Data, setChart5Data] = useState<Chart5[]>([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentEditItem, setCurrentEditItem] = useState<Chart5 | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response5 = await client.models.Chart5.list();
        const sortedData5 = response5.data
          .map(item => ({
            id: item.id ?? '',
            Order: item.Order ?? 0,
            Title: item.Title ?? '',
            ThisMonth: item.ThisMonth ?? 0,
            LastMonth: item.LastMonth ?? 0,
            LastYear: item.LastYear ?? 0,
          }))
          .sort((a, b) => a.Order - b.Order);

        setChart5Data(sortedData5);
      } catch (error) {
        console.error('Error fetching chart data:', error);
      }
    };

    fetchData();
  }, []);

  const formatNumber = (num: number) => {
    return num.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  };

  const handleDialogClose = () => {
    setEditDialogOpen(false);
    setCurrentEditItem(null);
  };

  const handleSave = async () => {
    if (currentEditItem) {
      try {
        await client.models.Chart5.update(currentEditItem);
        setChart5Data(prevData =>
          prevData.map(item => (item.Order === currentEditItem.Order ? currentEditItem : item))
        );
      } catch (error) {
        console.error('Error updating chart data:', error);
      }
    }
    handleDialogClose();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (currentEditItem) {
      setCurrentEditItem({
        ...currentEditItem,
        [e.target.name]: e.target.value,
      });
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
          鉄鋼在庫
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={textStyle} style={{ width: '10%' }}>Order</TableCell>
                <TableCell sx={textStyle} style={{ width: '30%' }}>タイトル</TableCell>
                <TableCell sx={textStyle} style={{ width: '15%', textAlign: 'right' }}>今月</TableCell>
                <TableCell sx={textStyle} style={{ width: '15%', textAlign: 'right' }}>先月</TableCell>
                <TableCell sx={textStyle} style={{ width: '15%', textAlign: 'right' }}>前年同月</TableCell>
                <TableCell sx={textStyle} style={{ width: '15%' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {chart5Data.map((item, index) => (
                <TableRow key={index}>
                  <TableCell sx={textStyle}>{item.Order}</TableCell>
                  <TableCell sx={textStyle}>{item.Title}</TableCell>
                  <TableCell sx={textStyle} align="right">{formatNumber(item.ThisMonth)}</TableCell>
                  <TableCell sx={textStyle} align="right">{formatNumber(item.LastMonth)}</TableCell>
                  <TableCell sx={textStyle} align="right">{formatNumber(item.LastYear)}</TableCell>
                  <TableCell>
                    <Button variant="contained" color="primary" sx={{ fontWeight: 'bold' }}>
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
        <DialogTitle sx={textStyle}>Edit Item</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Order"
            name="Order"
            type="number"
            fullWidth
            value={currentEditItem?.Order}
            onChange={handleInputChange}
            sx={{
              '& .MuiInputLabel-root': { fontWeight: 'bold' },
              '& .MuiInputBase-input': { fontWeight: 'bold' }
            }}
          />
          <TextField
            margin="dense"
            label="Title"
            name="Title"
            type="text"
            fullWidth
            value={currentEditItem?.Title}
            onChange={handleInputChange}
            sx={{
              '& .MuiInputLabel-root': { fontWeight: 'bold' },
              '& .MuiInputBase-input': { fontWeight: 'bold' }
            }}
          />
          <TextField
            margin="dense"
            label="This Month"
            name="ThisMonth"
            type="number"
            fullWidth
            value={currentEditItem?.ThisMonth}
            onChange={handleInputChange}
            sx={{
              '& .MuiInputLabel-root': { fontWeight: 'bold' },
              '& .MuiInputBase-input': { fontWeight: 'bold' }
            }}
          />
          <TextField
            margin="dense"
            label="Last Month"
            name="LastMonth"
            type="number"
            fullWidth
            value={currentEditItem?.LastMonth}
            onChange={handleInputChange}
            sx={{
              '& .MuiInputLabel-root': { fontWeight: 'bold' },
              '& .MuiInputBase-input': { fontWeight: 'bold' }
            }}
          />
          <TextField
            margin="dense"
            label="Last Year"
            name="LastYear"
            type="number"
            fullWidth
            value={currentEditItem?.LastYear}
            onChange={handleInputChange}
            sx={{
              '& .MuiInputLabel-root': { fontWeight: 'bold' },
              '& .MuiInputBase-input': { fontWeight: 'bold' }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary" sx={{ fontWeight: 'bold' }}>
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

export default Chart5Component;
