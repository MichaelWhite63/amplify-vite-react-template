import React, { useState, useEffect } from 'react';
import { Typography, Box, Paper, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel, 
         Accordion, AccordionSummary, AccordionDetails, TextField, Button, Tabs, Tab } from '@mui/material';
import Grid from '@mui/material/Grid';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DOMPurify from 'dompurify';
import { useNavigate } from 'react-router-dom';

const client = generateClient<Schema>();

const logoUrl = 'https://metal-news-image.s3.us-east-1.amazonaws.com/imgMetalNewsLogoN3.gif';
/*
interface NewsItem {
  id: string;
  title: string;
  date: string;
  type: 'Steel' | 'Auto' | 'Aluminum';
  published: boolean;
  memo?: string; // Add memo field
}
*/
interface NewsItem {
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

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`archive-tabpanel-${index}`}
      aria-labelledby={`archive-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Archive: React.FC = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [newsType, setNewsType] = useState('Steel');
  const [archiveResults, setArchiveResults] = useState<NewsItem[]>([]);
  const [keyword, setKeyword] = useState('');
  const [tabValue, setTabValue] = useState(0);

  const handleSearch = async () => {
    console.log('Searching news: ');
    try {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      
      if (keyword.trim()) {
        // If keyword exists, search by type and keyword
        const response = await client.models.News.list({
          filter: {
//            type: { eq: newsType },
            title: { contains: keyword.trim() }
          }
        });
        setArchiveResults(response.data);
      } else {
        // If no keyword, search by type and date
        const response = await client.models.News.list({
          filter: {
            type: { eq: newsType },
            date: { eq: formattedDate }
          }
        });
        setArchiveResults(response.data);
      }
    } catch (error) {
      console.error('Error searching news:', error);
    }
  };

  const handleDateChange = (date: Date | null) => {
    console.log('handleDateChange:', date);
    if (date) {
      setSelectedDate(date);
      // Clear any existing keyword when date changes
      setKeyword('');
      // This breaks React.js useEffect Hook Rules. 
      // Trigger search immediately when date changes
//      setTimeout(() => handleSearch(), 0);
    }
  };

  // Update useEffect to run search on mount and when newsType changes
  useEffect(() => {
    console.log('useEffect: newsType changed');
    handleSearch();
  }, [newsType, selectedDate]); // Add newsType as dependency

  const handleNewsTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewsType(event.target.value);
  };

  const handleKeywordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(event.target.value);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    console.log('Tab changed to:', newValue, event);
    // Reset all states when changing tabs
    setSelectedDate(new Date());
    setKeyword('');
    setArchiveResults([]);
    setTabValue(newValue);
  };

  const createMarkup = (html: string) => {
    return {
      __html: DOMPurify.sanitize(html)
    };
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
              height: '63px'
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
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
        boxShadow: 1
      }}>
        <Paper sx={{ width: '100%', mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="archive tabs"
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              '& .MuiTab-root': { fontSize: '1rem' }
            }}
          >
            <Tab label="日付検索" />
            <Tab label="キーワード検索" />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              {/* Radio buttons */}
              <Grid size={6}>
                <Paper sx={{ 
                  p: 2, 
                  height: '100%',
                  minHeight: '100px'
                }}>
                  <FormControl component="fieldset" sx={{ width: '100%' }}>
                    <FormLabel component="legend" sx={{ mb: 2 }}>ニュースの種類</FormLabel>
                    <RadioGroup
                      aria-label="news-type"
                      name="news-type"
                      value={newsType}
                      onChange={handleNewsTypeChange}
                      sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-around',
                        '& .MuiFormControlLabel-root': {
                          margin: 0
                        }
                      }}
                    >
                      <FormControlLabel value="Steel" control={<Radio />} label="鉄鋼" />
                      <FormControlLabel value="Auto" control={<Radio />} label="自動車" />
                      <FormControlLabel value="Aluminum" control={<Radio />} label="アルミ" />
                    </RadioGroup>
                  </FormControl>
                </Paper>
              </Grid>

              {/* Date picker */}
              <Grid size={6}>
                <Paper sx={{ 
                  p: 2,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Typography variant="h6" gutterBottom sx={{ alignSelf: 'center' }}>
                    日付選択
                  </Typography>
                  <DatePicker
                    selected={selectedDate}
                    onChange={handleDateChange}
                    dateFormat="yyyy/MM/dd"
                    customInput={
                      <input
                        style={{
                          padding: '8px',
                          border: '1px solid #ccc',
                          borderRadius: '4px',
                          width: '200px', // Fixed width for better appearance
                          fontSize: '16px',
                          textAlign: 'center' // Center the date text
                        }}
                      />
                    }
                  />
                </Paper>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Grid container justifyContent="center">
              <Grid size={8}>
                <Paper sx={{ 
                  p: 2, 
                  height: '100%',
                  minHeight: '100px', // Changed from 200px to match first tab
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center', // Added for vertical centering
                  gap: 2
                }}>
                  <Typography variant="h6" gutterBottom>
                    キーワード入力
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      fullWidth
                      placeholder="キーワードを入力"
                      value={keyword}
                      onChange={handleKeywordChange}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: '#191970',
                          },
                          '&:hover fieldset': {
                            borderColor: '#1e1e90',
                          },
                        },
                      }}
                    />
                    <Button 
                      variant="contained"
                      onClick={handleSearch}
                      sx={{
                        backgroundColor: '#191970',
                        '&:hover': {
                          backgroundColor: '#1e1e90'
                        }
                      }}
                    >
                      検索
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </TabPanel>
        </Paper>

        {/* Results section remains unchanged */}
        <Grid size={12}>
          <Paper sx={{ 
            p: 2,
            mt: 3, // Add margin top for spacing between rows
            minHeight: '200px'
          }}>
            <Typography variant="h5" gutterBottom>
              詳細検索結果
            </Typography>
            {archiveResults.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {archiveResults.map((item) => (
                  <Accordion key={item.id}>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls={`panel-${item.id}-content`}
                      id={`panel-${item.id}-header`}
                    >
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            borderLeft: '4px solid #191970',
                            pl: 2,
                            py: 1
                          }}
                        >
                          {item.title}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                        >
                          {item.date} - {item.type}
                        </Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box 
                        component="div"
                        sx={{ 
                          px: 2,
                          py: 1,
                          backgroundColor: '#f5f5f5',
                          borderRadius: 1
                        }}
                        dangerouslySetInnerHTML={createMarkup(item.memo || 'メモは登録されていません。')}
                      />
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Box>
            ) : (
              <Typography color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
                該当する記事がありません
              </Typography>
            )}
          </Paper>
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
          onClick={() => navigate('/')}
          sx={{ 
            cursor: 'pointer',
            '&:hover': {
              textDecoration: 'underline',
              color: 'primary.main'
            }
          }}
        >
          ホームに戻る
        </Typography>
      </Box>
    </>
  );
};

export default Archive;
//        Line 352{new Date(item.date).toLocaleDateString()} - {item.type}
