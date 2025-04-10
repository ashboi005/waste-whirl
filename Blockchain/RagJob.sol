// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract RagJob {
    // Address of the user who requested the pickup
    address public user;

    // Address of the rag picker who accepts the job
    address public picker;

    // The payment amount for the job (in wei)
    uint public amount;

    // Status of whether the job is completed or not
    bool public isCompleted;

    // Constructor: Initialize job with the user and rag picker addresses
    // Also, accepts the payment amount (ETH) from the user
    constructor(address _user, address _picker) payable {
        user = _user;         // Store the user's address
        picker = _picker;     // Store the rag picker's address
        amount = msg.value;   // The amount of ETH the user sent
        isCompleted = false;  // Initial status of the job (not completed)
    }

    // Function to confirm that the rag picker has completed the job
    function confirmCompletion() public {
        // Only the user who created the job can confirm completion
        require(msg.sender == user, "Only user can confirm");

        // The job cannot be completed again (already done)
        require(!isCompleted, "Job already completed");

        // Mark the job as completed
        isCompleted = true;

        // Transfer the payment to the rag picker
        payable(picker).transfer(amount);  // Send the ETH to the rag picker
    }
}
