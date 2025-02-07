import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Box, Paper, Button } from '@mui/material';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

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

const Detail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [news, setNews] = useState<NewsDetail | null>(null);
  const [hasHistory, setHasHistory] = useState(false);

  useEffect(() => {
    setHasHistory(window.history.length > 1);

    const fetchNewsDetail = async () => {
      if (!id) return;
      
      try {
        const response = await client.models.News.get({ id });
        if (response.data) {
          setNews({
            id: response.data.id,
            title: response.data.title ?? '',
            date: response.data.date ?? '',
            type: response.data.type ?? 'Steel',
            published: response.data.published ?? false,
            writtenBy: response.data.writtenBy ?? '',
            source: response.data.source ?? '',
            memo: response.data.memo ?? '',
            header: response.data.header ?? ''
          });
        }
      } catch (error) {
        console.error('Error fetching news detail:', error);
      }
    };

    fetchNewsDetail();
  }, [id]);

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
              <div style={{ width: '950px', margin: '0 auto' }}>
                <img 
                  src={logoUrl} 
                  alt="Metal News Logo" 
                  style={{ 
                    display: 'block',
                    backgroundColor: 'white',
                    height: '65px'
                  }} 
                />
              </div>
            </div>

            <Box sx={{ p: 3, maxWidth: '800px', margin: '20px auto' }}>
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

                <Typography variant="h4" gutterBottom>
                  {news.title}
                </Typography>

                <Box sx={{ mt: 3 }}>
                  <Typography variant="body1" sx={{ mb: 3, fontWeight: 'bold', fontSize: '1.5rem' }}>
                    <Box 
                      dangerouslySetInnerHTML={{ __html: news.memo }}
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
                </Box>
              </Paper>
            </Box>
          </>
        );
      }}
    </Authenticator>
  );
};

export default Detail;