import React from "react";
import Login from "./Login";
import Otp from "./Otp";
import RegisterForm from "./RegisterForm";

const CombinedLogin = () => {
  return (
    <div>
      <h2>Combined Login Components</h2>
      <div style={{ marginBottom: 32 }}>
        <Login />
      </div>
      <div style={{ marginBottom: 32 }}>
        <Otp />
      </div>
      <div>
        <RegisterForm />
      </div>
    </div>
  );
};

export default CombinedLogin; 