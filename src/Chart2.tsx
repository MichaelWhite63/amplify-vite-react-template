import React, { useEffect, useState } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';

const client = generateClient<Schema>();

interface Chart2 {
  id: string;
  Order: number;
  Title: string;
  ThisMonth: number;
  LastMonth: number;
  LastYear: number;
}

const Chart2Component: React.FC = () => {
  const [chart2Data, setChart2Data] = useState<Chart2[]>([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentEditItem, setCurrentEditItem] = useState<Chart2 | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response2 = await client.models.Chart2.list();
        const sortedData2 = response2.data
          .map(item => ({
            id: item.id ?? '',
            Order: item.Order ?? 0,
            Title: item.Title ?? '',
            ThisMonth: item.ThisMonth ?? 0,
            LastMonth: item.LastMonth ?? 0,
            LastYear: item.LastYear ?? 0,
          }))
          .sort((a, b) => a.Order - b.Order);

        setChart2Data(sortedData2);
      } catch (error) {
        console.error('Error fetching chart data:', error);
      }
    };

    fetchData();
  }, []);

  const formatNumber = (num: number) => {
    return num.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  };

  const handleEditClick = (item: Chart2) => {
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
        await client.models.Chart2.update(currentEditItem);
        setChart2Data(prevData =>
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
          Mimiru Steel Loading
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell style={{ width: '10%' }}>Order</TableCell>
                <TableCell style={{ width: '30%' }}>Title</TableCell>
                <TableCell style={{ width: '15%', textAlign: 'right' }}>This Month</TableCell>
                <TableCell style={{ width: '15%', textAlign: 'right' }}>Last Month</TableCell>
                <TableCell style={{ width: '15%', textAlign: 'right' }}>Last Year</TableCell>
                <TableCell style={{ width: '15%' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {chart2Data.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.Order}</TableCell>
                  <TableCell>{item.Title}</TableCell>
                  <TableCell align="right">{formatNumber(item.ThisMonth)}</TableCell>
                  <TableCell align="right">{formatNumber(item.LastMonth)}</TableCell>
                  <TableCell align="right">{formatNumber(item.LastYear)}</TableCell>
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
            label="This Month"
            name="ThisMonth"
            type="number"
            fullWidth
            value={currentEditItem?.ThisMonth}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            label="Last Month"
            name="LastMonth"
            type="number"
            fullWidth
            value={currentEditItem?.LastMonth}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            label="Last Year"
            name="LastYear"
            type="number"
            fullWidth
            value={currentEditItem?.LastYear}
            onChange={handleInputChange}
          />
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

export default Chart2Component;