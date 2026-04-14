// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {LawyerRegistry} from "../src/LawyerRegistry.sol";
import {StorageIndex} from "../src/StorageIndex.sol";

/**
 * Deploy both ZeroViza contracts to 0G Aristotle MAINNET.
 *
 * Usage:
 *   export OG_SERVER_PRIVATE_KEY=0x...
 *   forge script script/DeployMainnet.s.sol \
 *     --rpc-url https://evmrpc.0g.ai \
 *     --broadcast \
 *     --legacy --gas-price 3000000000 \
 *     --private-key $OG_SERVER_PRIVATE_KEY
 *
 * After deploy:
 *   1. Copy the printed addresses into .env.local and Vercel env vars
 *   2. Verify on https://chainscan.0g.ai
 *   3. Update docs/hackathon/ARCHITECTURE.md with the new addresses
 */
contract DeployMainnet is Script {
    function run() external {
        vm.startBroadcast();

        address deployer = msg.sender;

        StorageIndex storageIndex = new StorageIndex(deployer);
        LawyerRegistry registry = new LawyerRegistry(deployer);

        vm.stopBroadcast();

        console.log("");
        console.log("========================================================");
        console.log(" ZeroViza contracts deployed to 0G Aristotle MAINNET");
        console.log("========================================================");
        console.log("");
        console.log("StorageIndex      :", address(storageIndex));
        console.log("  Owner           :", storageIndex.owner());
        console.log("  Operator        :", storageIndex.operator());
        console.log("");
        console.log("LawyerRegistry    :", address(registry));
        console.log("  Owner           :", registry.owner());
        console.log("  Operator        :", registry.operator());
        console.log("");
        console.log("Chain ID          : 16661 (0G Aristotle Mainnet)");
        console.log("Explorer          : https://chainscan.0g.ai");
        console.log("");
        console.log("Add to .env.local AND Vercel env vars:");
        console.log("NEXT_PUBLIC_0G_RPC_URL=https://evmrpc.0g.ai");
        console.log("NEXT_PUBLIC_0G_CHAIN_ID=16661");
        console.log("NEXT_PUBLIC_STORAGE_INDEX_ADDRESS=", address(storageIndex));
        console.log("NEXT_PUBLIC_LAWYER_REGISTRY_ADDRESS=", address(registry));
        console.log("========================================================");
    }
}
