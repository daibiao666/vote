import React, { Component } from "react";

import Navbar from "../../Navbar/Navigation";
import NavbarAdmin from "../../Navbar/NavigationAdmin";

import AdminOnly from "../../AdminOnly";

import getWeb3 from "../../../getWeb3";
import Election from "../../../contracts/Election.json";

import "./StartEnd.css";

export default class StartEnd extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ElectionInstance: undefined,
      web3: null,
      accounts: null,
      isAdmin: false,
      elStarted: false,
      elEnded: false,
      isCanAdded: false,
      candidateCount: undefined,
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
      this.setState({
        web3: web3,
        ElectionInstance: instance,
        account: accounts[0],
      });
      const candidateCount = await this.state.ElectionInstance.methods
        .getTotalCandidate()
        .call();
      this.setState({ candidateCount: candidateCount });
      const admin = await this.state.ElectionInstance.methods.getAdmin().call();
      if (this.state.account === admin) {
        this.setState({ isAdmin: true });
      }

      const start = await this.state.ElectionInstance.methods.getStart().call();
      this.setState({ elStarted: start });
      const end = await this.state.ElectionInstance.methods.getEnd().call();
      this.setState({ elEnded: end });
      
    } catch (error) {
      alert(
        `连接web3失败。`
      );
      console.error(error);
    }
  };

  startElection = async () => {
    await this.state.ElectionInstance.methods
      .startElection()
      .send({ from: this.state.account, gas: 1000000 });
    window.location.reload();
  };
  endElection = async () => {
    await this.state.ElectionInstance.methods
      .endElection()
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
        </>
      );
    }
    return (
      <>
        <NavbarAdmin />
        {!this.state.elStarted & !this.state.elEnded ? (
          <div className="container-item info">
            <center>投票还未开始</center>
          </div>
        ) : null}
        <div className="container-main">
          <h3>开始或结束投票</h3>
          {!this.state.elStarted ? (
            <>
              <div className="container-item">
                <button 
                  className="start-btn"
                  onClick={this.startElection} 
                >
                  开始 {this.state.elEnded ? "Again" : null}
                </button>
              </div>
              {this.state.elEnded ? (
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
                <button onClick={this.endElection} className="start-btn">
                  结束
                </button>
              </div>
            </>
          )}
          <div className="election-status">
            <p>开始: {this.state.elStarted ? "是" : "否"}</p>
            <p>结束: {this.state.elEnded ? "是" : "否"}</p>
          </div>
        </div>
      </>
    );
  }
}
