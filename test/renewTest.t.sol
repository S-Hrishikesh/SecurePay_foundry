// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "forge-std/Test.sol";
import "../src/SubscriptionManager.sol";
import "../src/MockERC20.sol";

contract RenewTest is Test {
    SubscriptionManager manager;
    MockERC20 token;
    address alice = address(1);
    address owner = address(2);

    function setUp() public {
        // Deploy contracts
        vm.startPrank(owner);
        manager = new SubscriptionManager();
        token = new MockERC20("MockToken", "MCK", 18);
        vm.stopPrank();

        // Mint tokens to Alice
        token.mint(alice, 1000 ether);
    }

    function testRenew() public {
        vm.startPrank(owner);
        manager.createPlan(address(token), 10 ether, 3600);
        vm.stopPrank();

        vm.startPrank(alice);
        token.approve(address(manager), 10 ether * 2);  // approve enough tokens for subscribe + renew
        uint subId = manager.subscribe(1);

        // Fast-forward time beyond next payment due
        vm.warp(block.timestamp + 3601);

        // Renew subscription
        bool success = manager.renew(subId);
        assertTrue(success);

        (, , uint nextDue, uint lastPaid, bool active) = manager.subscriptions(subId);
        assertTrue(active);
        assertGt(nextDue, block.timestamp);
        assertEq(lastPaid, block.timestamp);
        vm.stopPrank();
    }


    function test_RevertIfRenewTooEarly() public {
        vm.startPrank(owner);
        manager.createPlan(address(token), 10 ether, 3600);
        vm.stopPrank();

        vm.startPrank(alice);
        token.approve(address(manager), 10 ether);
        uint subId = manager.subscribe(1);

        vm.expectRevert("Too early");
        manager.renew(subId);
        vm.stopPrank();
    }

    function testCancel() public {
        vm.startPrank(owner);
        manager.createPlan(address(token), 10 ether, 3600);
        vm.stopPrank();

        vm.startPrank(alice);
        token.approve(address(manager), 10 ether);
        uint subId = manager.subscribe(1);

        manager.cancel(subId);

        (, , , , bool active) = manager.subscriptions(subId);
        assertFalse(active);
        vm.stopPrank();
    }

    function test_RevertIfCancelNotSubscriber() public {
        vm.startPrank(owner);
        manager.createPlan(address(token), 10 ether, 3600);
        vm.stopPrank();

        vm.startPrank(alice);
        token.approve(address(manager), 10 ether);
        uint subId = manager.subscribe(1);
        vm.stopPrank();

        vm.startPrank(address(3));  // Some other address
        vm.expectRevert("Not subscriber");
        manager.cancel(subId);
        vm.stopPrank();
    }


}
