import React, { useEffect, useState } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';

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
        <Typography variant="h4" gutterBottom>
          American Iron and Steel Co., Ltd. index
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell style={{ width: '15%' }}>Order</TableCell>
                <TableCell style={{ width: '80%' }}>Title</TableCell>
                <TableCell style={{ width: '15%', textAlign: 'right' }}>This Week</TableCell>
                <TableCell style={{ width: '15%', textAlign: 'right' }}>Last Week</TableCell>
                <TableCell style={{ width: '15%', textAlign: 'right' }}>Last Year</TableCell>
                <TableCell style={{ width: '25%' }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {chart1Data.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.Order}</TableCell>
                  <TableCell>{item.Title}</TableCell>
                  <TableCell align="right">{formatNumber(item.ThisWeek)}</TableCell>
                  <TableCell align="right">{formatNumber(item.LastWeek)}</TableCell>
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
        <DialogTitle>Edit Row</DialogTitle>
        <DialogContent>
          {editRowData && (
            <>
              <TextField
                margin="dense"
                label="Order"
                name="Order"
                value={editRowData.Order}
                onChange={handleInputChange}
                fullWidth
              />
              <TextField
                margin="dense"
                label="Title"
                name="Title"
                value={editRowData.Title}
                onChange={handleInputChange}
                fullWidth
              />
              <TextField
                margin="dense"
                label="This Week"
                name="ThisWeek"
                value={editRowData.ThisWeek}
                onChange={handleInputChange}
                fullWidth
              />
              <TextField
                margin="dense"
                label="Last Week"
                name="LastWeek"
                value={editRowData.LastWeek}
                onChange={handleInputChange}
                fullWidth
              />
              <TextField
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
          <Button onClick={handleDialogClose} color="secondary">
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

export default Chart1Component;