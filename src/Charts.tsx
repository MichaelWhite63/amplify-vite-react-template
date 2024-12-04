import React from 'react';
import { Box } from '@mui/material';
import Grid2 from '@mui/material/Grid2'; // Import and use Grid2
import Chart1Component from './Chart1';
import Chart2Component from './Chart2';

const Charts: React.FC = () => {
  return (
    <Box sx={{width: {
      xs: '100%', // Full width on extra-small screens
      sm: '100%',  // 80% width on small screens and above
      },
      mx: 'auto',
      mt: 4
    }}>
    <Grid2 container spacing={3} direction="column" alignItems="center">        <Grid2 xs={12}>
          <Chart1Component />
        </Grid2>
        <Grid2 sx={{ xs: 12 }}>
          <Chart2Component />
        </Grid2>
      </Grid2>
    </Box>
  );
};

export default Charts;