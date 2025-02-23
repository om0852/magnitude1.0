// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract RidePayment {
    address public owner;
    uint256 public platformFee; // Platform fee percentage (1 = 1%)
    
    struct Ride {
        string rideId;
        address payable driver;
        address payable passenger;
        uint256 fare;
        bool isPaid;
        bool isCompleted;
        uint256 timestamp;
    }
    
    mapping(string => Ride) public rides;
    mapping(address => uint256) public driverBalances;
    
    event RideCreated(string rideId, address driver, address passenger, uint256 fare);
    event RideCompleted(string rideId, uint256 fare, uint256 platformFeeAmount);
    event DriverPaid(address driver, uint256 amount);
    event FundsWithdrawn(address owner, uint256 amount);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    constructor(uint256 _platformFee) {
        owner = msg.sender;
        platformFee = _platformFee;
    }
    
    function createRide(
        string memory _rideId,
        address payable _driver,
        address payable _passenger,
        uint256 _fare
    ) external {
        require(_fare > 0, "Fare must be greater than 0");
        require(_driver != address(0), "Invalid driver address");
        require(_passenger != address(0), "Invalid passenger address");
        
        rides[_rideId] = Ride({
            rideId: _rideId,
            driver: _driver,
            passenger: _passenger,
            fare: _fare,
            isPaid: false,
            isCompleted: false,
            timestamp: block.timestamp
        });
        
        emit RideCreated(_rideId, _driver, _passenger, _fare);
    }
    
    function payForRide(string memory _rideId) external payable {
        Ride storage ride = rides[_rideId];
        require(!ride.isPaid, "Ride is already paid");
        require(msg.value >= ride.fare, "Insufficient payment");
        require(msg.sender == ride.passenger, "Only passenger can pay");
        
        ride.isPaid = true;
        
        uint256 platformFeeAmount = (ride.fare * platformFee) / 100;
        uint256 driverAmount = ride.fare - platformFeeAmount;
        
        driverBalances[ride.driver] += driverAmount;
        
        // Refund excess payment if any
        if (msg.value > ride.fare) {
            payable(msg.sender).transfer(msg.value - ride.fare);
        }
    }
    
    function completeRide(string memory _rideId) external {
        Ride storage ride = rides[_rideId];
        require(msg.sender == ride.driver, "Only driver can complete ride");
        require(ride.isPaid, "Ride is not paid yet");
        require(!ride.isCompleted, "Ride is already completed");
        
        ride.isCompleted = true;
        
        uint256 platformFeeAmount = (ride.fare * platformFee) / 100;
        emit RideCompleted(_rideId, ride.fare, platformFeeAmount);
    }
    
    function withdrawDriverBalance() external {
        uint256 amount = driverBalances[msg.sender];
        require(amount > 0, "No balance to withdraw");
        
        driverBalances[msg.sender] = 0;
        payable(msg.sender).transfer(amount);
        
        emit DriverPaid(msg.sender, amount);
    }
    
    function withdrawPlatformFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        
        payable(owner).transfer(balance);
        emit FundsWithdrawn(owner, balance);
    }
    
    function getRide(string memory _rideId) external view returns (
        address driver,
        address passenger,
        uint256 fare,
        bool isPaid,
        bool isCompleted,
        uint256 timestamp
    ) {
        Ride memory ride = rides[_rideId];
        return (
            ride.driver,
            ride.passenger,
            ride.fare,
            ride.isPaid,
            ride.isCompleted,
            ride.timestamp
        );
    }
    
    function getDriverBalance(address _driver) external view returns (uint256) {
        return driverBalances[_driver];
    }
}