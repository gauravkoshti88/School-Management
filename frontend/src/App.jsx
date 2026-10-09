import React from "react";
import { RouterProvider } from "react-router-dom";

import { router } from "./router";
import Toast from "./components/Toast";

const App = () => {
  return (
    <>
      <RouterProvider router={router} />
      <Toast />
    </>
  );
};

export default App;
