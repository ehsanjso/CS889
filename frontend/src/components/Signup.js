import React from "react";
import { Link } from "react-router-dom";
import SignupForm from "./SignupForm";
import Logo from "./Logo";
import loginSide from "../assets/images/james-pond-Z0uzZSM5i4M-unsplash.jpg";
import "../styles/components/login.scss";

export const Signup = () => (
  <div className="login">
    <div className="login-header">
      <Logo />
      <Link to="/login" className="button-transparent">
        Log In
      </Link>
    </div>

    <div className="login-card">
      <img src={loginSide} alt="login" />
      <div className="login-form-container">
        <h2>
          Get started <strong>CS</strong>889
        </h2>

        <SignupForm />
      </div>
    </div>
  </div>
);

export default Signup;
