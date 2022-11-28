// Node modules
import React, { Component } from "react";

// Components
import Navbar from "../Navbar/Navigation";
import NavbarAdmin from "../Navbar/NavigationAdmin";
import NotInit from "../NotInit";

// CSS
import "./Registration.css";

// Contract
import getWeb3 from "../../getWeb3";
import Election from "../../contracts/Election.json";

export default class Registration extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ElectionInstance: undefined,
      web3: null,
      account: null,
      isAdmin: false,
      isElStarted: false,
      isElEnded: false,
      voterCount: undefined,
      voterName: "",
      voterPhone: "",
      voters: [],
      currentVoter: {
        address: undefined,
        name: null,
        phone: null,
        hasVoted: false,
        isVerified: false,
        isRegistered: false,
      },
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

      const admin = await this.state.ElectionInstance.methods.getAdmin().call();
      if (this.state.account === admin) {
        this.setState({ isAdmin: true });
      }

      const start = await this.state.ElectionInstance.methods.getStart().call();
      this.setState({ isElStarted: start });
      const end = await this.state.ElectionInstance.methods.getEnd().call();
      this.setState({ isElEnded: end });

      const voterCount = await this.state.ElectionInstance.methods
        .getTotalVoter()
        .call();
      this.setState({ voterCount: voterCount });

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

      // 加载当前投票者
      const voter = await this.state.ElectionInstance.methods
        .voterDetails(this.state.account)
        .call();
      this.setState({
        currentVoter: {
          address: voter.voterAddress,
          name: voter.name,
          phone: voter.phone,
          hasVoted: voter.hasVoted,
          isVerified: voter.isVerified,
          isRegistered: voter.isRegistered,
        },
      });
    } catch (error) {
      console.error(error);
      alert(
        `连接web3失败。`
      );
    }
  };
  updateVoterName = (event) => {
    this.setState({ voterName: event.target.value });
  };
  updateVoterPhone = (event) => {
    this.setState({ voterPhone: event.target.value });
  };
  registerAsVoter = async () => {
    await this.state.ElectionInstance.methods
      .registerAsVoter(this.state.voterName, this.state.voterPhone)
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
    return (
      <>
        {this.state.isAdmin ? <NavbarAdmin /> : <Navbar />}
        {!this.state.isElStarted && !this.state.isElEnded ? (
          <NotInit />
        ) : (
          <>

            <div className="container-item info">
              <p>注册总数: {this.state.voters.length}</p>
            </div>
            <div className="container-main">
              <h3>注册</h3>
              <div className="container-item">
                <form>
                  <div className="div-li">
                    <label className={"label-r"}>
                      地址
                      <input
                        className={"input-r"}
                        type="text"
                        value={this.state.account}
                        style={{ width: "400px" }}
                      />{" "}
                    </label>
                  </div>
                  <div className="div-li">

                    <label className={"label-r"}>
                      名称
                      <input
                        className={"input-r"}
                        type="text"
                        value={this.state.voterName}
                        onChange={this.updateVoterName}
                      />{" "}
                    </label>
                  </div>
                  <div className="div-li">
                    <label className={"label-r"}>
                      电话号码 <span style={{ color: "tomato" }}></span>
                      <input
                        className={"input-r"}
                        type="number"
                        value={this.state.voterPhone}
                        onChange={this.updateVoterPhone}
                      />
                    </label>
                  </div>
                  <p className="note">
                    <span style={{ color: "tomato" }}> </span>
                  </p>
                  <button
                    className="btn-add"
                    disabled={
                      (this.state.voterPhone.length != 11) ||
                      this.state.currentVoter.isVerified
                      //this.state.currentVoter.isRegistered
                    }
                    onClick={this.registerAsVoter}
                  >
                    {this.state.currentVoter.isRegistered
                      ? "更新"
                      : "注册"}
                  </button>
                </form>
              </div>
            </div>
            <div
              className="container-main"
              style={{
                borderTop: this.state.currentVoter.isRegistered
                  ? null
                  : "1px solid",
              }}
            >
              {loadCurrentVoter(
                this.state.currentVoter,
                this.state.currentVoter.isRegistered
              )}
            </div>
            {this.state.isAdmin ? (
              <div
                className="container-main"
                style={{ borderTop: "1px solid" }}
              >
                <small>总投票者数: {this.state.voters.length}</small>
                {loadAllVoters(this.state.voters)}
              </div>
            ) : null}
          </>
        )}
      </>
    );
  }
}
export function loadCurrentVoter(voter, isRegistered) {
  return (
    <>
      <div
        className={"container-item " + (isRegistered ? "success" : "attention")}
      >
        <center>注册信息</center>
      </div>
      <div
        className={"container-list " + (isRegistered ? "success" : "attention")}
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
      </div>
    </>
  );
}
export function loadAllVoters(voters) {
  const renderAllVoters = (voter) => {
    return (
      <>
        <div className="container-list success">
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
        </div>
      </>
    );
  };
  return (
    <>
      <div className="container-item success">
        <center>总投票者信息</center>
      </div>
      {voters.map(renderAllVoters)}
    </>
  );
}
