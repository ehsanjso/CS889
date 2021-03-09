import React from "react";
import { Row, Col } from "antd";
import User from "./User";
import Logo from "./Logo";
import "../styles/components/header.scss";

const Header = () => {
  return (
    <div className="header-wrapper">
      <Row className="header">
        <Col
          xxl={8}
          xl={8}
          lg={8}
          md={8}
          sm={8}
          xs={8}
          className="header--left"
        >
          <Logo />
        </Col>
        <Col
          xxl={8}
          xl={8}
          lg={8}
          md={8}
          sm={8}
          xs={8}
          className="header--mid"
        ></Col>
        <Col
          xxl={8}
          xl={8}
          lg={8}
          md={8}
          sm={8}
          xs={8}
          className="header--right"
        >
          <User />
        </Col>
      </Row>
    </div>
  );
};

export default Header;
