import React, { useEffect, useState } from 'react';
import { Typography, Box, Paper, /*Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, */ TextField, Button } 
  from '@mui/material';
import Grid from '@mui/material/Grid';
import { useNavigate } from 'react-router-dom';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const client = generateClient<Schema>();
const logoUrl = 'https://metal-news-image.s3.us-east-1.amazonaws.com/imgMetalNewsLogoN3.gif';

interface NewsItem {
  id: string;
  title: string;
  date: string;
  type: 'Steel' | 'Auto' | 'Aluminum';
  published: boolean;
}

interface NewsSearchResponse {
  id: string | null;
  title:  string | null;
  group: number | null;
  writtenBy: string | null;
  date: string | null;
  lDate: string | null;
  source: string | null;
  memo: string | null;
  ord: number | null;
  rank: number | null;
  header: string | null;
  published: boolean | null;
  type: 'Steel' | 'Auto' | 'Aluminum' | null;
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
  /*
  const [chart1Data, setChart1Data] = useState<any[]>([]);
  const [chart2Data, setChart2Data] = useState<any[]>([]);
  const [chart3Data, setChart3Data] = useState<any[]>([]);
  const [chart4Data, setChart4Data] = useState<any[]>([]);
  const [chart5Data, setChart5Data] = useState<any[]>([]);
  const [chart6Data, setChart6Data] = useState<any[]>([]);
  */
  const [keyword, setKeyword] = useState('');
//  const [archiveResults/*, setArchiveResults*/] = useState<NewsSearchResponse[]>([]);
  const [searchDate, setSearchDate] = useState(new Date());
/*
  const tableTextStyle = {
    fontSize: '1.2rem',  // Increase font size
    fontWeight: 'medium' // Optional: add medium weight for better readability
  };

  const tableHeaderStyle = {
    ...tableTextStyle,
    backgroundColor: '#d4e6f1', // Light blue background for headers
    fontWeight: 'bold'  // Make headers bold
  };
*/
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Steel News using getTopTen
        const steelTopTen = await client.queries.getTopTen({ type: 'Steel', count: 10 });
        console.log('Steel Top Ten:', steelTopTen);
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
/*
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
        */
/*
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
*/
        /*
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
        */
/*
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
        */
/*
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
        */
/*
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
*/
        //setChart6Data(sortedChart6Data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    const mapNewsResponse = (data: NewsSearchResponse[]) => data.map(item => ({
      id: item.id ?? '',
      title: item.title ?? '',
      date: item.date ?? '',
      type: (item.type ?? 'Steel') as 'Steel' | 'Auto' | 'Aluminum',
      published: item.published ?? false
    }));

    fetchData();
  }, []);

  const handleArchiveSearch = () => {
    if (keyword.trim()) {
      // Navigate to Archive page with the keyword and explicitly set tab to 1 (keyword search)
      navigate(`/archive?keyword=${encodeURIComponent(keyword.trim())}&tab=1`);
    }
  };

  const handleKeywordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(event.target.value);
  };

  const handleDateSearch = () => {
    // Format date to YYYY-MM-DD for URL
    const formattedDate = searchDate.toISOString().split('T')[0];
    // Navigate to Archive page with date parameter and tab=0 (date search tab)
    navigate(`/archive?date=${formattedDate}&tab=0&type=${encodeURIComponent('Steel')}`);
  };

  // Helper component for news display
  const NewsColumn = ({ title, news }: { title: string, news: NewsItem[] }) => {
    const navigate = useNavigate();

    return (
      <Grid size={{ xs: 12, md: 4 }}>
        <Paper sx={{ p: 2, height: '100%' }}>
          <Typography 
            variant="h5" 
            gutterBottom 
            sx={{ 
              textAlign: 'center',
              backgroundColor: '#191970', // Dark blue to match header
              color: 'white',
              padding: '8px',
              borderRadius: '4px',
              marginBottom: '16px'
            }}
          >
            {title}
          </Typography>
          {news.map((item, index) => (
            <Box 
              key={item.id} 
              sx={{ 
                mb: 2,
                p: 1,
                backgroundColor: index % 2 === 0 ? '#f5f5f5' : '#ffffff',
                borderRadius: '4px',
              }}
            >
              <Typography 
                variant="h6" // Changed from subtitle1 to h6 for larger size
                sx={{ 
                  cursor: 'pointer',
                  color: '#0000EE',
                  textDecoration: 'underline',
                  fontSize: '1.25rem', // Explicitly setting font size for more control
                  '&:hover': {
                    color: '#551A8B'
                  },
                  '&:active': {
                    color: '#FF0000'
                  }
                }}
                onClick={() => navigate(`/detail/${item.id}`)}
              >
                {item.title}
              </Typography>
              <br></br>
              <Typography variant="body2" color="text.secondary">
                発行済み: {new Date(item.date).toLocaleDateString()}
              </Typography>
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
        {/* Changing Grid sizing */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 9}}>
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
                variant="h5"
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
                variant="body1"  // Changed from body2 to body1 for larger font size
                sx={{ 
                  mt: 1, 
                  mb: 2,
                  fontSize: '1.1rem'  // Explicitly setting the font size for more control
                }}
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
                  variant="h5"
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
                variant="body1"  // Changed from body2 to body1 for larger font size
                sx={{ 
                  mt: 1, 
                  mb: 2,
                  fontSize: '1.1rem'  // Explicitly setting the font size for more control
                }}
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
            <Grid container spacing={3}>
              <NewsColumn title="鉄鋼" news={steelNews} />
              <NewsColumn title="自動車" news={autoNews} />
              <NewsColumn title="アルミ" news={aluminumNews} />
              </Grid>
          </Grid>

          {/* Authentication Column size={3}   */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Paper sx={{ p: 1, height: '100%' }}>
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
                          <Box sx={{ mt: 2, textAlign: 'center' }}>
                            <button onClick={signOut}>Sign out</button>
                          </Box>
                      ) : (
                        <Typography>Please sign in</Typography>
                      )}
                    </div>
                  )}
                </Authenticator><br></br><br></br>

                {/* Add title above keyword search - centered with larger font */}
                <Typography sx={{ 
                  fontSize: '2.4rem', // Increased from 1.6rem to 2.4rem (2 sizes larger)
                  mb: 1,
                  textAlign: 'center', // Center the text
                  fontWeight: 'medium' // Optional: add slightly more weight for visibility
                }}>
                  アーカイブを検索する
                </Typography>

                {/* Keyword search field and button */}
                <Box sx={{ display: 'flex', width: '100%', alignItems: 'center' }}>
                  <TextField
                    sx={{
                      width: '60%',
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: '#191970',
                        },
                        '&:hover fieldset': {
                          borderColor: '#1e1e90',
                        },
                        '& input': {
                          fontSize: '2rem',
                        }
                      },
                      '& .MuiInputBase-input::placeholder': {
                        fontSize: '2rem',
                        opacity: 0.7,
                      },
                      marginRight: '16px',
                    }}
                    placeholder="キーワードを入力"
                    value={keyword}
                    onChange={handleKeywordChange}
                  />
                  <Button 
                    variant="contained"
                    onClick={handleArchiveSearch}
                    sx={{
                      width: 'calc(40% - 16px)', // Match remaining width minus margin
                      backgroundColor: '#191970',
                      '&:hover': {
                        backgroundColor: '#1e1e90'
                      },
                      fontSize: '2rem',
                      padding: '8px 16px',
                    }}
                  >
                    ニュースの検索
                  </Button>
                </Box>

                {/* Date picker and search button with identical layout */}
                <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', width: '100%' }}>
                  <Typography sx={{ 
                    fontSize: '2.3rem', 
                    mb: 1,
                    textAlign: 'center' // Add this to center the text
                  }}>
                    日付で検索:
                  </Typography>
                  
                  <Box sx={{ display: 'flex', width: '100%', alignItems: 'center' }}>
                    {/* Increased the width to match the keyword field */}
                    <Box sx={{ width: '60%', marginRight: '16px' }}>
                      <DatePicker
                        selected={searchDate}
                        onChange={(date) => setSearchDate(date || new Date())}
                        dateFormat="yyyy/MM/dd"
                          wrapperClassName="date-picker-full-width" // Add this wrapper class
                        customInput={
                          <input
                            style={{
                              padding: '8px',
                              border: '1px solid #191970',
                              borderRadius: '4px',
                              width: '100%',
                              fontSize: '2rem',
                              textAlign: 'center',
                              boxSizing: 'border-box'
                            }}
                          />
                        }
                      />
                    </Box>
                    <Button 
                      variant="contained"
                      onClick={handleDateSearch}
                      sx={{
                        width: 'calc(40% - 16px)', // Match keyword button width
                        backgroundColor: '#191970',
                        '&:hover': {
                          backgroundColor: '#1e1e90'
                        },
                        fontSize: '2rem',
                        padding: '8px 16px',
                      }}
                    >
                      日付検索
                    </Button>
                  </Box>
                </Box>
              </div>
            </Paper>
          </Grid>
        </Grid>
      </Box>
      {/* Privacy Policy Section */}
        <Box sx={{ 
        width: '100%', 
        display: 'flex',  // Add display flex
        justifyContent: 'flex-start',  // Align items to the left
        alignItems: 'center',
        mt: 2, 
        mb: 2,
        pl: 2  // Add left padding
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

      {/* Make the DatePicker calendar larger */}
      <style>
        {`
          .react-datepicker {
            font-size: 1.5rem !important;
            transform: scale(2);
            transform-origin: top center;
          }
          
          .react-datepicker__header {
            padding-top: 10px !important;
          }
          
          .react-datepicker__month {
            margin: 0.8em !important;
          }
          
          .react-datepicker__day-name, 
          .react-datepicker__day, 
          .react-datepicker__time-name {
            width: 2rem !important;
            line-height: 2rem !important;
            margin: 0.2rem !important;
          }
          
          .react-datepicker__current-month {
            font-size: 1.5rem !important;
          }
          
          .react-datepicker__navigation {
            top: 15px !important;
          }
          /* Position the calendar correctly relative to the input */
          .react-datepicker-wrapper {
            display: block;
            width: 100%;
          }
          .react-datepicker-popper {
            z-index: 9999 !important;
            transform: translate3d(0px, 40px, 0px) !important;
          }
        `}
      </style>
    </>
  );
};

export default Default;
