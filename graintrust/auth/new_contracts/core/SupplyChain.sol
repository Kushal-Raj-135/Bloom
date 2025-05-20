// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Import Base Contracts & Interfaces
import "./AccessControlWithOwner.sol"; // Adjust path if needed
import "./Transactions.sol"; // Adjust path if needed
import "./RawMaterial.sol"; // Adjust path if needed
import "./Medicine.sol"; // Adjust path if needed

/**
 * @title SupplyChain
 * @dev Main orchestrator contract. Manages roles, batch lifecycles, and logging.
 * @notice Uses custom errors for revert reasons. Relies on events for batch discovery.
 */
contract SupplyChain is AccessControlWithOwner {

    // --- Custom Errors ---
    error SC_InvalidAddress(string context); // More context for zero address errors
    // SC_RoleMissing is handled by AccessControlWithOwner's AccessControlMissingRole
    error SC_RoleCheckFailed(address target, bytes32 role, string reason); // Specific role check failures beyond just missing
    error SC_LoggerNotFound(address batchAddress);
    error SC_BatchCreationFailed(string batchType);
    error SC_RawMaterialValidationFailed(address rmAddress, string reason);
    error SC_UnauthorizedActor(address actor, string reason); // Provide context for unauthorized (e.g., not owner/supplier)
    error SC_InvalidStateForAction(address batchAddress, uint currentState, string action);
    error SC_ReceiverMismatch(address batchAddress, address expected, address actual);
    error SC_InvalidReceiverRole(address receiver, bytes32 expectedRole); // Use bytes32 for role comparison
    error SC_BatchTypeUnknownOrActionFailed(address batchAddress, string action);
    error SC_ArgumentError(string reason); // Generic argument validation error
    error SC_ExternalCallFailed(address target, string action); // Failure during try/catch

    // --- State Variables ---
    // Mapping to find the dedicated logger for each batch. Batch addresses are NOT stored in arrays.
    mapping(address => address) public transactionLoggerForBatch; // BatchAddr -> LoggerAddr

    // --- Events ---
    // Events are crucial for off-chain systems to track batches
    event BatchCreated(bytes32 indexed batchType, address indexed batchAddress, address indexed creator, address transactionLogger, uint timestamp);
    event TransferInitiated(address indexed batchAddress, address indexed initiator, address indexed transporter, address indexed receiver, uint timestamp);
    event PackageReceived(address indexed batchAddress, address indexed receiver, address indexed sender, uint timestamp);
    event BatchFinalized(address indexed batchAddress, address indexed finalOwner, uint timestamp); // For Medicine Consumed/Sold
    event BatchDestroyed(address indexed batchAddress, address indexed actor, string reason, uint timestamp);

    // --- Constructor ---
    constructor() AccessControlWithOwner() {
        // Base constructor handles owner and admin setup (deployer becomes owner and admin)
    }

    // --- Batch Creation ---

    /**
     * @notice Creates a new Raw Material batch. Requires SUPPLIER_ROLE.
     * @dev Validates inputs, deploys contracts, logs event.
     * @param _description Description of the raw material.
     * @param _quantity Amount/Units.
     * @param _intendedManufacturer Target manufacturer address (must have MANUFACTURER_ROLE).
     * @param _latitude Latitude coordinate of creation.
     * @param _longitude Longitude coordinate of creation.
     * @return batchAddress The address of the new RawMaterial contract.
     */
    function createRawMaterial(
        bytes32 _description,
        uint _quantity,
        address _intendedManufacturer,
        string calldata _latitude,
        string calldata _longitude
    )
        external
        returns (address batchAddress)
    {
        _checkRole(SUPPLIER_ROLE, msg.sender); // Check if caller has SUPPLIER_ROLE

        // Input validation
        if (_intendedManufacturer == address(0)) revert SC_InvalidAddress("intendedManufacturer");
        if (_quantity == 0) revert SC_ArgumentError("Quantity must be positive");
        if (!hasRole(MANUFACTURER_ROLE, _intendedManufacturer)) {
            // Use specific error for role check failure
            revert SC_RoleCheckFailed(_intendedManufacturer, MANUFACTURER_ROLE, "Intended manufacturer lacks role");
        }

        // Deployment (Logger first)
        Transactions logger = new Transactions(address(this));
        address loggerAddress = address(logger);
        if (loggerAddress == address(0)) revert SC_BatchCreationFailed("TransactionLogger"); // Extremely unlikely

        // Deploy Batch Contract
        RawMaterial batch = new RawMaterial(
            address(this), // This SC contract address
            loggerAddress,
            _description,
            _quantity,
            msg.sender, // Supplier is the caller
            _intendedManufacturer
        );
        batchAddress = address(batch);
        if (batchAddress == address(0)) revert SC_BatchCreationFailed("RawMaterial"); // Extremely unlikely

        // State Update & Logging
        transactionLoggerForBatch[batchAddress] = loggerAddress;

        bytes32 dataHash = keccak256(abi.encode(_description, _quantity, _intendedManufacturer));
        // Log creation event via the dedicated logger
        logger.createLogEntry(msg.sender, _intendedManufacturer, "RawMaterial Created", _latitude, _longitude, dataHash);

        emit BatchCreated(keccak256("RAW_MATERIAL"), batchAddress, msg.sender, loggerAddress, block.timestamp);
        return batchAddress;
    }

    /**
     * @notice Creates a new Medicine batch from validated Raw Materials. Requires MANUFACTURER_ROLE.
     * @dev Validates inputs, checks raw material status/ownership, deploys contracts, logs event.
     * @param _description Description of the medicine.
     * @param _quantity Amount/Units.
     * @param _rawMaterialBatchIds Addresses of input RawMaterial contracts. Must be 'Received' by caller.
     * @param _expiryDate Unix timestamp of expiry. Must be in the future.
     * @param _latitude Latitude coordinate of creation.
     * @param _longitude Longitude coordinate of creation.
     * @return batchAddress The address of the new Medicine contract.
     */
    function createMedicine(
        bytes32 _description,
        uint _quantity,
        address[] calldata _rawMaterialBatchIds,
        uint _expiryDate,
        string calldata _latitude,
        string calldata _longitude
    )
        external
        returns (address batchAddress)
    {
        _checkRole(MANUFACTURER_ROLE, msg.sender); // Check if caller has MANUFACTURER_ROLE

        // Input validation
        if (_rawMaterialBatchIds.length == 0) revert SC_ArgumentError("Requires at least one raw material input");
        if (_quantity == 0) revert SC_ArgumentError("Quantity must be positive");
        if (_expiryDate <= block.timestamp) revert SC_ArgumentError("Expiry date must be in the future");

        // Validate each Raw Material input rigorously
        for (uint i = 0; i < _rawMaterialBatchIds.length; i++) {
            address rmAddr = _rawMaterialBatchIds[i];
            if (rmAddr == address(0)) revert SC_InvalidAddress("rawMaterialBatchId in array");
            try RawMaterial(rmAddr).getStatus() returns (RawMaterial.Status status) {
                // Must be in Received state
                if (status != RawMaterial.Status.Received) {
                     revert SC_RawMaterialValidationFailed(rmAddr, "Not in Received state");
                }
                // Must have been intended for *this* manufacturer (who is the caller)
                if (RawMaterial(rmAddr).intendedManufacturer() != msg.sender) {
                     revert SC_RawMaterialValidationFailed(rmAddr, "Not intended for this manufacturer");
                }
                // Potential enhancement: Add a mechanism in RawMaterial to mark as "ConsumedInProduction"
                // to prevent reuse in another Medicine batch. Requires state change in RawMaterial.
            } catch {
                revert SC_RawMaterialValidationFailed(rmAddr, "Invalid contract or call failed");
            }
        }

        // Deployment (Logger first)
        Transactions logger = new Transactions(address(this));
        address loggerAddress = address(logger);
         if (loggerAddress == address(0)) revert SC_BatchCreationFailed("TransactionLogger");

        // Deploy Medicine Contract
        Medicine batch = new Medicine(
            address(this), // This SC contract address
            loggerAddress,
            _description,
            _quantity,
            _rawMaterialBatchIds,
            msg.sender, // Manufacturer is the caller
            _expiryDate
        );
        batchAddress = address(batch);
        if (batchAddress == address(0)) revert SC_BatchCreationFailed("Medicine");

        // State Update & Logging
        transactionLoggerForBatch[batchAddress] = loggerAddress;

        bytes32 dataHash = keccak256(abi.encode(_description, _quantity, _rawMaterialBatchIds, _expiryDate));
        // Log creation event via the dedicated logger
        logger.createLogEntry(msg.sender, address(0), "Medicine Created", _latitude, _longitude, dataHash);

        emit BatchCreated(keccak256("MEDICINE"), batchAddress, msg.sender, loggerAddress, block.timestamp);
        return batchAddress;
    }

    // --- Batch Lifecycle Management ---

    /**
     * @notice Initiates transfer of a batch (RawMaterial or Medicine).
     * @dev Checks caller's role and ownership/state, validates transporter/receiver roles, then calls the batch contract.
     * @param _batchAddress Address of the RawMaterial or Medicine contract.
     * @param _transporter Address of the entity responsible for transport (must have TRANSPORTER_ROLE).
     * @param _receiver Address of the intended recipient (role depends on batch type and stage).
     * @param _latitude Latitude coordinate of initiation.
     * @param _longitude Longitude coordinate of initiation.
     */
    function initiateTransfer(
        address _batchAddress,
        address _transporter,
        address _receiver,
        string calldata _latitude,
        string calldata _longitude
    ) external {
        // Input validation
        if (_batchAddress == address(0)) revert SC_InvalidAddress("batchAddress");
        if (_transporter == address(0)) revert SC_InvalidAddress("transporter");
        if (_receiver == address(0)) revert SC_InvalidAddress("receiver");
        if (!hasRole(TRANSPORTER_ROLE, _transporter)) {
            revert SC_RoleCheckFailed(_transporter, TRANSPORTER_ROLE, "Transporter lacks role");
        }

        address loggerAddress = transactionLoggerForBatch[_batchAddress];
        if (loggerAddress == address(0)) revert SC_LoggerNotFound(_batchAddress);
        Transactions logger = Transactions(loggerAddress);

        bool initiated = false;
        bytes32 eventDataHash = keccak256(abi.encode(_transporter, _receiver));
        string memory actionName = "initiateTransfer"; // For consistent error reporting

        // --- Try RawMaterial ---
        try RawMaterial(_batchAddress).getStatus() returns (RawMaterial.Status rmStatus) {
            // Authorization & State Checks for RawMaterial
            // Caller must be the Supplier of this specific batch
            RawMaterial rm = RawMaterial(_batchAddress); // Assume exists due to successful getStatus()
            if (rm.supplier() != msg.sender) {
                revert SC_UnauthorizedActor(msg.sender, "Caller is not the supplier of this RawMaterial batch");
            }
            // Check if the batch is in the correct state ('Created')
            if (rmStatus != RawMaterial.Status.Created) {
                revert SC_InvalidStateForAction(_batchAddress, uint(rmStatus), actionName);
            }
            // Check if the receiver matches the intended manufacturer set at creation
            if (_receiver != rm.intendedManufacturer()) {
                revert SC_ReceiverMismatch(_batchAddress, rm.intendedManufacturer(), _receiver);
            }
            // Check if the receiver has the required MANUFACTURER_ROLE (already checked at creation, but good practice)
            if (!hasRole(MANUFACTURER_ROLE, _receiver)) {
                revert SC_RoleCheckFailed(_receiver, MANUFACTURER_ROLE, "Receiver (Intended Manufacturer) lacks role");
            }

            // Action: Call the RawMaterial contract to update its state
            rm.setInTransit(_transporter); // Batch contract handles internal state checks again
            initiated = true;
            // Log the event via the dedicated logger
            logger.createLogEntry(msg.sender, _transporter, "RawMaterial Transfer Initiated", _latitude, _longitude, eventDataHash);

        } catch Error(string memory reason) {
             // Catch specific errors from the external call if needed, otherwise use generic failure
             revert SC_ExternalCallFailed(_batchAddress, string(abi.encodePacked("RawMaterial initiateTransfer checks/call failed: ", reason)));
        } catch { /* Low-level failure, proceed to check if it's a Medicine batch */ }

        // --- Try Medicine ---
        if (!initiated) {
            try Medicine(_batchAddress).getStatus() returns (Medicine.Status medStatus) {
                Medicine med = Medicine(_batchAddress); // Assume exists due to successful getStatus()
                // Authorization Check for Medicine: Caller must be the current owner
                if (med.currentOwner() != msg.sender) {
                    revert SC_UnauthorizedActor(msg.sender, "Caller is not the current owner of this Medicine batch");
                }

                Medicine.Status nextTransitStatus;
                bytes32 requiredReceiverRole;
                string memory requiredRoleName; // For clearer error messages

                // Determine required roles and next state based on current state
                if (medStatus == Medicine.Status.Created) { // Manufacturer sending
                    _checkRole(MANUFACTURER_ROLE, msg.sender); // Double check caller role matches state expectation
                    if (hasRole(WHOLESALER_ROLE, _receiver)) {
                        nextTransitStatus = Medicine.Status.InTransitToW; requiredReceiverRole = WHOLESALER_ROLE; requiredRoleName = "WHOLESALER";
                    } else if (hasRole(DISTRIBUTOR_ROLE, _receiver)) {
                        nextTransitStatus = Medicine.Status.InTransitToD; requiredReceiverRole = DISTRIBUTOR_ROLE; requiredRoleName = "DISTRIBUTOR";
                    } else {
                        revert SC_InvalidReceiverRole(_receiver, bytes32(0)); // Use bytes32(0) or a specific error for unsupported role
                    }
                } else if (medStatus == Medicine.Status.AtWholesaler) { // Wholesaler sending
                    _checkRole(WHOLESALER_ROLE, msg.sender);
                    if (!hasRole(DISTRIBUTOR_ROLE, _receiver)) {
                        revert SC_RoleCheckFailed(_receiver, DISTRIBUTOR_ROLE, "Receiver lacks DISTRIBUTOR_ROLE (required from Wholesaler)");
                    }
                    nextTransitStatus = Medicine.Status.InTransitToD; requiredReceiverRole = DISTRIBUTOR_ROLE; requiredRoleName = "DISTRIBUTOR";
                } else if (medStatus == Medicine.Status.AtDistributor) { // Distributor sending
                     _checkRole(DISTRIBUTOR_ROLE, msg.sender);
                     if (!hasRole(CUSTOMER_ROLE, _receiver)) {
                         revert SC_RoleCheckFailed(_receiver, CUSTOMER_ROLE, "Receiver lacks CUSTOMER_ROLE (required from Distributor)");
                     }
                    nextTransitStatus = Medicine.Status.InTransitToC; requiredReceiverRole = CUSTOMER_ROLE; requiredRoleName = "CUSTOMER";
                } else {
                    // Cannot initiate transfer from other states (InTransit, AtCustomer, Consumed, Destroyed)
                    revert SC_InvalidStateForAction(_batchAddress, uint(medStatus), actionName);
                }

                // Action: Call the Medicine contract to update its state
                med.setInTransit(nextTransitStatus, _transporter, _receiver);
                initiated = true;
                // Log the event via the dedicated logger
                logger.createLogEntry(msg.sender, _transporter, "Medicine Transfer Initiated", _latitude, _longitude, eventDataHash);

             } catch Error(string memory reason) {
                 // Catch specific errors from the external call
                revert SC_ExternalCallFailed(_batchAddress, string(abi.encodePacked("Medicine initiateTransfer checks/call failed: ", reason)));
             } catch { /* Low-level failure */ }
        }

        // If neither RawMaterial nor Medicine call succeeded
        if (!initiated) {
            revert SC_BatchTypeUnknownOrActionFailed(_batchAddress, actionName);
        }

        // Emit the central SupplyChain event
        emit TransferInitiated(_batchAddress, msg.sender, _transporter, _receiver, block.timestamp);
    }

    /**
     * @notice Confirms receipt of a batch (RawMaterial or Medicine).
     * @dev Checks caller's role and state, ensures caller matches destination, then calls the batch contract.
     * @param _batchAddress Address of the RawMaterial or Medicine contract being received.
     * @param _latitude Latitude coordinate of reception.
     * @param _longitude Longitude coordinate of reception.
     */
    function receivePackage(
        address _batchAddress,
        string calldata _latitude,
        string calldata _longitude
    ) external {
        if (_batchAddress == address(0)) revert SC_InvalidAddress("batchAddress");
        address loggerAddress = transactionLoggerForBatch[_batchAddress];
        if (loggerAddress == address(0)) revert SC_LoggerNotFound(_batchAddress);
        Transactions logger = Transactions(loggerAddress);

        bool received = false;
        address sender = address(0); // Track the sender for the event
        bytes32 eventDataHash = keccak256(abi.encode("RECEIVE", msg.sender)); // Simple hash for log
        string memory actionName = "receivePackage";

        // --- Try RawMaterial ---
        try RawMaterial(_batchAddress).getStatus() returns (RawMaterial.Status rmStatus) {
            // Authorization & State Checks for RawMaterial
            // Caller must be the intended manufacturer
            RawMaterial rm = RawMaterial(_batchAddress);
            if (rm.intendedManufacturer() != msg.sender) {
                revert SC_ReceiverMismatch(_batchAddress, rm.intendedManufacturer(), msg.sender);
            }
            // Caller must have the MANUFACTURER_ROLE
            _checkRole(MANUFACTURER_ROLE, msg.sender);
            // Batch must be in the 'InTransit' state
            if (rmStatus != RawMaterial.Status.InTransit) {
                revert SC_InvalidStateForAction(_batchAddress, uint(rmStatus), actionName);
            }
            sender = rm.supplier(); // Get sender before state change

            // Action: Call the RawMaterial contract
            rm.setReceived(msg.sender); // Batch contract verifies receiver again internally
            received = true;
            // Log the event via the dedicated logger
            logger.createLogEntry(msg.sender, rm.currentTransporter(), "RawMaterial Received", _latitude, _longitude, eventDataHash);

        } catch Error(string memory reason) {
             revert SC_ExternalCallFailed(_batchAddress, string(abi.encodePacked("RawMaterial receivePackage checks/call failed: ", reason)));
        } catch { /* Low-level failure, proceed */ }

        // --- Try Medicine ---
        if (!received) {
            try Medicine(_batchAddress).getStatus() returns (Medicine.Status medStatus) {
                Medicine med = Medicine(_batchAddress);
                // Authorization Check for Medicine: Caller must be the current destination
                 if (med.currentDestination() != msg.sender) {
                     revert SC_ReceiverMismatch(_batchAddress, med.currentDestination(), msg.sender);
                 }
                 sender = med.currentOwner(); // Get sender (current owner) before state change

                Medicine.Status nextStatus;
                bytes32 requiredReceiverRole;

                 // Determine expected arrival state and required role based on current transit state
                 if (medStatus == Medicine.Status.InTransitToW) {
                    nextStatus = Medicine.Status.AtWholesaler; requiredReceiverRole = WHOLESALER_ROLE;
                 } else if (medStatus == Medicine.Status.InTransitToD) {
                    nextStatus = Medicine.Status.AtDistributor; requiredReceiverRole = DISTRIBUTOR_ROLE;
                 } else if (medStatus == Medicine.Status.InTransitToC) {
                    nextStatus = Medicine.Status.AtCustomer; requiredReceiverRole = CUSTOMER_ROLE;
                 } else {
                     // Cannot receive package if not in a valid transit state
                     revert SC_InvalidStateForAction(_batchAddress, uint(medStatus), actionName);
                 }

                // Check if the caller (receiver) has the required role for this stage
                _checkRole(requiredReceiverRole, msg.sender);

                // Action: Call the Medicine contract
                med.setReceived(nextStatus, msg.sender); // Batch contract verifies state, receiver, etc. again
                received = true;
                // Log the event via the dedicated logger
                logger.createLogEntry(msg.sender, med.currentTransporter(), "Medicine Received", _latitude, _longitude, eventDataHash);

             } catch Error(string memory reason) {
                 revert SC_ExternalCallFailed(_batchAddress, string(abi.encodePacked("Medicine receivePackage checks/call failed: ", reason)));
             } catch { /* Low-level failure */ }
        }

        // If neither RawMaterial nor Medicine call succeeded
        if (!received) {
             revert SC_BatchTypeUnknownOrActionFailed(_batchAddress, actionName);
        }

        // Emit the central SupplyChain event
        emit PackageReceived(_batchAddress, msg.sender, sender, block.timestamp);
    }

    /**
     * @notice Marks a Medicine batch as Consumed or Sold by the Customer. Requires CUSTOMER_ROLE.
     * @dev Checks caller role and ownership, then calls the Medicine batch contract.
     * @param _batchAddress Address of the Medicine contract.
     * @param _latitude Latitude coordinate of finalization.
     * @param _longitude Longitude coordinate of finalization.
     */
    function finalizeMedicineBatch(
        address _batchAddress,
        string calldata _latitude,
        string calldata _longitude
    ) external {
        _checkRole(CUSTOMER_ROLE, msg.sender); // Check caller has CUSTOMER_ROLE first

        if (_batchAddress == address(0)) revert SC_InvalidAddress("batchAddress");
        address loggerAddress = transactionLoggerForBatch[_batchAddress];
        if (loggerAddress == address(0)) revert SC_LoggerNotFound(_batchAddress);
        Transactions logger = Transactions(loggerAddress);
        string memory actionName = "finalizeMedicineBatch";

        try Medicine(_batchAddress).getStatus() returns (Medicine.Status medStatus) {
            Medicine med = Medicine(_batchAddress);
            // Authorization: Caller must be the current owner (which should be the customer at this stage)
            if (med.currentOwner() != msg.sender) {
                revert SC_UnauthorizedActor(msg.sender, "Caller is not the current owner of this Medicine batch");
            }
            // State check is implicitly handled by the Medicine contract's setConsumedOrSold function (requires AtCustomer)

            // Action: Call the Medicine contract
            med.setConsumedOrSold();

            bytes32 dataHash = keccak256(abi.encode("FINALIZED", msg.sender));
            // Log the event via the dedicated logger
            logger.createLogEntry(msg.sender, address(0), "Medicine Consumed/Sold", _latitude, _longitude, dataHash);
            // Emit the central SupplyChain event
            emit BatchFinalized(_batchAddress, msg.sender, block.timestamp);

        } catch Error(string memory reason) {
            // Catch specific errors from the Medicine contract call
            revert SC_ExternalCallFailed(_batchAddress, string(abi.encodePacked("Medicine finalizeMedicineBatch call failed: ", reason)));
        } catch {
             // Generic failure likely indicates not a Medicine batch or other low-level issue
             revert SC_ExternalCallFailed(_batchAddress, actionName);
        }
    }

    /**
     * @notice Marks a batch (RawMaterial or Medicine) as Destroyed.
     * @dev Authorized callers: Admin OR the current owner/supplier of the specific batch. Calls the batch contract.
     * @param _batchAddress Address of the RawMaterial or Medicine contract.
     * @param _reason Reason for destruction.
     * @param _latitude Latitude coordinate of destruction event.
     * @param _longitude Longitude coordinate of destruction event.
     */
    function markBatchDestroyed(
        address _batchAddress,
        string calldata _reason,
        string calldata _latitude,
        string calldata _longitude
    ) external {
        if (_batchAddress == address(0)) revert SC_InvalidAddress("batchAddress");
        address loggerAddress = transactionLoggerForBatch[_batchAddress];
        if (loggerAddress == address(0)) revert SC_LoggerNotFound(_batchAddress);
        Transactions logger = Transactions(loggerAddress);

        bool destroyed = false;
        bool isAdmin = hasRole(ADMIN_ROLE, msg.sender); // Check if caller is an Admin
        bytes32 dataHash = keccak256(abi.encode("DESTROYED", _reason));
        string memory actionName = "markBatchDestroyed";

        // --- Try RawMaterial ---
        try RawMaterial(_batchAddress).getStatus() { // Check contract exists and getStatus doesn't revert
            RawMaterial rm = RawMaterial(_batchAddress);
            // Authorization check: Must be Admin OR the original supplier of this batch
            if (!isAdmin && rm.supplier() != msg.sender) {
                revert SC_UnauthorizedActor(msg.sender, "Requires Admin role or must be the original Supplier for this RawMaterial");
            }
            // Action: Call the RawMaterial contract
            // Batch contract checks if already destroyed internally
            rm.setDestroyed(_reason);
            destroyed = true;
            // Log the event via the dedicated logger
            logger.createLogEntry(msg.sender, address(0), "RawMaterial Destroyed", _latitude, _longitude, dataHash);
        } catch Error(string memory reason) {
            // Catch specific reverts from RM if needed, otherwise treat as external fail
            revert SC_ExternalCallFailed(_batchAddress, string(abi.encodePacked("RawMaterial markBatchDestroyed call failed: ", reason)));
        } catch { /* Low-level failure, proceed */ }

        // --- Try Medicine ---
        if (!destroyed) {
            try Medicine(_batchAddress).getStatus() { // Check contract exists
                Medicine med = Medicine(_batchAddress);
                // Authorization check: Must be Admin OR the current owner of this batch
                if (!isAdmin && med.currentOwner() != msg.sender) {
                     revert SC_UnauthorizedActor(msg.sender, "Requires Admin role or must be the Current Owner for this Medicine");
                }
                // Action: Call the Medicine contract
                // Batch contract checks if already destroyed/finalized internally
                med.setDestroyed(_reason);
                destroyed = true;
                // Log the event via the dedicated logger
                logger.createLogEntry(msg.sender, address(0), "Medicine Destroyed", _latitude, _longitude, dataHash);
            } catch Error(string memory reason) {
                 revert SC_ExternalCallFailed(_batchAddress, string(abi.encodePacked("Medicine markBatchDestroyed call failed: ", reason)));
            } catch { /* Low-level failure */ }
        }

        // If neither call succeeded
        if (!destroyed) {
            revert SC_BatchTypeUnknownOrActionFailed(_batchAddress, actionName);
        }

        // Emit the central SupplyChain event
        emit BatchDestroyed(_batchAddress, msg.sender, _reason, block.timestamp);
    }


    // --- View Functions ---

    /**
     * @notice Retrieves details for a specific RawMaterial batch.
     * @param _batchAddress Address of the RawMaterial contract.
     * @return Various details including status, owner, etc.
     */
    function getRawMaterialDetails(address _batchAddress) external view returns (
        bytes32 description, uint quantity, address supplier, address intendedManufacturer,
        uint creationTime, RawMaterial.Status status, address currentTransporter,
        uint lastUpdateTime, address transactionLoggerAddr
    ) {
        if (_batchAddress == address(0)) revert SC_InvalidAddress("batchAddress");
        transactionLoggerAddr = transactionLoggerForBatch[_batchAddress];
        // No need to revert if logger not found here, let the batch call handle it
        // if (transactionLoggerAddr == address(0)) revert SC_LoggerNotFound(_batchAddress);

        // Let the external call handle if it's not a valid RawMaterial contract
        try RawMaterial(_batchAddress).getDetails() returns (
            bytes32 d, uint q, address s, address im, uint ct, RawMaterial.Status st, address tr, uint lu, address logger // logger from batch detail
        ) {
            // Return details fetched from the batch contract, plus the logger address from SC mapping
            return (d, q, s, im, ct, st, tr, lu, transactionLoggerAddr);
        } catch {
            revert SC_ExternalCallFailed(_batchAddress, "getRawMaterialDetails - Batch contract call failed");
        }
    }

    /**
     * @notice Retrieves details for a specific Medicine batch.
     * @param _batchAddress Address of the Medicine contract.
     * @return Various details including status, owner, expiry, etc.
     */
    function getMedicineDetails(address _batchAddress) external view returns (
        bytes32 description, uint quantity, address[] memory rawMaterialBatchIds, address manufacturer,
        uint creationTime, uint expiryDate, Medicine.Status status, address currentOwner,
        address currentTransporter, address currentDestination, uint lastUpdateTime, address transactionLoggerAddr
    ) {
        if (_batchAddress == address(0)) revert SC_InvalidAddress("batchAddress");
        transactionLoggerAddr = transactionLoggerForBatch[_batchAddress];
        // if (transactionLoggerAddr == address(0)) revert SC_LoggerNotFound(_batchAddress);

        try Medicine(_batchAddress).getDetails() returns (
            bytes32 d, uint q, address[] memory rmIds, address m, uint ct, uint exp, Medicine.Status st,
            address co, address tr, address cd, uint lu, address logger // logger from batch detail
        ) {
             // Return details fetched from the batch contract, plus the logger address from SC mapping
             return (d, q, rmIds, m, ct, exp, st, co, tr, cd, lu, transactionLoggerAddr);
        } catch {
             revert SC_ExternalCallFailed(_batchAddress, "getMedicineDetails - Batch contract call failed");
        }
    }

    /**
     * @notice Retrieves the complete transaction history for a specific batch from its dedicated logger.
     * @param _batchAddress Address of the RawMaterial or Medicine contract.
     * @return An array of TxnLog structs.
     * @dev Be mindful of potential high gas costs for batches with very long histories.
     */
    function getTransactionHistory(address _batchAddress) external view returns (Transactions.TxnLog[] memory) {
        if (_batchAddress == address(0)) revert SC_InvalidAddress("batchAddress");
        address loggerAddress = transactionLoggerForBatch[_batchAddress];
        if (loggerAddress == address(0)) revert SC_LoggerNotFound(_batchAddress); // Must have logger for history

        try Transactions(loggerAddress).getAllLogEntries() returns (Transactions.TxnLog[] memory logs) {
            return logs;
        } catch {
            revert SC_ExternalCallFailed(loggerAddress, "getAllLogEntries - Logger contract call failed");
        }
    }

    /**
     * @notice Utility function to get the internal bytes32 representation of a role name string.
     * @param _roleName The string name of the role (e.g., "SUPPLIER_ROLE").
     * @return The bytes32 hash used for the role internally.
     */
    function getRoleIdentifier(string calldata _roleName) external pure returns (bytes32) {
        bytes32 roleHash = keccak256(abi.encodePacked(_roleName));
        // Check against predefined constants for validation
        if (roleHash == ADMIN_ROLE ||
            roleHash == SUPPLIER_ROLE ||
            roleHash == TRANSPORTER_ROLE ||
            roleHash == MANUFACTURER_ROLE ||
            roleHash == WHOLESALER_ROLE ||
            roleHash == DISTRIBUTOR_ROLE ||
            roleHash == CUSTOMER_ROLE)
        {
            return roleHash;
        }
        revert SC_ArgumentError("Unknown role name provided");
    }
}