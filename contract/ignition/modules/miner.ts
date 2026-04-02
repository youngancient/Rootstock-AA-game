// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const MinerModule = buildModule("MinerModule", (m) => {
  const miner = m.contract("Miner");

  return { miner };
});

export default MinerModule;
