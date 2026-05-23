import { Navigate } from "react-router-dom";

/** Legacy admin login — unified into /auth */
const AdminLoginPage = () => <Navigate to="/auth?next=/admin" replace />;
export default AdminLoginPage;
