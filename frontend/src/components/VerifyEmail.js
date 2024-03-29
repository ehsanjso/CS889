import React from "react";
import { connect } from "react-redux";
import { startLogout } from "../actions/auth";
import mail from "../assets/images/mail.svg";
import Loading from "./Loading";
import "../styles/components/verify-email.scss";

class VerifyEmail extends React.Component {
  render() {
    const verificationState = () => {
      return this.props.fetchInProgress === true ? (
        <Loading />
      ) : (
        <div className="verify-container">
          <div className="verify-card">
            <div className="verif-header">
              <div className="verif-info">
                <h2>
                  Your account <strong>{this.props.userEmail}</strong> is not
                  verified yet!
                </h2>
              </div>
              <img src={mail} className="ic-state" alt="done" />
            </div>
          </div>
        </div>
      );
    };
    return <>{verificationState()}</>;
  }
}

const mapStateToProps = (state) => ({
  fetchInProgress: state.fetchInProgress,
  userEmail: state.auth.email,
});

const mapDispatchToProps = (dispatch) => ({
  startLogout: () => dispatch(startLogout()),
});

export default connect(mapStateToProps, mapDispatchToProps)(VerifyEmail);
