import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Box, Paper, Button, createTheme } from '@mui/material';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import DOMPurify from 'dompurify';
import './ResponsiveTable.css';
import './TableStyles.css';

const client = generateClient<Schema>();
const logoUrl = 'https://metal-news-image.s3.us-east-1.amazonaws.com/imgMetalNewsLogoN3.gif';

interface NewsDetail {
  id: string;
  title: string;
  date: string;
  type: 'Steel' | 'Auto' | 'Aluminum';
  published: boolean;
  writtenBy: string;
  source: string;
  memo: string;
  header: string;
}

interface NewsItem {
  id: string;
  title: string;
  date: string;
}

const Detail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [news, setNews] = useState<NewsDetail | null>(null);
  const [hasHistory, setHasHistory] = useState(false);
  const [sameDataArticles, setSameDataArticles] = useState<NewsItem[]>([]);
  const [sameSourceArticles, setSameSourceArticles] = useState<NewsItem[]>([]);

  const theme = createTheme();
  theme.typography.h3 = {
    fontSize: '1.2rem',
    '@media (min-width:600px)': {
      fontSize: '1.5rem',
    },
    [theme.breakpoints.up('md')]: {
      fontSize: '2.4rem',
    },
  };
  
  useEffect(() => {
    setHasHistory(window.history.length > 1);

    const fetchNewsDetail = async () => {
      if (!id) return;
      
      try {
        const response = await client.models.News.get({ id });
        if (response.data) {
          const newsItem = {
            id: response.data.id,
            title: response.data.title ?? '',
            date: response.data.date ?? '',
            type: response.data.type ?? 'Steel',
            published: response.data.published ?? false,
            writtenBy: response.data.writtenBy ?? '',
            source: response.data.source ?? '',
            memo: response.data.memo ?? '',
            header: response.data.header ?? ''
          };
          
          setNews(newsItem);
          // After fetching the article, fetch all articles from the same date
          if (newsItem.date) {
            try {
              // Query for articles with the same date
              const sameDate = await client.models.News.list({
                filter: {
                  date: {
                    eq: newsItem.date
                  }
                }
              });

              if (sameDate.data) {
                // Filter out the current article
                const otherArticles = sameDate.data
                  .filter(article => article.id !== newsItem.id)
                  .map(article => ({
                    id: article.id,
                    title: article.title || '',
                    date: article.date || ''
                  }));
                
                setSameDataArticles(otherArticles);
              }
            } catch (error) {
              console.error('Error fetching articles from same date:', error);
            }
          }
          
          // Add query for articles with the same source
          if (newsItem.source && newsItem.source.trim() !== '') {
            try {
              const sameSource = await client.models.News.list({
                filter: {
                  source: {
                    eq: newsItem.source
                  }
                },
                limit: 10 // Limit to 10 articles to avoid performance issues
              });

              if (sameSource.data) {
                // Filter out the current article
                const sourceArticles = sameSource.data
                  .filter(article => article.id !== newsItem.id)
                  .map(article => ({
                    id: article.id,
                    title: article.title || '',
                    date: article.date || ''
                  }));
                
                setSameSourceArticles(sourceArticles);
              }
            } catch (error) {
              console.error('Error fetching articles from same source:', error);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching news detail:', error);
      }
    };

    fetchNewsDetail();
  }, [id]);

  // Assists with the display of the article content
  const createMarkup = (html: string) => {
    // Parse the HTML string
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Count columns from the first row
    const firstRow = doc.querySelector('tr');
    const columnCount = firstRow ? firstRow.children.length : 0;
    
    // Add data attribute to table
    const table = doc.querySelector('table');
    if (table) {
      table.dataset.columns = columnCount.toString();
    }
    
    // Find all table cells
    const cells = doc.getElementsByTagName('td');
    Array.from(cells).forEach(cell => {
      if (/^\d+\.?\d*$/.test((cell.textContent || '').trim())) {
        cell.classList.add('numeric');
      }
    });
    
    const modifiedHtml = doc.body.innerHTML
      .replace('<table', '<div class="table-wrapper"><table class="responsive-table"') + '</div>';
    
    return {
      __html: DOMPurify.sanitize(modifiedHtml)
    };
  };
  
  return (
    <Authenticator>
      {({ user }) => {
        if (!user) return <Typography>Please sign in...</Typography>;
        
        if (!news) {
          return <Typography>Loading...</Typography>;
        }

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
              <div style={{ width: '850px', margin: '0 auto' }}>
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
              p: 3, 
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              gap: 2,
              width: '95%',
              maxWidth: '1200px',
              margin: '80px auto 20px'
            }}>
              <Box sx={{ flex: '1 1 65%' }}>
                <Paper elevation={3} sx={{ p: 4 }}>
                  {hasHistory && (
                    <Button 
                      variant="outlined" 
                      onClick={() => navigate(-1)} 
                      sx={{ mb: 2 }}
                    >
                      Back
                    </Button>
                  )}
                  <Typography variant="h3" gutterBottom>
                    {news.title}
                  </Typography>
                  <Box sx={{ 
                    mt: 3,
                    width: '100%',  // Set width to 75% of parent container
                    margin: '0 auto' // Center the box horizontally
                  }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        mb: 1, 
                        width: '100%' // Make Typography take full width of parent Box
                      }}
                    >
                        <div 
                          className="custom-content"
                          dangerouslySetInnerHTML={createMarkup(news.memo)} 
                        /> 
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    <strong>日付: </strong>{new Date(news.date).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <strong>カテゴリー:</strong> {news.type}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <strong>著者:</strong> {news.writtenBy}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <strong>ソース:</strong> {news.source}
                    </Typography>
                  </Box>
                  {/* Display other articles from the same date */}
                  {sameDataArticles.length > 0 && (
                    <Box sx={{ mt: 4 }}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          textAlign: 'center',
                          backgroundColor: '#191970',
                          color: 'white',
                          padding: '8px',
                          borderRadius: '4px',
                          marginBottom: '16px'
                        }}
                      >
                        同日の記事
                      </Typography>
                      
                      {sameDataArticles.map((article, index) => (
                        <Box 
                          key={article.id}
                          sx={{ 
                            p: 1,
                            mb: 1,
                            backgroundColor: index % 2 === 0 ? '#f5f5f5' : '#ffffff',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                          onClick={() => navigate(`/detail/${article.id}`)}
                        >
                          <Typography 
                            sx={{ 
                              color: '#0000EE',
                              textDecoration: 'underline',
                              '&:hover': {
                                color: '#551A8B'
                              }
                            }}
                          >
                            {article.title}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Paper>
              </Box>
              {sameSourceArticles.length > 0 && (
                <Box sx={{ 
                  flex: '1 1 35%', 
                  display: { xs: 'block', md: 'block' }
                }}>
                  <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
                    <Typography variant="h6" sx={{ 
                      textAlign: 'center',
                      backgroundColor: '#191970',
                      color: 'white',
                      padding: '8px',
                      borderRadius: '4px',
                      marginBottom: '16px'
                    }}>  
                    関連ニュース
                    </Typography>
                    
                    {sameSourceArticles.map((article, index) => (
                      <Box 
                        key={article.id}
                        sx={{ 
                          p: 1,
                          mb: 1,
                          backgroundColor: index % 2 === 0 ? '#f5f5f5' : '#ffffff',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                        onClick={() => navigate(`/detail/${article.id}`)}
                      >
                        <Typography sx={{ 
                          color: '#0000EE',
                          textDecoration: 'underline',
                          '&:hover': {
                            color: '#551A8B'
                          }
                        }}>
                          {article.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(article.date).toLocaleDateString()}
                        </Typography>
                      </Box>
                    ))}
                  </Paper>
                </Box>
              )}
            </Box>
          </>
        );
      }}
    </Authenticator>
  );
};

export default Detail;