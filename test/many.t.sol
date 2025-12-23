// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "forge-std/Test.sol";
import "../src/SubscriptionManager.sol";
import "../src/MockERC20.sol";

contract SubscriptionManagerExtraTests is Test {
    SubscriptionManager manager;
    MockERC20 token;
    address owner = address(1);
    address alice = address(2);

    function setUp() public {
        vm.startPrank(owner);
        manager = new SubscriptionManager();
        token = new MockERC20("MockToken", "MCK", 18);
        vm.stopPrank();

        token.mint(alice, 1000 ether);
    }

    function testCreateMultiplePlans() public {
        vm.startPrank(owner);
        uint id1 = manager.createPlan(address(token), 5 ether, 1800);
        uint id2 = manager.createPlan(address(token), 10 ether, 3600);
        vm.stopPrank();

        assertEq(id1, 1);
        assertEq(id2, 2);

        (, IERC20 token1, uint price1,,) = manager.plans(id1);
        (, IERC20 token2, uint price2,,) = manager.plans(id2);

        assertEq(address(token1), address(token));
        assertEq(price1, 5 ether);
        assertEq(address(token2), address(token));
        assertEq(price2, 10 ether);
    }

    function testSubscribeInactivePlan() public {
        vm.startPrank(owner);
        manager.createPlan(address(token), 10 ether, 3600);
        // Deactivate plan forcibly
        manager.setPlanStatus(1, false);
        vm.stopPrank();

        vm.startPrank(alice);
        token.approve(address(manager), 10 ether);
        vm.expectRevert("Plan is not active");
        manager.subscribe(1);
        vm.stopPrank();
    }

    function test_RevertIfCancelInactive() public {
        vm.startPrank(owner);
        manager.createPlan(address(token), 10 ether, 3600);
        vm.stopPrank();

        vm.startPrank(alice);
        token.approve(address(manager), 10 ether);
        uint subId = manager.subscribe(1);
        manager.cancel(subId);
        vm.expectRevert("Already inactive");
        manager.cancel(subId);
        vm.stopPrank();
    }

    function test_RevertIfRenewWithInactivePlan() public {
        vm.startPrank(owner);
        manager.createPlan(address(token), 10 ether, 3600);
        vm.stopPrank();

        vm.startPrank(alice);
        token.approve(address(manager), 20 ether);
        uint subId = manager.subscribe(1);
        vm.stopPrank();

        // Deactivate plan forcibly
        vm.prank(owner);
        manager.setPlanStatus(1, false);

        vm.prank(alice);
        vm.expectRevert("Plan inactive");
        manager.renew(subId);
    }

    function testMultipleSubscriptions() public {
        vm.startPrank(owner);
        uint p1 = manager.createPlan(address(token), 5 ether, 1800);
        uint p2 = manager.createPlan(address(token), 10 ether, 3600);
        vm.stopPrank();

        vm.startPrank(alice);
        token.approve(address(manager), 20 ether);

        uint s1 = manager.subscribe(p1);
        uint s2 = manager.subscribe(p2);

        (address subscriber1, , , , bool isActive1) = manager.subscriptions(s1);
        (address subscriber2, , , , bool isActive2) = manager.subscriptions(s2);

        assertEq(subscriber1, alice);
        assertEq(subscriber2, alice);
        assertTrue(isActive1);
        assertTrue(isActive2);

        vm.stopPrank();
    }
}
