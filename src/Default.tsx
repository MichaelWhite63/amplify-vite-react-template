import React, { useEffect, useState } from 'react';
import { Typography, Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { useNavigate } from 'react-router-dom';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource';

const client = generateClient<Schema>();
const logoUrl = 'https://metal-news-image.s3.us-east-1.amazonaws.com/imgMetalNewsLogoN3.gif';

interface NewsItem {
  id: string;
  title: string;
  date: string;
  type: 'Steel' | 'Auto' | 'Aluminum';
  published: boolean;
}

interface FirstItem {
  title: string;
  id: string;
  date: string;
  memo: string;
  type: string;
  source: string;
}

// Helper function to truncate HTML content - add this before the Default component
const truncateHtml = (html: string, maxLength: number) => {
  const div = document.createElement('div');
  div.innerHTML = html;
  const text = div.textContent || div.innerText || '';
  if (text.length <= maxLength) return html;
  return text.substring(0, maxLength) + '...';
};

// First, add a date formatting helper function at the top of the file with other helpers
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ja-JP', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const Default: React.FC = () => {
  const navigate = useNavigate();
  const [firstSteelItem, setFirstSteelItem] = useState<FirstItem>({
    title: '',
    id: '',
    date: '01/01/01',
    memo: '',
    type: '',
    source: ''
  });
  const [firstAutoItem, setFirstAutoItem] = useState<FirstItem>({
    title: '',
    id: '',
    date: '01/01/01',
    memo: '',
    type: '',
    source: ''
  });
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
        // Fetch Steel News using getTopTen
        const steelTopTen = await client.queries.getTopTen({ type: 'Steel', count: 10 });
        const parsedSteelData = JSON.parse(steelTopTen.data as string);
        setFirstSteelItem({
          title: parsedSteelData[0]?.title || 'Loading...',
          id: parsedSteelData[0]?.id || '',
          date: parsedSteelData[0]?.date || '01/01/1900',
          memo: parsedSteelData[0]?.memo || '',
          type: parsedSteelData[0]?.type || 'Steel',
          source: parsedSteelData[0]?.source || ''
        });

        const autoTopTen = await client.queries.getTopTen({ type: 'Auto', count: 10 });
        const parsedAutoData = JSON.parse(autoTopTen.data as string);
        setFirstAutoItem({
          title: parsedAutoData[0]?.title || 'Loading...',
          id: parsedAutoData[0]?.id || '',
          date: parsedAutoData[0]?.date || '01/01/1900',
          memo: parsedAutoData[0]?.memo || '',
          type: parsedAutoData[0]?.type || 'Auto',
          source: parsedAutoData[0]?.source || ''
        });

        const aluminumTopTen = await client.queries.getTopTen({ type: 'Aluminum', count: 10 });

        // Map and set the news data
        setSteelNews(mapNewsResponse(JSON.parse(steelTopTen.data as string)));
        setAutoNews(mapNewsResponse(JSON.parse(autoTopTen.data as string)));
        setAluminumNews(mapNewsResponse(JSON.parse(aluminumTopTen.data as string)));

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

  const handleArchiveClick = () => {
    // You can implement archive functionality here
    navigate('/archive');
  };

  // Helper component for news display
  const NewsColumn = ({ title, news }: { title: string, news: NewsItem[] }) => {
    const navigate = useNavigate();
    
    return (
      <Grid size={3}>
        <Paper sx={{ p: 2, height: '100%' }}>
          <Typography variant="h6" gutterBottom sx={{ textAlign: 'center' }}>
            {title}<hr></hr>
          </Typography>
          {news.map((item) => (
            <Box key={item.id} sx={{ mb: 2 }}>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  cursor: 'pointer',
                  color: '#0000EE', // Standard hyperlink blue color
                  textDecoration: 'underline',
                  '&:hover': {
                    color: '#551A8B' // Visited link color on hover
                  },
                  '&:active': {
                    color: '#FF0000' // Active link color
                  }
                }}
                onClick={() => navigate(`/detail/${item.id}`)}
              >
                {item.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {new Date(item.date).toLocaleDateString()}
              </Typography>
              <br></br><hr></hr>
            </Box>
          ))}
        </Paper>
      </Grid>
    );
  };

  return (
    <>
      <div style={{ 
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        margin: 0,
        padding: 0,
        backgroundColor: '#191970',
        height: '65px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{ width: '950px', margin: '0 auto' }}>
          <img 
            src={logoUrl} 
            alt="Metal News Logo" 
            style={{ 
              display: 'block',
              backgroundColor: 'white',
              height: '63px'  // Added fixed height
            }} 
          />
        </div>
      </div>
      
      <Box sx={{ 
        flexGrow: 1, 
        p: 3,
        width: '100%',
        maxWidth: '98%',
        margin: '0 auto',
        marginLeft: '0.25%',
        backgroundColor: '#f5f5f5',  // Keep original background
        borderRadius: '8px',
        boxShadow: 1
      }}>
        <Grid container spacing={3}>
          <Grid size={9}>
            <Box sx={{
              p: 2,
              mb: 2,
              backgroundColor: 'white',
              borderRadius: '4px',
              boxShadow: 1,
              textAlign: 'left'
            }}>
              {/* Steel News */}
              <img 
                src="https://metal-news-image.s3.us-east-1.amazonaws.com/MetalNewsNewImage.png"
                alt="Metal News New"
                style={{
                  width: '25px', // Reduced from 50px to 25px (50% reduction)
                  height: 'auto',
                  marginRight: '10px',
                  verticalAlign: 'middle'
                }}
              />
              <Typography 
                variant="h6"
                onClick={() => navigate(`/detail/${firstSteelItem.id}`)}
                sx={{ 
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  color: '#0000EE', // Standard hyperlink blue color
                  '&:hover': {
                    textDecoration: 'underline',
                    color: 'primary.main'
                  },
                  display: 'inline-block' // Add this to keep the text on the same line as the image
                }}
              >
                 {firstSteelItem.title}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ mt: 1, mb: 2 }}
                dangerouslySetInnerHTML={{ __html: truncateHtml(firstSteelItem.memo, 200) }}
              />
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mt: 1 
              }}>
                <Typography variant="body2" color="text.secondary">
                鉄鋼 日付: {formatDate(firstSteelItem.date)}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <img 
                    src="https://metal-news-image.s3.us-east-1.amazonaws.com/tagAndKeywordImage.png"
                    alt="Tag and Keyword"
                    style={{
                      width: '25px',
                      height: 'auto',
                      marginRight: '10px',
                      verticalAlign: 'middle'
                    }}
                  />
                  <Typography variant="body2" color="text.secondary">
                  タグ: {firstSteelItem.source}
                  </Typography>
                </Box>
              </Box>

              {/* Divider */}
              <Box sx={{ my: 2, borderTop: '1px solid #eee' }} />

              {/* Auto News */}
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <img 
                  src="https://metal-news-image.s3.us-east-1.amazonaws.com/MetalNewsNewImage.png"
                  alt="Metal News New"
                  style={{
                    width: '25px',
                    height: 'auto',
                    marginRight: '10px',
                    verticalAlign: 'middle'
                  }}
                />
                <Typography 
                  variant="h6"
                  onClick={() => navigate(`/detail/${firstAutoItem.id}`)}
                  sx={{ 
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    color: '#0000EE',
                    '&:hover': {
                      textDecoration: 'underline',
                      color: 'primary.main'
                    },
                    display: 'inline-block'
                  }}
                >
                  最新 自動車: {firstAutoItem.title}
                </Typography>
              </Box>
              <Typography 
                variant="body2" 
                sx={{ mt: 1, mb: 2 }}
                dangerouslySetInnerHTML={{ __html: truncateHtml(firstAutoItem.memo, 200) }}
              />
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mt: 1 
              }}>
                <Typography variant="body2" color="text.secondary">
                自動車 日付: {formatDate(firstAutoItem.date)}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <img 
                    src="https://metal-news-image.s3.us-east-1.amazonaws.com/tagAndKeywordImage.png"
                    alt="Tag and Keyword"
                    style={{
                      width: '25px',
                      height: 'auto',
                      marginRight: '10px',
                      verticalAlign: 'middle'
                    }}
                  />
                  <Typography variant="body2" color="text.secondary">
                  タグ: {firstAutoItem.source}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>
          <Grid size={3}>
            <Paper sx={{ 
              p: 2, 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              height: '100%'
            }}>
              <Button
                variant="contained"
                onClick={handleArchiveClick}
                sx={{
                  backgroundColor: '#191970',
                  fontSize: '1rem',
                  padding: '10px 20px',
                  '&:hover': {
                    backgroundColor: '#1e1e90'
                  }
                }}
              >
                アーカイブ
              </Button>
            </Paper>
          </Grid>
          <NewsColumn title="鉄鋼" news={steelNews} />
          <NewsColumn title="自動車" news={autoNews} />
          <NewsColumn title="アルミ" news={aluminumNews} />
  
          {/* Authentication Column */}
          <Grid size={3}>
            <Paper sx={{ p: 2, height: '100%' }}>
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
                          <Typography 
                            variant="h3" 
                            sx={{ 
                              textAlign: 'center',
                              mb: 2
                            }}
                          >
                            米国鉄鋼景気指標
                          </Typography><hr></hr>
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

                          {/* Move Sign Out button here, after all charts */}
                          <Box sx={{ mt: 2, textAlign: 'center' }}>
                            <button onClick={signOut}>Sign out</button>
                          </Box>
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
      <Box sx={{ 
        width: '100%', 
        textAlign: 'center', 
        mt: 2, 
        mb: 2 
      }}>
        <Typography 
          variant="body2" 
          component="span" 
          onClick={() => navigate('/privacy-policy')}
          sx={{ 
            cursor: 'pointer',
            '&:hover': {
              textDecoration: 'underline',
              color: 'primary.main'
            }
          }}
        >
          プライバシーポリシー
        </Typography>
      </Box>
    </>
  );
};

export default Default;
