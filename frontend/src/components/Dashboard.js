import React from "react";
import Writing from "./Writing";
import Prompts from "./Prompts";
import "../styles/components/dashboard.scss";

export const Dashboard = () => (
  <div className="dashboard">
    <Writing />
    {/* <Prompts /> */}
  </div>
);

export default Dashboard;
