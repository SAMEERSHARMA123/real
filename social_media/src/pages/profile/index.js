import React, { useEffect } from 'react';
import Main from '../../components/profile/Main';
import Navbar from '../../components/navbar/Navbar';
import Sidebar from '../../components/sidebar/Sidebar';
import FooterNav from '../../components/footer/FooterNav';
import { useNavigate, useParams } from 'react-router-dom';

const ProfilePage = () => {
  const token = sessionStorage.getItem('user');
  const navigate = useNavigate();
  const { userId } = useParams();

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [navigate, token]);

  return (
    <div className="w-full relative">
      <Navbar />
      <div className="flex pt-16">
        <Sidebar />
        <div className="flex-1 md:ml-64 relative">
          <div className="max-w-4xl mx-auto px-4">
            {/* Footer */}
            <div className="mb-4">
              <FooterNav />
            </div>
            <div className="flex justify-center">
              <Main userId={userId}/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 