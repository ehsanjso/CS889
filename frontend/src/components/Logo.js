import React from "react";
import { Link } from "react-router-dom";
import "../styles/components/logo.scss";

export const Logo = () => (
  <Link className="logo" to="/">
    <strong>CS</strong>889
  </Link>
);

export default Logo;
