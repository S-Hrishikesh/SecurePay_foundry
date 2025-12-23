// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Script, console} from "forge-std/Script.sol";
import {SubscriptionManager} from "../src/SubscriptionManager.sol";

contract DeployScript is Script {
    function run() external returns (address) {
        // Load the private key from the .env file for security
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        // Start broadcasting transactions using the loaded key
        vm.startBroadcast(deployerPrivateKey);

        // Deploy the contract and capture the instance
        SubscriptionManager subscriptionManager = new SubscriptionManager();

        // Stop broadcasting
        vm.stopBroadcast();

        // Log the new address to the console for easy copying
        console.log("SubscriptionManager deployed at:", address(subscriptionManager));
        
        return address(subscriptionManager);
    }
}