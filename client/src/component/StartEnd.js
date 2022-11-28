import React from "react";
import { Link } from "react-router-dom";

const StartEnd = (props) => {
  const btn = {
    display: "block",
    padding: "21px",
    margin: "7px",
    minWidth: "max-content",
    textAlign: "center",
    width: "333px",
    alignSelf: "center",
  };
  return (
    <div
      className="container-main"
      style={{ borderTop: "1px solid", marginTop: "0px" }}
    >
      {!props.elStarted ? (
        <>

          {!props.elEnded ? (
            <>
              <div
                className="container-item attention"
                style={{ display: "block" }}
              >
                <h2>别忘了添加一个新的候选人</h2>
                <p>
                  去{" "}
                  <Link
                    title="Add a new "
                    to="/addCandidate"
                    style={{
                      color: "black",
                      textDecoration: "underline",
                    }}
                  >
                    添加新的候选人
                  </Link>{" "}
                  页面
                </p>
              </div>
              <div className="container-item">
                <button type="submit" style={btn}
                  disabled={
                    props.canAdded==true
                  }
                >
                  开始投票 {props.elEnded ? "Again" : null}
                </button>
              </div>
            </>
          ) : (
            <div className="container-item">
              <center>
                <p>重新部署合约来创造一个新的投票</p>
              </center>
            </div>
          )}
          {props.elEnded ? (
            <div className="container-item">
              <center>
                <p>投票已经结束</p>
              </center>
            </div>
          ) : null}
        </>
      ) : (
        <>
          <div className="container-item">
            <center>
              <p>投票已经开始</p>
            </center>
          </div>
          <div className="container-item">
            <button
              type="button"
              onClick={props.endElFn}
              style={btn}
            >
              结束投票
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default StartEnd;
