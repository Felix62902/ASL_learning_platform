import AuthLayout from "../../layouts/AuthLayout";
import Form from "../../components/Form";

function Login() {
  return (
    <AuthLayout imagePosition="right">
      <Form route="/api/token/" method="Login" />
    </AuthLayout>
  );
}

export default Login;
