import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import MenuComponent from './Menu';
import Default from './Default';
import Charts from './Charts';
import SendEmail from './sendEmail';
import App from './App';
import NewsSearch from './newsSearch';
import UpdateUser from './UpdateUser';
import CreateUser from './CreateUser';
import Detail from './Detail';

const AppRouter: React.FC = () => {
  return (
    <>
      <MenuComponent />
      <Box sx={{ mt: '64px' }}>
        <Routes>
          <Route path="/" element={<Default />} />
          <Route path="/detail/:id" element={<Detail />} />
          <Route path="/send-email" element={<SendEmail />} />
          <Route path="charts" element={<Charts />} />
          <Route path="/news-entry" element={<App />} />
          <Route path="/news-search" element={<NewsSearch />} />
          <Route path="/update-users" element={<UpdateUser />} />
          <Route path="/create-user" element={<CreateUser />} />
        </Routes>
      </Box>
    </>
  );
};

export default AppRouter;
