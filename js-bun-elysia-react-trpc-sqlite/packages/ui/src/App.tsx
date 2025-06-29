import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./routes/HomePage";
import UsersPage from "./routes/UsersPage";

export const App = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/users" element={<UsersPage />} />
      </Routes>
    </Layout>
  );
};

export default App;
