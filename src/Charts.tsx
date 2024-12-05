import React from 'react';
import { Box } from '@mui/material';
import Grid from '@mui/material/Grid2'; // Import the stable version of Grid2
import Chart1Component from './Chart1';
import Chart2Component from './Chart2';
import Chart3Component from './Chart3';
import Chart4Component from './Chart4';
import Chart5Component from './Chart5';
import Chart6Component from './Chart6'; // Import Chart6Component

const Charts: React.FC = () => {
  return (
    <Box sx={{
      width: {
        xs: '100%', // Full width on extra-small screens
        sm: '80%',  // 80% width on small screens and above
      },
      mx: 'auto',
      mt: 4
    }}>
      <Grid container spacing={3} direction="column" alignItems="center">
        <Grid size={12}>
          <Chart1Component />
        </Grid>
        <Grid size={12}>
          <Chart2Component />
        </Grid>
        <Grid size={12}><Chart4Component /> </Grid>
        <Grid size={12}><Chart5Component /> </Grid>        
        <Grid size={12}><Chart6Component /> </Grid> {/* Add Chart6Component */}
        <Grid size={12}><Chart3Component /> </Grid>
      </Grid>
    </Box>
  );
};

export default Charts;