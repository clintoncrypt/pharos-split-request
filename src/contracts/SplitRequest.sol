// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.20;

contract SplitRequest {
    struct PaymentRequest {
        address requester;
        address from;
        uint256 amount;
        string memo;
        uint256 deadline;
        bool paid;
    }

    uint256 private nextRequestId = 1;
    mapping(uint256 => PaymentRequest) private requests;
    bool private locked;

    event PaymentSplit(address indexed sender, address[] recipients, uint256[] amounts, uint256 totalAmount);
    event PaymentRequested(
        uint256 indexed requestId,
        address indexed from,
        address indexed to,
        uint256 amount,
        string memo,
        uint256 deadline
    );
    event RequestFulfilled(uint256 indexed requestId, address indexed payer, uint256 amount);

    modifier nonReentrant() {
        require(!locked, "Reentrant call");
        locked = true;
        _;
        locked = false;
    }

    function splitPayment(address[] calldata recipients, uint256[] calldata amounts) external payable nonReentrant {
        require(recipients.length > 0, "No recipients");
        require(recipients.length == amounts.length, "Arrays length mismatch");

        uint256 totalAmount = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            require(recipients[i] != address(0), "Invalid recipient");
            require(amounts[i] > 0, "Invalid amount");
            totalAmount += amounts[i];
        }

        require(msg.value == totalAmount, "Incorrect ETH amount");

        for (uint256 i = 0; i < recipients.length; i++) {
            (bool success, ) = recipients[i].call{value: amounts[i]}("");
            require(success, "Transfer failed");
        }

        emit PaymentSplit(msg.sender, recipients, amounts, totalAmount);
    }

    function requestPayment(
        address from,
        uint256 amount,
        string calldata memo,
        uint256 deadline
    ) external returns (uint256 requestId) {
        require(from != address(0), "Invalid payer");
        require(amount > 0, "Invalid amount");
        require(deadline > block.timestamp, "Deadline must be in the future");

        requestId = nextRequestId;
        nextRequestId += 1;

        requests[requestId] = PaymentRequest({
            requester: msg.sender,
            from: from,
            amount: amount,
            memo: memo,
            deadline: deadline,
            paid: false
        });

        emit PaymentRequested(requestId, from, msg.sender, amount, memo, deadline);
    }

    function fulfillRequest(uint256 requestId) external payable nonReentrant {
        require(requestId > 0 && requestId < nextRequestId, "Request not found");

        PaymentRequest storage paymentRequest = requests[requestId];
        require(!paymentRequest.paid, "Request already paid");
        require(msg.sender == paymentRequest.from, "Unauthorized payer");
        require(block.timestamp <= paymentRequest.deadline, "Request expired");
        require(msg.value == paymentRequest.amount, "Incorrect ETH amount");

        paymentRequest.paid = true;

        (bool success, ) = paymentRequest.requester.call{value: msg.value}("");
        require(success, "Transfer failed");

        emit RequestFulfilled(requestId, msg.sender, msg.value);
    }

    function getRequest(
        uint256 requestId
    )
        external
        view
        returns (address requester, address from, uint256 amount, string memory memo, uint256 deadline, bool paid)
    {
        require(requestId > 0 && requestId < nextRequestId, "Request not found");

        PaymentRequest storage paymentRequest = requests[requestId];
        return (
            paymentRequest.requester,
            paymentRequest.from,
            paymentRequest.amount,
            paymentRequest.memo,
            paymentRequest.deadline,
            paymentRequest.paid
        );
    }
}
