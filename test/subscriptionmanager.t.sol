// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "forge-std/Test.sol";
import "../src/SubscriptionManager.sol";
import "../src/MockERC20.sol";

contract SubscriptionManagerTest is Test {
    SubscriptionManager manager;
    MockERC20 token;
    address owner = address(1);
    address alice = address(2);

    function setUp() public {
        // Deploy contracts
        manager = new SubscriptionManager();
        token = new MockERC20("MockToken", "MCK", 18);

        // Mint tokens to Alice
        token.mint(alice, 1000 ether);
        vm.startPrank(owner);
    }

    function testCreatePlan() public {
        // Create plan
        manager.createPlan(address(token), 10 ether, 3600);

        (
            address creator,
            IERC20 tokenInPlan,
            uint price,
            uint interval,
            bool active
        ) = manager.plans(1);

        assertEq(creator, owner);
        assertEq(address(tokenInPlan), address(token));
        assertEq(price, 10 ether);
        assertEq(interval, 3600);
        assertTrue(active);
    }

    function testSubscribe() public {
        manager.createPlan(address(token), 10 ether, 3600);
        vm.stopPrank();
        vm.startPrank(alice);
        // Alice approves tokens to contract
        token.approve(address(manager), 10 ether);
        // Alice subscribes
        manager.subscribe(1);

        (
            address subscriber,
            uint planId,
            uint nextDue,
            uint lastPaid,
            bool active
        ) = manager.subscriptions(1); // subscriptionId = 1

        assertEq(subscriber, alice);
        assertEq(planId, 1);
        assertTrue(active);
        assertGe(nextDue, block.timestamp);
    }

    // add more tests for renew, cancel, edge cases
}
