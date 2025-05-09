import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import Default from './Default';
import Charts from './Charts';
import SendEmail from './sendEmail';
import App from './App';
import NewsSearch from './newsSearch';
import UpdateUser from './UpdateUser';
import CreateUser from './CreateUser';
import Detail from './Detail';
import PrivacyPolicy from './PrivacyPolicy';
import Archive from './Archive';
import ChangePassword from './ChangePassword';

const AppRouter: React.FC = () => {
  return (
    <>
      <Box sx={{ mt: '64px' }}>
        <Routes>
          <Route path="/" element={<Default />} />
          <Route path="/detail/:id" element={<Detail />} />
          <Route path="/send-email" element={<SendEmail />} />
          <Route path="charts" element={<Charts />} />
          <Route path="/admin" element={<App />} />
          <Route path="/news-entry" element={<App />} />
          <Route path="/news-search" element={<NewsSearch />} />
          <Route path="/update-users" element={<UpdateUser />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/create-user" element={<CreateUser />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/archive" element={<Archive />} />
        </Routes>
      </Box>
    </>
  );
};

export default AppRouter;