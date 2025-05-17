// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Medicine
 * @dev Represents a finished medicine batch. State managed strictly by SupplyChain.
 * @notice Uses custom errors for revert reasons.
 */
contract Medicine {
    // --- Custom Errors ---
    error Med_UnauthorizedCaller(address caller, address expected);
    error Med_InvalidStateForAction(Status current, Status required); // Generic state mismatch for action
    error Med_InvalidStateTransition(Status current, Status target); // Specific invalid transition attempt
    error Med_InvalidAddress(string context); // e.g., "transporter", "destination", "receiver"
    error Med_ReceiverMismatch(address expected, address actual);
    error Med_AlreadyDestroyedOrFinalized();
    // Constructor Errors
    error Med_QuantityMustBePositive();
    error Med_ExpiryNotInFuture();
    error Med_RawMaterialArrayEmpty();

    // --- Types ---
    enum Status { Created, InTransitToW, AtWholesaler, InTransitToD, AtDistributor, InTransitToC, AtCustomer, ConsumedOrSold, Destroyed }

    // --- State ---
    address public immutable batchId; // Contract's own address serves as unique ID
    address public immutable supplyChainContract; // The only authorized state modifier
    address public immutable transactionLogger; // Dedicated logger instance for this batch

    // Batch Details (Immutable after creation)
    bytes32 public immutable description;
    uint public immutable quantity;
    address[] public immutable rawMaterialBatchIds; // Addresses of RM batches used
    address public immutable manufacturer; // The address that created this batch
    uint public immutable creationTime; // Timestamp of deployment
    uint public immutable expiryDate; // Product expiry date

    // Dynamic State (Managed by SupplyChain contract calls)
    Status public status;
    address public currentOwner; // Current holder of the batch
    address public currentTransporter; // Current entity transporting the batch (if any)
    address public currentDestination; // Next intended recipient (if in transit)
    uint public lastUpdateTime; // Timestamp of last state change

    // --- Events ---
    event StatusChanged(Status newStatus, uint timestamp);
    event OwnershipTransferred(address indexed from, address indexed to, uint timestamp);
    event TransporterAssigned(address indexed transporter, address indexed destination, uint timestamp);
    event BatchDestroyed(string reason, uint timestamp);
    event BatchFinalized(uint timestamp); // For ConsumedOrSold status

    // --- Constructor ---
    constructor(
        address _supplyChainContract,
        address _transactionLogger,
        bytes32 _description,
        uint _quantity,
        address[] calldata _rawMaterialBatchIds, // Use calldata for efficiency
        address _manufacturer,
        uint _expiryDate
    ) {
        // Perform rigorous checks on immutable state set here
        if (_supplyChainContract == address(0)) revert Med_InvalidAddress("SupplyChainContract");
        if (_transactionLogger == address(0)) revert Med_InvalidAddress("TransactionLogger");
        if (_manufacturer == address(0)) revert Med_InvalidAddress("Manufacturer");
        if (_rawMaterialBatchIds.length == 0) revert Med_RawMaterialArrayEmpty();
        // Optional: Check individual raw material addresses are not zero (SC should ideally validate this)
        if (_quantity == 0) revert Med_QuantityMustBePositive();
        if (_expiryDate <= block.timestamp) revert Med_ExpiryNotInFuture();

        batchId = address(this);
        supplyChainContract = _supplyChainContract;
        transactionLogger = _transactionLogger;
        description = _description;
        quantity = _quantity;
        rawMaterialBatchIds = _rawMaterialBatchIds; // Assign immutable array
        manufacturer = _manufacturer;
        expiryDate = _expiryDate;
        creationTime = block.timestamp;

        status = Status.Created;
        currentOwner = _manufacturer;
        lastUpdateTime = block.timestamp;

        emit StatusChanged(status, lastUpdateTime);
        emit OwnershipTransferred(address(0), currentOwner, lastUpdateTime);
    }

    // --- State Transitions (ONLY callable by SupplyChain contract) ---

    /**
     * @dev Sets the batch status to an InTransit state. Only callable by SupplyChain.
     * @notice Validates caller, state, and input addresses. Ensures valid state transition.
     */
    function setInTransit(Status _nextStatus, address _transporter, address _destination) external {
        if (msg.sender != supplyChainContract) {
             revert Med_UnauthorizedCaller(msg.sender, supplyChainContract);
        }
        if (_transporter == address(0)) revert Med_InvalidAddress("transporter");
        if (_destination == address(0)) revert Med_InvalidAddress("destination");

        // Validate the state transition logic
        bool isValidStart = false;
        if (status == Status.Created && (_nextStatus == Status.InTransitToW || _nextStatus == Status.InTransitToD)) isValidStart = true;
        else if (status == Status.AtWholesaler && _nextStatus == Status.InTransitToD) isValidStart = true;
        else if (status == Status.AtDistributor && _nextStatus == Status.InTransitToC) isValidStart = true;

        if (!isValidStart) {
             revert Med_InvalidStateTransition(status, _nextStatus); // Invalid start state for this transit type
        }

        // Effects
        status = _nextStatus;
        currentTransporter = _transporter;
        currentDestination = _destination;
        lastUpdateTime = block.timestamp;

        // Interactions
        emit TransporterAssigned(_transporter, _destination, lastUpdateTime);
        emit StatusChanged(status, lastUpdateTime);
    }

    /**
     * @dev Sets the batch status upon confirmed receipt. Only callable by SupplyChain.
     * @notice Validates caller, state, receiver address, destination match, and valid arrival state.
     */
    function setReceived(Status _nextStatus, address _receiver) external {
         if (msg.sender != supplyChainContract) {
             revert Med_UnauthorizedCaller(msg.sender, supplyChainContract);
        }
         if (_receiver == address(0)) revert Med_InvalidAddress("receiver");
         // Crucial check: Ensure the receiver matches the intended destination set during transit initiation
         if (_receiver != currentDestination) {
             revert Med_ReceiverMismatch(currentDestination, _receiver);
         }

        // Validate the state transition logic for arrival
        bool isValidArrival = false;
        if (status == Status.InTransitToW && _nextStatus == Status.AtWholesaler) isValidArrival = true;
        else if (status == Status.InTransitToD && _nextStatus == Status.AtDistributor) isValidArrival = true;
        else if (status == Status.InTransitToC && _nextStatus == Status.AtCustomer) isValidArrival = true;

        if (!isValidArrival) {
             revert Med_InvalidStateTransition(status, _nextStatus); // Invalid arrival state for current transit status
        }

        // Effects
        address previousOwner = currentOwner;
        status = _nextStatus;
        currentOwner = _receiver; // Ownership transfers upon receipt
        currentTransporter = address(0); // Clear transporter after receipt
        currentDestination = address(0); // Clear destination after receipt
        lastUpdateTime = block.timestamp;

        // Interactions
        emit OwnershipTransferred(previousOwner, currentOwner, lastUpdateTime);
        emit StatusChanged(status, lastUpdateTime);
    }

    /**
     * @dev Sets the final ConsumedOrSold status. Requires AtCustomer state. Only callable by SupplyChain.
     */
    function setConsumedOrSold() external {
        if (msg.sender != supplyChainContract) {
            revert Med_UnauthorizedCaller(msg.sender, supplyChainContract);
        }
        // Check required state before action
        if (status != Status.AtCustomer) {
            revert Med_InvalidStateForAction(status, Status.AtCustomer);
        }

        // Effects
        status = Status.ConsumedOrSold;
        // Owner remains the customer who consumed/sold it. Transporter/Destination are already zero.
        lastUpdateTime = block.timestamp;

        // Interactions
        emit BatchFinalized(lastUpdateTime);
        emit StatusChanged(status, lastUpdateTime);
    }

    /**
     * @dev Sets the Destroyed status. Cannot be called if already destroyed or consumed/sold. Only callable by SupplyChain.
     */
    function setDestroyed(string calldata _reason) external {
        if (msg.sender != supplyChainContract) {
            revert Med_UnauthorizedCaller(msg.sender, supplyChainContract);
        }
        // Check if already in a terminal state
        if (status == Status.Destroyed || status == Status.ConsumedOrSold) {
            revert Med_AlreadyDestroyedOrFinalized();
        }

        // Effects
        address previousOwner = currentOwner;
        status = Status.Destroyed;
        currentOwner = address(0); // No owner for destroyed batch
        currentTransporter = address(0);
        currentDestination = address(0);
        lastUpdateTime = block.timestamp;

        // Interactions
        emit BatchDestroyed(_reason, lastUpdateTime);
        // Emit ownership transfer to address(0) only if there was a previous owner
        if (previousOwner != address(0)) {
            emit OwnershipTransferred(previousOwner, address(0), lastUpdateTime);
        }
        emit StatusChanged(status, lastUpdateTime);
    }

    // --- View Functions ---

    /**
     * @dev Returns comprehensive batch details.
     */
    function getDetails() external view returns (
        bytes32 _description, uint _quantity, address[] memory _rawMaterialBatchIds,
        address _manufacturer, uint _creationTime, uint _expiryDate, Status _status,
        address _currentOwner, address _currentTransporter, address _currentDestination,
        uint _lastUpdateTime, address _transactionLoggerAddr // Use distinct name from state var
    ) {
        return (
            description, quantity, rawMaterialBatchIds, manufacturer, creationTime,
            expiryDate, status, currentOwner, currentTransporter, currentDestination,
            lastUpdateTime, transactionLogger // Return the immutable logger address
        );
    }

    /**
     * @dev Returns the current status enum.
     */
    function getStatus() external view returns (Status) {
        return status;
    }
}