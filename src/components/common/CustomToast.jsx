import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Flip } from 'react-toastify';


const CustomToast = () => {
  const savedTheme = localStorage.getItem("darkMode");
  
  return (
    <ToastContainer
      position="top-right"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      transition={Flip} // Using Flip instead of Bounce for a more modern feel
      theme={savedTheme === "true" ? 'dark' : 'light'}
      toastClassName="rounded-md shadow-lg"
      // Custom CSS for the toast container
      className="toast-container"
    />
  );
};

export default CustomToast