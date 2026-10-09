import { Toaster, toast } from "react-hot-toast";

export const showToast = {
  success: (message) => {
    toast.success(message);
  },

  error: (message) => {
    toast.error(message);
  },

  loading: (message) => {
    return toast.loading(message);
  },

  dismiss: (toastId) => {
    toast.dismiss(toastId);
  },
};

const Toast = () => {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      toastOptions={{
        duration: 3000,
        style: {
          borderRadius: "12px",
          padding: "12px 16px",
          fontSize: "14px",
          fontWeight: "500",
        },
        success: {
          duration: 3000,
        },
        error: {
          duration: 4000,
        },
      }}
    />
  );
};

export default Toast;
