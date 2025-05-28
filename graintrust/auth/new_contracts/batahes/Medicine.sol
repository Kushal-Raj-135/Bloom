// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Medicine {
    error Med_UnauthorizedCaller(address caller, address expected);
    error Med_UnauthorizedRole(address caller, bytes32 requiredRole);
    error Med_InvalidStateForAction(Status current, Status required);
    error Med_InvalidStateTransition(Status current, Status target);
    error Med_InvalidAddress(string context);
    error Med_ReceiverMismatch(address expected, address actual);
    error Med_AlreadyDestroyedOrFinalized();
    error Med_QuantityMustBePositive();
    error Med_ExpiryNotInFuture();
    error Med_RawMaterialArrayEmpty();
    error Med_ContractPaused();
    error Med_BatchAlreadyRecalled();
    error Med_InsufficientQuantityForSplit();
    error Med_InvalidQualityGrade();
    error Med_TemperatureOutOfRange();
    error Med_InvalidMergeOperation();
    error Med_BatchNotFound();

    enum Status { 
        Created, InTransitToW, AtWholesaler, InTransitToD, 
        AtDistributor, InTransitToC, AtCustomer, ConsumedOrSold, 
        Destroyed, Recalled, UnderInspection 
    }

    enum QualityGrade { A, B, C, D, Rejected }
    
    enum ConditionType { Temperature, Humidity, Pressure, Light }

    struct QualityRecord {
        QualityGrade grade;
        address inspector;
        string remarks;
        uint timestamp;
    }

    struct ConditionReading {
        ConditionType conditionType;
        int256 value;
        int256 minThreshold;
        int256 maxThreshold;
        uint timestamp;
        bool withinRange;
    }

    struct SplitRecord {
        address parentBatch;
        address[] childBatches;
        uint[] quantities;
        uint timestamp;
    }

    struct MergeRecord {
        address[] parentBatches;
        address resultBatch;
        uint timestamp;
    }

    bytes32 public constant INSPECTOR_ROLE = keccak256("INSPECTOR_ROLE");
    bytes32 public constant TRANSPORTER_ROLE = keccak256("TRANSPORTER_ROLE");
    bytes32 public constant EMERGENCY_ROLE = keccak256("EMERGENCY_ROLE");

    address public immutable batchId;
    address public immutable supplyChainContract;
    address public immutable transactionLogger;

    bytes32 public immutable description;
    uint public quantity;
    address[] public rawMaterialBatchIds;
    address public immutable manufacturer;
    uint public immutable creationTime;
    uint public immutable expiryDate;

    Status public status;
    address public currentOwner;
    address public currentTransporter;
    address public currentDestination;
    uint public lastUpdateTime;

    bool public isPaused;
    bool public isRecalled;
    string public recallReason;
    uint public recallTimestamp;

    QualityRecord[] public qualityHistory;
    ConditionReading[] public conditionHistory;
    SplitRecord public splitRecord;
    MergeRecord public mergeRecord;

    mapping(address => mapping(bytes32 => bool)) public hasRole;
    mapping(address => bool) public authorizedCallers;

    event StatusChanged(Status indexed newStatus, uint timestamp);
    event OwnershipTransferred(address indexed from, address indexed to, uint timestamp);
    event TransporterAssigned(address indexed transporter, address indexed destination, uint timestamp);
    event BatchDestroyed(string reason, uint timestamp);
    event BatchFinalized(uint timestamp);
    event BatchRecalled(string indexed reason, uint timestamp);
    event QualityInspected(QualityGrade indexed grade, address indexed inspector, uint timestamp);
    event ConditionRecorded(ConditionType indexed conditionType, int256 value, bool withinRange, uint timestamp);
    event BatchSplit(address indexed parentBatch, address[] childBatches, uint[] quantities, uint timestamp);
    event BatchMerged(address[] parentBatches, address indexed resultBatch, uint timestamp);
    event EmergencyPaused(address indexed caller, uint timestamp);
    event EmergencyUnpaused(address indexed caller, uint timestamp);
    event RoleGranted(bytes32 indexed role, address indexed account, uint timestamp);
    event RoleRevoked(bytes32 indexed role, address indexed account, uint timestamp);

    modifier onlyAuthorized() {
        if (msg.sender != supplyChainContract && !authorizedCallers[msg.sender]) {
            revert Med_UnauthorizedCaller(msg.sender, supplyChainContract);
        }
        _;
    }

    modifier onlyRole(bytes32 role) {
        if (!hasRole[msg.sender][role] && msg.sender != supplyChainContract) {
            revert Med_UnauthorizedRole(msg.sender, role);
        }
        _;
    }

    modifier whenNotPaused() {
        if (isPaused) revert Med_ContractPaused();
        _;
    }

    modifier whenNotRecalled() {
        if (isRecalled) revert Med_BatchAlreadyRecalled();
        _;
    }

    constructor(
        address _supplyChainContract,
        address _transactionLogger,
        bytes32 _description,
        uint _quantity,
        address[] calldata _rawMaterialBatchIds,
        address _manufacturer,
        uint _expiryDate
    ) {
        if (_supplyChainContract == address(0)) revert Med_InvalidAddress("SupplyChainContract");
        if (_transactionLogger == address(0)) revert Med_InvalidAddress("TransactionLogger");
        if (_manufacturer == address(0)) revert Med_InvalidAddress("Manufacturer");
        if (_rawMaterialBatchIds.length == 0) revert Med_RawMaterialArrayEmpty();
        if (_quantity == 0) revert Med_QuantityMustBePositive();
        if (_expiryDate <= block.timestamp) revert Med_ExpiryNotInFuture();

        batchId = address(this);
        supplyChainContract = _supplyChainContract;
        transactionLogger = _transactionLogger;
        description = _description;
        quantity = _quantity;
        rawMaterialBatchIds = _rawMaterialBatchIds;
        manufacturer = _manufacturer;
        expiryDate = _expiryDate;
        creationTime = block.timestamp;

        status = Status.Created;
        currentOwner = _manufacturer;
        lastUpdateTime = block.timestamp;

        authorizedCallers[_supplyChainContract] = true;
        hasRole[_manufacturer][EMERGENCY_ROLE] = true;

        emit StatusChanged(status, lastUpdateTime);
        emit OwnershipTransferred(address(0), currentOwner, lastUpdateTime);
    }

    function grantRole(bytes32 role, address account) external onlyAuthorized {
        hasRole[account][role] = true;
        emit RoleGranted(role, account, block.timestamp);
    }

    function revokeRole(bytes32 role, address account) external onlyAuthorized {
        hasRole[account][role] = false;
        emit RoleRevoked(role, account, block.timestamp);
    }

    function pauseContract() external onlyRole(EMERGENCY_ROLE) {
        isPaused = true;
        emit EmergencyPaused(msg.sender, block.timestamp);
    }

    function unpauseContract() external onlyRole(EMERGENCY_ROLE) {
        isPaused = false;
        emit EmergencyUnpaused(msg.sender, block.timestamp);
    }

    function setInTransit(Status _nextStatus, address _transporter, address _destination) 
        external onlyAuthorized whenNotPaused whenNotRecalled {
        if (_transporter == address(0)) revert Med_InvalidAddress("transporter");
        if (_destination == address(0)) revert Med_InvalidAddress("destination");

        bool isValidStart = false;
        if (status == Status.Created && (_nextStatus == Status.InTransitToW || _nextStatus == Status.InTransitToD)) isValidStart = true;
        else if (status == Status.AtWholesaler && _nextStatus == Status.InTransitToD) isValidStart = true;
        else if (status == Status.AtDistributor && _nextStatus == Status.InTransitToC) isValidStart = true;

        if (!isValidStart) {
            revert Med_InvalidStateTransition(status, _nextStatus);
        }

        status = _nextStatus;
        currentTransporter = _transporter;
        currentDestination = _destination;
        lastUpdateTime = block.timestamp;

        emit TransporterAssigned(_transporter, _destination, lastUpdateTime);
        emit StatusChanged(status, lastUpdateTime);
    }

    function setReceived(Status _nextStatus, address _receiver) 
        external onlyAuthorized whenNotPaused whenNotRecalled {
        if (_receiver == address(0)) revert Med_InvalidAddress("receiver");
        if (_receiver != currentDestination) {
            revert Med_ReceiverMismatch(currentDestination, _receiver);
        }

        bool isValidArrival = false;
        if (status == Status.InTransitToW && _nextStatus == Status.AtWholesaler) isValidArrival = true;
        else if (status == Status.InTransitToD && _nextStatus == Status.AtDistributor) isValidArrival = true;
        else if (status == Status.InTransitToC && _nextStatus == Status.AtCustomer) isValidArrival = true;

        if (!isValidArrival) {
            revert Med_InvalidStateTransition(status, _nextStatus);
        }

        address previousOwner = currentOwner;
        status = _nextStatus;
        currentOwner = _receiver;
        currentTransporter = address(0);
        currentDestination = address(0);
        lastUpdateTime = block.timestamp;

        emit OwnershipTransferred(previousOwner, currentOwner, lastUpdateTime);
        emit StatusChanged(status, lastUpdateTime);
    }

    function setConsumedOrSold() external onlyAuthorized whenNotPaused whenNotRecalled {
        if (status != Status.AtCustomer) {
            revert Med_InvalidStateForAction(status, Status.AtCustomer);
        }

        status = Status.ConsumedOrSold;
        lastUpdateTime = block.timestamp;

        emit BatchFinalized(lastUpdateTime);
        emit StatusChanged(status, lastUpdateTime);
    }

    function setDestroyed(string calldata _reason) external onlyAuthorized whenNotPaused {
        if (status == Status.Destroyed || status == Status.ConsumedOrSold) {
            revert Med_AlreadyDestroyedOrFinalized();
        }

        address previousOwner = currentOwner;
        status = Status.Destroyed;
        currentOwner = address(0);
        currentTransporter = address(0);
        currentDestination = address(0);
        lastUpdateTime = block.timestamp;

        emit BatchDestroyed(_reason, lastUpdateTime);
        if (previousOwner != address(0)) {
            emit OwnershipTransferred(previousOwner, address(0), lastUpdateTime);
        }
        emit StatusChanged(status, lastUpdateTime);
    }

    function recallBatch(string calldata _reason) external onlyRole(EMERGENCY_ROLE) whenNotPaused {
        if (isRecalled) revert Med_BatchAlreadyRecalled();
        if (status == Status.Destroyed || status == Status.ConsumedOrSold) {
            revert Med_AlreadyDestroyedOrFinalized();
        }

        isRecalled = true;
        recallReason = _reason;
        recallTimestamp = block.timestamp;
        status = Status.Recalled;
        lastUpdateTime = block.timestamp;

        emit BatchRecalled(_reason, recallTimestamp);
        emit StatusChanged(status, lastUpdateTime);
    }

    function inspectQuality(QualityGrade _grade, string calldata _remarks) 
        external onlyRole(INSPECTOR_ROLE) whenNotPaused whenNotRecalled {
        QualityRecord memory newRecord = QualityRecord({
            grade: _grade,
            inspector: msg.sender,
            remarks: _remarks,
            timestamp: block.timestamp
        });

        qualityHistory.push(newRecord);
        
        if (_grade == QualityGrade.Rejected) {
            status = Status.UnderInspection;
            lastUpdateTime = block.timestamp;
            emit StatusChanged(status, lastUpdateTime);
        }

        emit QualityInspected(_grade, msg.sender, block.timestamp);
    }

    function recordCondition(
        ConditionType _conditionType,
        int256 _value,
        int256 _minThreshold,
        int256 _maxThreshold
    ) external onlyRole(TRANSPORTER_ROLE) whenNotPaused whenNotRecalled {
        bool withinRange = _value >= _minThreshold && _value <= _maxThreshold;
        
        ConditionReading memory newReading = ConditionReading({
            conditionType: _conditionType,
            value: _value,
            minThreshold: _minThreshold,
            maxThreshold: _maxThreshold,
            timestamp: block.timestamp,
            withinRange: withinRange
        });

        conditionHistory.push(newReading);
        emit ConditionRecorded(_conditionType, _value, withinRange, block.timestamp);
    }

    function splitBatch(uint[] calldata _quantities, address[] calldata _childBatches) 
        external onlyAuthorized whenNotPaused whenNotRecalled {
        uint totalSplitQuantity = 0;
        for (uint i = 0; i < _quantities.length; i++) {
            totalSplitQuantity += _quantities[i];
        }
        
        if (totalSplitQuantity > quantity) revert Med_InsufficientQuantityForSplit();
        if (_quantities.length != _childBatches.length) revert Med_InvalidAddress("childBatches");

        quantity -= totalSplitQuantity;

        splitRecord = SplitRecord({
            parentBatch: address(this),
            childBatches: _childBatches,
            quantities: _quantities,
            timestamp: block.timestamp
        });

        emit BatchSplit(address(this), _childBatches, _quantities, block.timestamp);
    }

    function mergeBatches(address[] calldata _parentBatches, address _resultBatch) 
        external onlyAuthorized whenNotPaused whenNotRecalled {
        mergeRecord = MergeRecord({
            parentBatches: _parentBatches,
            resultBatch: _resultBatch,
            timestamp: block.timestamp
        });

        emit BatchMerged(_parentBatches, _resultBatch, block.timestamp);
    }

    function getDetails() external view returns (
        bytes32 _description, uint _quantity, address[] memory _rawMaterialBatchIds,
        address _manufacturer, uint _creationTime, uint _expiryDate, Status _status,
        address _currentOwner, address _currentTransporter, address _currentDestination,
        uint _lastUpdateTime, address _transactionLoggerAddr, bool _isPaused, bool _isRecalled
    ) {
        return (
            description, quantity, rawMaterialBatchIds, manufacturer, creationTime,
            expiryDate, status, currentOwner, currentTransporter, currentDestination,
            lastUpdateTime, transactionLogger, isPaused, isRecalled
        );
    }

    function getQualityHistory() external view returns (QualityRecord[] memory) {
        return qualityHistory;
    }

    function getConditionHistory() external view returns (ConditionReading[] memory) {
        return conditionHistory;
    }

    function getLatestQuality() external view returns (QualityRecord memory) {
        if (qualityHistory.length == 0) {
            return QualityRecord(QualityGrade.A, address(0), "", 0);
        }
        return qualityHistory[qualityHistory.length - 1];
    }

    function getSplitRecord() external view returns (SplitRecord memory) {
        return splitRecord;
    }

    function getMergeRecord() external view returns (MergeRecord memory) {
        return mergeRecord;
    }

    function getStatus() external view returns (Status) {
        return status;
    }

    function isExpired() external view returns (bool) {
        return block.timestamp > expiryDate;
    }

    function hasValidConditions() external view returns (bool) {
        if (conditionHistory.length == 0) return true;
        
        for (uint i = 0; i < conditionHistory.length; i++) {
            if (!conditionHistory[i].withinRange) {
                return false;
            }
        }
        return true;
    }
}