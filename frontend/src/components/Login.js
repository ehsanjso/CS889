import React from "react";
import { Link } from "react-router-dom";
import LoginForm from "./LoginForm";
import Logo from "./Logo";
import loginSide from "../assets/images/james-pond-Z0uzZSM5i4M-unsplash.jpg";
import "../styles/components/login.scss";

export const Login = () => (
  <div className="login">
    <div className="login-header">
      <Logo />
      <Link to="/signup" className="button-transparent">
        Sign Up
      </Link>
    </div>

    <div className="login-card">
      <img src={loginSide} alt="login" />
      <div className="login-form-container">
        <h2>
          Sign in to <strong>CS</strong>889
        </h2>

        <LoginForm />
      </div>
    </div>
  </div>
);

export default Login;
