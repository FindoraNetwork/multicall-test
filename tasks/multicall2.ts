import { ethers } from "hardhat";
import Web3 from "web3";
import config from "../hardhat.config"
import fs from "fs"
import { OnEvent } from "../typechain-types/common"
import sleep from "sleep-promise"
import { task, types } from 'hardhat/config';
import type { HardhatRuntimeEnvironment, Libraries } from 'hardhat/types';
import { accessListify } from "ethers/lib/utils";


task('mc2', 'multicall test2')
  .addOptionalParam('contr', 'contract address', undefined, types.string)
  .addOptionalParam('count', 'call count', 20, types.int)
  .addOptionalParam('beg', 'begin block number', 0, types.int)
  .setAction(multicall2)


const abipath = "./abi/contracts/Multicall.sol/Multicall.json"
var url: string
var abi: string
if (fs.existsSync(abipath)) {
  abi = JSON.parse(fs.readFileSync(abipath).toString())
}
var web3: Web3

async function multicall2(
  args: { contr: string, count: number, beg: number },
  hre: HardhatRuntimeEnvironment
) {
  url = hre.userConfig.networks![hre.network.name].url!
  console.log("HTTP URL: ", url)

  web3 = new Web3(new Web3.providers.HttpProvider(url))

  var myContr = new web3.eth.Contract(abi, args.contr)
 
  try {
    var blkNum = await web3.eth.getBlockNumber() - 1 - args.beg

    // let calldata1 = {
    //   target: args.contr,
    //   callData: myContr.methods.getBlockHash(blkNum).encodeABI(),
    // }
    // let calldata2 = {
    //   target: args.contr,
    //   callData: myContr.methods.getLastBlockHash().encodeABI(),
    // }

    var accounts = []
    for (let i = 0; i < args.count; i++) {
      accounts[i] = web3.eth.accounts.create()
    }

    var calldatas = []
    for (let i = 0; i < args.count; i++) {
      calldatas[i] = {
        target:   args.contr,
        callData: myContr.methods.getEthBalance(accounts[i].address).encodeABI(),
      }
    }

    var t1 = new Date().getTime()
    for (let i = 0; i < args.count; i++) {
      var res = await myContr.methods.aggregate([calldatas[i]]).call({from: accounts[i].address});
    }
    var t2 = new Date().getTime()
    console.log(args.count, "times consume time1: ", t2 - t1)


    var t1 = new Date().getTime()
    var res = await myContr.methods.aggregate(calldatas).call({from: accounts[0].address});
    var t2 = new Date().getTime()
    console.log(args.count, "times consume time2: ", t2 - t1)

    console.log(res.blockNumber)
    console.log(res.returnData[0])
  } catch (err) {
    console.log("error: ", err)
  }
}


