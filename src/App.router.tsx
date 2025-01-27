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
import AdminCheck from './AdminCheck';

const AppRouter: React.FC = () => {
  return (
    <>
      <MenuComponent />
      <Box sx={{ mt: '64px' }}> {/* Add spacing below AppBar */}
        <Routes>
          <Route path="/" element={<Default />} />
          <Route path="/detail/:id" element={<Detail />} />
          <Route element={<AdminCheck />}>
            <Route path="/admin/send-email" element={<SendEmail />} />
            <Route path="/admin/charts" element={<Charts />} />
            <Route path="/admin/news-entry" element={<App />} />
            <Route path="/admin/news-search" element={<NewsSearch />} />
            <Route path="/admin/update-users" element={<UpdateUser />} />
            <Route path="/admin/create-user" element={<CreateUser />} />
          </Route>
        </Routes>
      </Box>
    </>
  );
};

export default AppRouter;
