// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {LawyerRegistry} from "../src/LawyerRegistry.sol";
import {StorageIndex} from "../src/StorageIndex.sol";

contract Deploy is Script {
    function run() external {
        // The deployer wallet is also the operator (server wallet)
        vm.startBroadcast();

        address deployer = msg.sender;

        StorageIndex storageIndex = new StorageIndex(deployer);
        LawyerRegistry registry = new LawyerRegistry(deployer);

        vm.stopBroadcast();

        console.log("=== StorageIndex deployed ===");
        console.log("Address     :", address(storageIndex));
        console.log("Owner       :", storageIndex.owner());
        console.log("Operator    :", storageIndex.operator());
        console.log("");
        console.log("=== LawyerRegistry deployed ===");
        console.log("Address     :", address(registry));
        console.log("Owner       :", registry.owner());
        console.log("Operator    :", registry.operator());
        console.log("Chain ID    : 16602 (0G Galileo Testnet)");
        console.log("");
        console.log("Add to .env.local:");
        console.log("NEXT_PUBLIC_STORAGE_INDEX_ADDRESS=", address(storageIndex));
        console.log("NEXT_PUBLIC_LAWYER_REGISTRY_ADDRESS=", address(registry));
    }
}
