import React, { useEffect, useState } from 'react';
import { Typography, Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { useNavigate } from 'react-router-dom';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource';

const client = generateClient<Schema>();

interface NewsItem {
  id: string;
  title: string;
  date: string;
  type: 'Steel' | 'Auto' | 'Aluminum';
  published: boolean;
}

const Default: React.FC = () => {
  const [steelNews, setSteelNews] = useState<NewsItem[]>([]);
  const [autoNews, setAutoNews] = useState<NewsItem[]>([]);
  const [aluminumNews, setAluminumNews] = useState<NewsItem[]>([]);
  const [chart1Data, setChart1Data] = useState<any[]>([]);
  const [chart2Data, setChart2Data] = useState<any[]>([]);
  const [chart3Data, setChart3Data] = useState<any[]>([]);
  const [chart4Data, setChart4Data] = useState<any[]>([]);
  const [chart5Data, setChart5Data] = useState<any[]>([]);
  const [chart6Data, setChart6Data] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Steel News
        const steelResponse = await client.models.News.list({
          filter: {
            type: { eq: 'Steel' },
            published: { eq: true }
          }
        });

        // Fetch Auto News
        const autoResponse = await client.models.News.list({
          filter: {
            type: { eq: 'Auto' },
            published: { eq: true }
          }
        });

        // Fetch Aluminum News
        const aluminumResponse = await client.models.News.list({
          filter: {
            type: { eq: 'Aluminum' },
            published: { eq: true }
          }
        });

        // Map and set the news data
        setSteelNews(mapNewsResponse(steelResponse.data));
        setAutoNews(mapNewsResponse(autoResponse.data));
        setAluminumNews(mapNewsResponse(aluminumResponse.data));

        // Fetch Chart1 data
        const chart1Response = await client.models.Chart1.list();
        const sortedChart1Data = chart1Response.data
          .map(item => ({
            Order: item.Order ?? 0,
            Title: item.Title ?? '',
            ThisWeek: item.ThisWeek ?? 0,
            LastWeek: item.LastWeek ?? 0,
            LastYear: item.LastYear ?? 0,
          }))
          .sort((a, b) => a.Order - b.Order);

        setChart1Data(sortedChart1Data);

        // Fetch Chart2 data
        const chart2Response = await client.models.Chart2.list();
        const sortedChart2Data = chart2Response.data
          .map(item => ({
            Order: item.Order ?? 0,
            Title: item.Title ?? '',
            ThisMonth: item.ThisMonth ?? 0,
            LastMonth: item.LastMonth ?? 0,
            LastYear: item.LastYear ?? 0,
          }))
          .sort((a, b) => a.Order - b.Order);

        setChart2Data(sortedChart2Data);

        // Fetch Chart3 data
        const chart3Response = await client.models.Chart3.list();
        const sortedChart3Data = chart3Response.data
          .map(item => ({
            Order: item.Order ?? 0,
            Title: item.Title ?? '',
            Import: item.Import ?? 0,
            MillPrice: item.MillPrice ?? 0,
          }))
          .sort((a, b) => a.Order - b.Order);

        setChart3Data(sortedChart3Data);

        // Fetch Chart4 data
        const chart4Response = await client.models.Chart4.list();
        const sortedChart4Data = chart4Response.data
          .map(item => ({
            Order: item.Order ?? 0,
            Title: item.Title ?? '',
            ThisMonth: item.ThisMonth ?? 0,
            LastMonth: item.LastMonth ?? 0,
            LastYear: item.LastYear ?? 0,
          }))
          .sort((a, b) => a.Order - b.Order);

        setChart4Data(sortedChart4Data);

        // Fetch Chart5 data
        const chart5Response = await client.models.Chart5.list();
        const sortedChart5Data = chart5Response.data
          .map(item => ({
            Order: item.Order ?? 0,
            Title: item.Title ?? '',
            ThisMonth: item.ThisMonth ?? 0,
            LastMonth: item.LastMonth ?? 0,
            LastYear: item.LastYear ?? 0,
          }))
          .sort((a, b) => a.Order - b.Order);

        setChart5Data(sortedChart5Data);

        // Fetch Chart6 data
        const chart6Response = await client.models.Chart6.list();
        const sortedChart6Data = chart6Response.data
          .map(item => ({
            Order: item.Order ?? 0,
            Title: item.Title ?? '',
            ThisMonth: item.ThisMonth ?? 0,
            LastMonth: item.LastMonth ?? 0,
            LastYear: item.LastYear ?? 0,
          }))
          .sort((a, b) => a.Order - b.Order);

        setChart6Data(sortedChart6Data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    const mapNewsResponse = (data: any[]) => data.map(item => ({
      id: item.id ?? '',
      title: item.title ?? '',
      date: item.date ?? '',
      type: (item.type ?? 'Steel') as 'Steel' | 'Auto' | 'Aluminum',
      published: item.published ?? false
    }));

    fetchData();
  }, []);

  // Helper component for news display
  const NewsColumn = ({ title, news }: { title: string, news: NewsItem[] }) => {
    const navigate = useNavigate();
    
    return (
      <Grid size={3}>
        <Paper sx={{ p: 2, height: '100%' }}>
          <Typography variant="h4" gutterBottom>
            {title}
          </Typography>
          {news.map((item) => (
            <Box key={item.id} sx={{ mb: 2 }}>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': {
                    textDecoration: 'underline',
                    color: 'primary.main'
                  }
                }}
                onClick={() => navigate(`/detail/${item.id}`)}
              >
                {item.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {new Date(item.date).toLocaleDateString()}
              </Typography>
            </Box>
          ))}
        </Paper>
      </Grid>
    );
  };

  return (
    <Box sx={{ 
      flexGrow: 1, 
      p: 3, 
      mt: 8,
      width: '100%',
      maxWidth: '95%',
      margin: '0 auto',
      marginLeft: '0.25%',
      backgroundColor: '#f5f5f5',
      borderRadius: '8px',
      boxShadow: 1
    }}>
      <Grid container spacing={3}>
        <NewsColumn title="Steel" news={steelNews} />
        <NewsColumn title="Auto" news={autoNews} />
        <NewsColumn title="Aluminum" news={aluminumNews} />
        {/* Authentication Column */}
        <Grid size={3}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h4" gutterBottom>
              Authentication
            </Typography>
            <div style={{ 
              transform: 'scale(0.5)',
              transformOrigin: 'top left',
              width: '200%', // Compensate for scale to maintain layout
              height: '200%' // Compensate for scale to maintain layout
            }}>
              <Authenticator>
                {({ signOut, user }) => (
                  <div>
                    {user ? (
                      <>
                        <button onClick={signOut}>Sign out</button>
                        <TableContainer component={Paper} sx={{ mt: 2, mb: 4 }}>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Title</TableCell>
                                <TableCell align="right">This Week</TableCell>
                                <TableCell align="right">Last Week</TableCell>
                                <TableCell align="right">Last Year</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {chart1Data.map((row, index) => (
                                <TableRow key={index}>
                                  <TableCell>{row.Title}</TableCell>
                                  <TableCell align="right">{row.ThisWeek.toFixed(1)}</TableCell>
                                  <TableCell align="right">{row.LastWeek.toFixed(1)}</TableCell>
                                  <TableCell align="right">{row.LastYear.toFixed(1)}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>

                        {/* Chart2 Table */}
                        <TableContainer component={Paper} sx={{ mt: 2 }}>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Title</TableCell>
                                <TableCell align="right">This Week</TableCell>
                                <TableCell align="right">Last Week</TableCell>
                                <TableCell align="right">Last Year</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {chart2Data.map((row, index) => (
                                <TableRow key={index}>
                                  <TableCell>{row.Title}</TableCell>
                                  <TableCell align="right">{row.ThisMonth.toFixed(1)}</TableCell>
                                  <TableCell align="right">{row.LastMonth.toFixed(1)}</TableCell>
                                  <TableCell align="right">{row.LastYear.toFixed(1)}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>

                        {/* Chart3 Table */}
                        <TableContainer component={Paper} sx={{ mt: 2 }}>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Title</TableCell>
                                <TableCell align="right">Import</TableCell>
                                <TableCell align="right">Mill Price</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {chart3Data.map((row, index) => (
                                <TableRow key={index}>
                                  <TableCell>{row.Title}</TableCell>
                                  <TableCell align="right">{row.Import.toFixed(1)}</TableCell>
                                  <TableCell align="right">{row.MillPrice.toFixed(1)}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>

                        {/* Chart4 Table */}
                        <TableContainer component={Paper} sx={{ mt: 2 }}>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Title</TableCell>
                                <TableCell align="right">This Month</TableCell>
                                <TableCell align="right">Last Month</TableCell>
                                <TableCell align="right">Last Year</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {chart4Data.map((row, index) => (
                                <TableRow key={index}>
                                  <TableCell>{row.Title}</TableCell>
                                  <TableCell align="right">{row.ThisMonth.toFixed(1)}</TableCell>
                                  <TableCell align="right">{row.LastMonth.toFixed(1)}</TableCell>
                                  <TableCell align="right">{row.LastYear.toFixed(1)}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>

                        {/* Chart5 Table */}
                        <TableContainer component={Paper} sx={{ mt: 2 }}>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Title</TableCell>
                                <TableCell align="right">This Month</TableCell>
                                <TableCell align="right">Last Month</TableCell>
                                <TableCell align="right">Last Year</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {chart5Data.map((row, index) => (
                                <TableRow key={index}>
                                  <TableCell>{row.Title}</TableCell>
                                  <TableCell align="right">{row.ThisMonth.toFixed(1)}</TableCell>
                                  <TableCell align="right">{row.LastMonth.toFixed(1)}</TableCell>
                                  <TableCell align="right">{row.LastYear.toFixed(1)}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>

                        {/* Chart6 Table */}
                        <TableContainer component={Paper} sx={{ mt: 2 }}>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Title</TableCell>
                                <TableCell align="right">This Month</TableCell>
                                <TableCell align="right">Last Month</TableCell>
                                <TableCell align="right">Last Year</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {chart6Data.map((row, index) => (
                                <TableRow key={index}>
                                  <TableCell>{row.Title}</TableCell>
                                  <TableCell align="right">{row.ThisMonth.toFixed(1)}</TableCell>
                                  <TableCell align="right">{row.LastMonth.toFixed(1)}</TableCell>
                                  <TableCell align="right">{row.LastYear.toFixed(1)}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </>
                    ) : (
                      <Typography>Please sign in</Typography>
                    )}
                  </div>
                )}
              </Authenticator>
            </div>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Default;
