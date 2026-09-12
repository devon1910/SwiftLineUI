import { Slide, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Flip } from 'react-toastify';


const CustomToast = () => {
  return (
    <ToastContainer
      position="bottom-center"
      autoClose={5000}
      hideProgressBar={true}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      transition={Slide} // Using Flip instead of Bounce for a more modern feel
      theme="dark"
      toastClassName="rounded-md shadow-lg"
      // Custom CSS for the toast container
      className="toast-container"
    />
  );
};

export default CustomToast
