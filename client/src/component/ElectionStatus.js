import React from "react";

const ElectionStatus = (props) => {
  const electionStatus = {
    padding: "11px",
    margin: "7px",
    width: "100%",
    border: "1px solid tomato",
    marginLeft: "auto",
    marginRight: "auto",
    textAlign: "center",
    borderRadius: "0.5em",
    overflow: "auto",
    alignItems: "center",
    justifyContent: "space-around",
    display: "flex",
  };
  return (
    <div
      className="container-main"
      style={{ borderTop: "1px solid", marginTop: "0px" }}
    >
      <h3>投票状态</h3>
      <div style={electionStatus}>
        <p>开始: {props.elStarted ? "是" : "否"}</p>
        <p>结束: {props.elEnded ? "是" : "否"}</p>
      </div>
      <div className="container-item" />
    </div>
  );
};

export default ElectionStatus;
