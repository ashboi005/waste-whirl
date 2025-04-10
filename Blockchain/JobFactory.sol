// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./RagJob.sol";  // Import the RagJob contract

contract JobFactory {
    // Array to store all the deployed job contracts
    address[] public allJobs;

    // Event to emit when a new job is created
    event JobCreated(address contractAddress, address user, address picker, uint amount);

    // Function to create a new job contract
    function createJob(address picker) external payable {
        require(msg.value > 0, "Payment required");  // Ensure the user sends ETH

        // Deploy a new instance of RagJob contract
        RagJob job = (new RagJob){value: msg.value}(msg.sender, picker);

        // Store the contract address of the new job
        allJobs.push(address(job));

        // Emit the JobCreated event
        emit JobCreated(address(job), msg.sender, picker, msg.value);
    }

    // Function to fetch all created job contracts
    function getAllJobs() public view returns (address[] memory) {
        return allJobs;
    }
}
