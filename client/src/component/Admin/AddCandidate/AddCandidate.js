import React, { Component } from "react";

import Navbar from "../../Navbar/Navigation";
import NavbarAdmin from "../../Navbar/NavigationAdmin";

import getWeb3 from "../../../getWeb3";
import Election from "../../../contracts/Election.json";

import AdminOnly from "../../AdminOnly";

import "./AddCandidate.css";

export default class AddCandidate extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ElectionInstance: undefined,
      web3: null,
      accounts: null,
      isAdmin: false,
      isElStarted: false, //判断投票是否开始
      header: "",
      slogan: "",
      candidates: [],
      candidateCount: undefined,
    };
  }

  componentDidMount = async () => {
    //只能刷新一次页面
    if (!window.location.hash) {
      window.location = window.location + "#loaded";
      window.location.reload();
    }

    try {
      //获取web3
      const web3 = await getWeb3();

      // 使用web3获取用户帐号
      const accounts = await web3.eth.getAccounts();

      // 获取合约实例
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = Election.networks[networkId];
      const instance = new web3.eth.Contract(
        Election.abi,
        deployedNetwork && deployedNetwork.address
      );
      this.setState({
        web3: web3,
        ElectionInstance: instance,
        account: accounts[0],
      });

      // 获取投票开始结束的值
      const start = await this.state.ElectionInstance.methods.getStart().call();
      this.setState({ isElStarted: start });

      // 获取候选人总数
      const candidateCount = await this.state.ElectionInstance.methods
        .getTotalCandidate()
        .call();
      this.setState({ candidateCount: candidateCount });

      const admin = await this.state.ElectionInstance.methods.getAdmin().call();
      if (this.state.account === admin) {
        this.setState({ isAdmin: true });
      }

      //加载候选人详细信息
      for (let i = 0; i < this.state.candidateCount; i++) {
        const candidate = await this.state.ElectionInstance.methods
          .candidateDetails(i)
          .call();
        this.state.candidates.push({
          id: candidate.candidateId,
          header: candidate.header,
          slogan: candidate.slogan,
        });
      }

      this.setState({ candidates: this.state.candidates });
    } catch (error) {
      // 捕获异常
      console.error(error);
      alert(
        `连接web3失败。`
      );
    }
  };
  updateHeader = (event) => {
    this.setState({ header: event.target.value });
  };
  updateSlogan = (event) => {
    this.setState({ slogan: event.target.value });
  };

  addCandidate = async () => {
    await this.state.ElectionInstance.methods
      .addCandidate(this.state.header, this.state.slogan)
      .send({ from: this.state.account, gas: 1000000 });
    window.location.reload();
  };

  render() {
    if (!this.state.web3) {
      return (
        <>
          {this.state.isAdmin ? <NavbarAdmin /> : <Navbar />}
          <center>连接web3中，请等待。</center>
        </>
      );
    }
    if (!this.state.isAdmin) {
      return (
        <>
          <Navbar />
          <AdminOnly page="添加候选人页面" />
        </>
      );
    }
    return (
      <>

        <NavbarAdmin />
        <div className="container-main">
          <h2>添加一个新的候选人</h2>
          <small>总人数: {this.state.candidateCount}</small>
          <div className="container-item">
            <form className="form">
              <label className={"label-ac"}>
                候选人姓名
                <input
                  className={"input-ac"}
                  type="text"

                  value={this.state.header}
                onChange={this.updateHeader}
                />
              </label>
              <label className={"label-ac"}>
                介绍
                <input
                  className={"input-ac"}
                  type="text"

                  value={this.state.slogan}
                  onChange={this.updateSlogan}
                />
              </label>
              <button
                className="btn-add"
                disabled={
                  (this.state.header.length < 1 || this.state.header.length > 30) || this.state.isElStarted
                }
                onClick={this.addCandidate}
              >
                添加
              </button>
            </form>
          </div>
        </div>
        {loadAdded(this.state.candidates)}
      </>
    );
  }
}
export function loadAdded(candidates) {
  const renderAdded = (candidate) => {
    return (
      <>
        <div className="container-list success">
          <div
            style={{
              maxHeight: "21px",
              overflow: "auto",
            }}
          >
            {candidate.id}. <strong>{candidate.header}</strong>:{" "}
            {candidate.slogan}
          </div>
        </div>
      </>
    );
  };
  return (
    <div className="container-main" style={{ borderTop: "1px solid" }}>
      <div className="container-item info">
        <center>候选人列表</center>
      </div>
      {candidates.length < 1 ? (
        <div className="container-item alert">
          <center>暂无候选人</center>
        </div>
      ) : (
        <div
          className="container-item"
          style={{
            display: "block",
            backgroundColor: "#FEFEFE",
          }}
        >
          {candidates.map(renderAdded)}
        </div>
      )}
    </div>
  );
}
