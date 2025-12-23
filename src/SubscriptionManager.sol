// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SubscriptionManager is Ownable, ReentrancyGuard {
    struct Plan {
        address creator;
        IERC20 token;  // Use IERC20 interface here
        uint256 price;        // price in smallest unit (e.g., 6 decimals for USDC)
        uint256 interval;     // subscription interval in seconds
        bool active;
    }

    struct Subscription {
        address subscriber;
        uint256 planId;
        uint256 nextPaymentDue;
        uint256 lastPaid;
        bool isActive;
    }

    uint256 public nextPlanId = 1;
    uint256 public nextSubscriptionId = 1;
    mapping(uint256 => Plan) public plans;
    mapping(uint256 => Subscription) public subscriptions;

    // Events
    event SubscriptionCreated(uint256 indexed planId, address indexed creator, address token, uint256 price, uint256 interval);
    event Subscribed(uint256 indexed subscriptionId, address indexed subscriber, uint256 planId);
    event Renewed(uint256 indexed subscriptionId);
    event Canceled(uint256 indexed subscriptionId);

    // Constructor with Ownable initialization
    constructor() Ownable(msg.sender) {}

    // Create a subscription plan
    function createPlan(address tokenAddr, uint256 price, uint256 interval) external returns (uint256) {
        require(price > 0, "Price must be positive");
        require(interval > 0, "Interval must be positive");
        plans[nextPlanId] = Plan({
            creator: msg.sender,
            token: IERC20(tokenAddr),
            price: price,
            interval: interval,
            active: true
        });
        emit SubscriptionCreated(nextPlanId, msg.sender, tokenAddr, price, interval);
        return nextPlanId++;
    }

    // Subscribe using approve and transferFrom
    function subscribe(uint256 planId) external nonReentrant returns (uint256) {
        Plan storage plan = plans[planId];
        require(plan.active, "Plan is not active");
        require(plan.token.transferFrom(msg.sender, plan.creator, plan.price), "Payment failed");
        subscriptions[nextSubscriptionId] = Subscription({
            subscriber: msg.sender,
            planId: planId,
            nextPaymentDue: block.timestamp + plan.interval,
            lastPaid: block.timestamp,
            isActive: true
        });
        emit Subscribed(nextSubscriptionId, msg.sender, planId);
        return nextSubscriptionId++;
    }

    // Subscribe with permit
    function subscribeWithPermit(
        uint256 planId,
        uint256 value,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external nonReentrant returns (uint256) {
        Plan storage plan = plans[planId];
        require(plan.active, "Plan is not active");
        require(value == plan.price, "Invalid amount");
        IERC20Permit(address(plan.token)).permit(msg.sender, address(this), value, deadline, v, r, s);
        require(plan.token.transferFrom(msg.sender, plan.creator, value), "Payment failed");
        subscriptions[nextSubscriptionId] = Subscription({
            subscriber: msg.sender,
            planId: planId,
            nextPaymentDue: block.timestamp + plan.interval,
            lastPaid: block.timestamp,
            isActive: true
        });
        emit Subscribed(nextSubscriptionId, msg.sender, planId);
        return nextSubscriptionId++;
    }

    // Renew subscription
    function renew(uint256 subscriptionId) external nonReentrant returns (bool) {
        Subscription storage sub = subscriptions[subscriptionId];
        require(sub.isActive, "Subscription inactive");
        Plan storage plan = plans[sub.planId];
        require(plan.active, "Plan inactive");
        require(block.timestamp >= sub.nextPaymentDue, "Too early");
        require(plan.token.transferFrom(sub.subscriber, plan.creator, plan.price), "Payment failed");
        sub.lastPaid = block.timestamp;
        sub.nextPaymentDue = block.timestamp + plan.interval;
        emit Renewed(subscriptionId);
        return true;
    }

    // Cancel subscription
    function cancel(uint256 subscriptionId) external {
        Subscription storage sub = subscriptions[subscriptionId];
        require(sub.subscriber == msg.sender, "Not subscriber");
        require(sub.isActive, "Already inactive");
        sub.isActive = false;
        emit Canceled(subscriptionId);
    }

    // Check if user subscription is active
    function isActive(address user, uint256 planId) external view returns (bool) {
        for (uint256 i = 1; i < nextSubscriptionId; i++) {
            Subscription storage sub = subscriptions[i];
            if (sub.subscriber == user && sub.planId == planId && sub.isActive && block.timestamp < sub.nextPaymentDue) {
                return true;
            }
        }
        return false;
    }


    function setPlanStatus(uint256 planId, bool active) external onlyOwner {
        plans[planId].active = active;
    }


}

