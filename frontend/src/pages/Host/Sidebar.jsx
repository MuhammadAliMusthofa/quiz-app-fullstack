import React, { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography, Button, IconButton, Modal } from '@mui/material';
import { styled } from '@mui/system';
import DeleteIcon from '@mui/icons-material/Delete';
import PrintIcon from '@mui/icons-material/Print';
import DownloadIcon from '@mui/icons-material/Download';
import EmailIcon from '@mui/icons-material/Email';
import ShareIcon from '@mui/icons-material/Share';

// Styled component for the paper container
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: 'center',
  color: '#dc004e',
  borderRadius: '8px',
}));

const GO = "/public/assets/GO.gif";

const DashboardCard = ({ title, value, icon }) => {
  return (
    <StyledPaper>
      <Box display="flex" alignItems="center" justifyContent="around">
        <div className='p-3 bg-secondary text-light rounded'>
          {icon}
        </div>
        <Box ml={5}>
          <Typography variant="h6">{title}</Typography>
          <Typography variant="h4">{value}</Typography>
        </Box>
      </Box>
    </StyledPaper>
  );
};

const Dashboard = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setLoading(false);
    }, 4000); // 2 seconds loading time

    return () => clearTimeout(timer);
  }, []);

  return (
    <Box className="p-5">
      <div className='ps-5 pb-3'>
        <h4>Tebak Gambar</h4>
      </div>
      <Grid container spacing={3} className='border p-5 rounded'>
        <Grid item xs={12} md={6} lg={3}>
          <DashboardCard title="Pertanyaan" value="5" icon={<PrintIcon />} />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <DashboardCard title="Partisipan" value="5" icon={<ShareIcon />} />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <DashboardCard title="Status" value="Finish" icon={<PrintIcon />} />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <DashboardCard title="Game Code" value="5432" icon={<PrintIcon />} />
        </Grid>
      </Grid>
      <Box mt={3} display="flex" justifyContent="space-between" className="p-3">
        <Box>
          <IconButton><DeleteIcon /></IconButton>
          <IconButton><PrintIcon /></IconButton>
          <IconButton><DownloadIcon /></IconButton>
          <IconButton><EmailIcon /></IconButton>
          <IconButton><ShareIcon /></IconButton>
        </Box>
      </Box>
      
      <Modal
        open={loading}
        onClose={() => setLoading(false)}
        aria-labelledby="loading-modal"
        aria-describedby="loading-modal-description"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Box sx={{background:'none', border:'none'}}>
          <img src={GO} alt="Loading" style={{width:'500px', border:'none'}} />
        </Box>
      </Modal>
    </Box>
  );
};

export default Dashboard;
