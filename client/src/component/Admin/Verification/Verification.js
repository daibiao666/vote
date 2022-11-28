import React, { Component } from "react";

import Navbar from "../../Navbar/Navigation";
import NavbarAdmin from "../../Navbar/NavigationAdmin";

import AdminOnly from "../../AdminOnly";

import getWeb3 from "../../../getWeb3";
import Election from "../../../contracts/Election.json";

import "./Verification.css";

export default class Registration extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ElectionInstance: undefined,
      account: null,
      web3: null,
      isAdmin: false,
      voterCount: undefined,
      voters: [],
    };
  }

  componentDidMount = async () => {
    if (!window.location.hash) {
      window.location = window.location + "#loaded";
      window.location.reload();
    }
    try {
      const web3 = await getWeb3();
      const accounts = await web3.eth.getAccounts();
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = Election.networks[networkId];
      const instance = new web3.eth.Contract(
        Election.abi,
        deployedNetwork && deployedNetwork.address
      );
      this.setState({ web3, ElectionInstance: instance, account: accounts[0] });
      const candidateCount = await this.state.ElectionInstance.methods
        .getTotalCandidate()
        .call();
      this.setState({ candidateCount: candidateCount });

      const admin = await this.state.ElectionInstance.methods.getAdmin().call();
      if (this.state.account === admin) {
        this.setState({ isAdmin: true });
      }

      const voterCount = await this.state.ElectionInstance.methods
        .getTotalVoter()
        .call();
      this.setState({ voterCount: voterCount });
      // 加载所有投票者
      for (let i = 0; i < this.state.voterCount; i++) {
        const voterAddress = await this.state.ElectionInstance.methods
          .voters(i)
          .call();
        const voter = await this.state.ElectionInstance.methods
          .voterDetails(voterAddress)
          .call();
        this.state.voters.push({
          address: voter.voterAddress,
          name: voter.name,
          phone: voter.phone,
          hasVoted: voter.hasVoted,
          isVerified: voter.isVerified,
          isRegistered: voter.isRegistered,
        });
      }
      this.setState({ voters: this.state.voters });
    } catch (error) {
      alert(
        `连接web3失败。`
      );
      console.error(error);
    }
  };
  renderUnverifiedVoters = (voter) => {
    const verifyVoter = async (verifiedStatus, address) => {
      await this.state.ElectionInstance.methods
        .verifyVoter(verifiedStatus, address)
        .send({ from: this.state.account, gas: 1000000 });
      window.location.reload();
    };
    return (
      <>
        {voter.isVerified ? (
          <div className="container-list success">
            <p style={{ margin: "7px 0px" }}>地址: {voter.address}</p>
            <table>
              <tr>
                <th>名称</th>
                <th>电话号码</th>
                <th>是否投票</th>
              </tr>
              <tr>
                <td>{voter.name}</td>
                <td>{voter.phone}</td>
                <td>{voter.hasVoted ? "是" : "否"}</td>
              </tr>
            </table>
          </div>
        ) : null}
        <div
          className="container-list attention"
          style={{ display: voter.isVerified ? "none" : null }}
        >
          <table>
            <tr>
              <th>地址</th>
              <td>{voter.address}</td>
            </tr>
            <tr>
              <th>名称</th>
              <td>{voter.name}</td>
            </tr>
            <tr>
              <th>电话号码</th>
              <td>{voter.phone}</td>
            </tr>
            <tr>
              <th>是否投票</th>
              <td>{voter.hasVoted ? "是" : "否"}</td>
            </tr>
            <tr>
              <th>是否通过注册</th>
              <td>{voter.isVerified ? "是" : "否"}</td>
            </tr>
            <tr>
              <th>是否注册</th>
              <td>{voter.isRegistered ? "是" : "否"}</td>
            </tr>
          </table>
          <div style={{}}>
            <button
              className="btn-verification approve"
              disabled={voter.isVerified}
              onClick={() => verifyVoter(true, voter.address)}
            >
              通过
            </button>
          </div>
        </div>
      </>
    );
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
        </>
      );
    }
    return (
      <>
        <NavbarAdmin />
        <div className="container-main">
          <h3>投票者</h3>
          <small>总投票者: {this.state.voters.length}</small>
          {this.state.voters.length < 1 ? (
            <div className="container-item info">还没有人注册</div>
          ) : (
            <>
              <div className="container-item info">
                <center>已注册的投票者</center>
              </div>
              {this.state.voters.map(this.renderUnverifiedVoters)}
            </>
          )}
        </div>
      </>
    );
  }
}
