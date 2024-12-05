import React, { useEffect, useState } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';

const client = generateClient<Schema>();

interface Chart3 {
  id: string;
  Order: number;
  Title: string;
  Import: number;
  MillPrice: number;
}

const Chart3Component: React.FC = () => {
  const [chart3Data, setChart3Data] = useState<Chart3[]>([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentEditItem, setCurrentEditItem] = useState<Chart3 | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response3 = await client.models.Chart3.list();
        const sortedData3 = response3.data
          .map(item => ({
            id: item.id ?? '',
            Order: item.Order ?? 0,
            Title: item.Title ?? '',
            Import: item.Import ?? 0,
            MillPrice: item.MillPrice ?? 0,
            // Map any additional fields here
          }))
          .sort((a, b) => a.Order - b.Order);

        setChart3Data(sortedData3);
      } catch (error) {
        console.error('Error fetching chart data:', error);
      }
    };

    fetchData();
  }, []);

  const formatNumber = (num: number) => {
    return num.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  };

  const handleEditClick = (item: Chart3) => {
    setCurrentEditItem(item);
    setEditDialogOpen(true);
  };

  const handleDialogClose = () => {
    setEditDialogOpen(false);
    setCurrentEditItem(null);
  };

  const handleSave = async () => {
    if (currentEditItem) {
      try {
        await client.models.Chart3.update(currentEditItem);
        setChart3Data(prevData =>
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
        <Typography variant="h4" gutterBottom>
          American Steel Industry
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell style={{ width: '10%' }}>Order</TableCell>
                <TableCell style={{ width: '30%' }}>Title</TableCell>
                <TableCell style={{ width: '15%', textAlign: 'right' }}>Import</TableCell>
                <TableCell style={{ width: '15%', textAlign: 'right' }}>Mill Price</TableCell>
                <TableCell style={{ width: '15%' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {chart3Data.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.Order}</TableCell>
                  <TableCell>{item.Title}</TableCell>
                  <TableCell align="right">{formatNumber(item.Import)}</TableCell>
                  <TableCell align="right">{formatNumber(item.MillPrice)}</TableCell>
                  <TableCell>
                    <Button variant="contained" color="primary" onClick={() => handleEditClick(item)}>
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
        <DialogTitle>Edit Item</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Order"
            name="Order"
            type="number"
            fullWidth
            value={currentEditItem?.Order}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            label="Title"
            name="Title"
            type="text"
            fullWidth
            value={currentEditItem?.Title}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            label="Import"
            name="Import"
            type="number"
            fullWidth
            value={currentEditItem?.Import}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            label="Mill Price"
            name="MillPrice"
            type="number"
            fullWidth
            value={currentEditItem?.MillPrice}
            onChange={handleInputChange}
          />
          {/* Add any additional fields here */}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSave} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Chart3Component;
