import AuthLayout from "../../layouts/AuthLayout";
import Form from "../../components/Form";

function Register() {
  return (
    <AuthLayout imagePosition="left">
      <Form route="/api/user/register/" method="Register" />
    </AuthLayout>
  );
}

export default Register;
