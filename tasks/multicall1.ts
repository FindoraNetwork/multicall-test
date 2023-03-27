
import config from "../hardhat.config"
import fs from "fs"
import { OnEvent } from "../typechain-types/common"
import sleep from "sleep-promise"
import { task, types } from 'hardhat/config';
import type { HardhatRuntimeEnvironment, Libraries } from 'hardhat/types';
import { ethers } from "ethers";

task('mc1', 'multicall test1')
  .addOptionalParam('contr', 'contract address', undefined, types.string)
  .addOptionalParam('count', 'call count', 20, types.int)
  .addOptionalParam('beg', 'begin block number', 0, types.int)
  .setAction(multicall1)


const abipath = "./abi/contracts/Multicall.sol/Multicall.json"
var url: string
var abi: string
if (fs.existsSync(abipath)) {
  abi = JSON.parse(fs.readFileSync(abipath).toString())
}


async function multicall1(
  args: { contr: string, count: number, beg: number },
  hre: HardhatRuntimeEnvironment
) {   
  url = hre.userConfig.networks![hre.network.name].url!
  console.log("HTTP URL: ", url)

  const provider = new ethers.providers.JsonRpcProvider(url)
  const myContr = new ethers.Contract(args.contr, abi, provider)

  try {
    var blkNum = await provider.getBlockNumber() - 1 - args.beg
    
    // let calldata1 = {
    //   target:   myContr.address,
    //   callData: myContr.interface.encodeFunctionData('getEthBalance(address)', [blkNum]),
    // }
    // let calldata2 = {
    //   target:   myContr.address,
    //   callData: myContr.interface.encodeFunctionData('getLastBlockHash()'),
    // }

    var wallets = []
    for (let i = 0; i < args.count; i++) {
      var prikey = ethers.utils.hexlify(ethers.utils.randomBytes(32))
      wallets[i] = new ethers.Wallet(prikey)
    }

    var calldatas = []
    for (let i = 0; i < args.count; i++) {
      calldatas[i] = {
        target:   myContr.address,
        callData: myContr.interface.encodeFunctionData('getEthBalance(address)', [wallets[i].address]),
      }
    }

    var t1 = new Date().getTime()
    for (let i = 0; i < args.count; i++) {
      var res = await myContr.callStatic["aggregate"]([calldatas[i]], { from: wallets[i].address,  blockTag: blkNum + 1 })
    }
    var t2 = new Date().getTime()
    console.log(args.count, " times consume time1: ", t2 - t1)


    var t1 = new Date().getTime()
    var res = await myContr.callStatic["aggregate"](calldatas, { from: wallets[0].address,  blockTag: blkNum + 1 })
    var t2 = new Date().getTime()
    console.log(args.count, " times consume time2: ", t2 - t1)

    console.log(res.blockNumber)
    console.log(res.returnData[0])

  } catch (err) {
    console.log("error: ", err)
  }
}



