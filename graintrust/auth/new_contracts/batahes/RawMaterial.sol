// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract RawMaterial {
    error RM_UnauthorizedCaller(address caller, address expected);
    error RM_UnauthorizedRole(address caller, bytes32 requiredRole);
    error RM_InvalidStateForAction(Status current, Status required);
    error RM_InvalidAddress(string context);
    error RM_ReceiverMismatch(address expected, address actual);
    error RM_AlreadyDestroyed();
    error RM_ContractPaused();
    error RM_BatchAlreadyRecalled();
    error RM_InsufficientQuantityForSplit();
    error RM_InvalidQualityGrade();
    error RM_TemperatureOutOfRange();
    error RM_CertificationExpired();
    error RM_InvalidTestResult();
    error RM_QuantityMustBePositive();
    error RM_ExpiryNotInFuture();

    enum Status { 
        Created, InTransit, Received, Destroyed, Recalled, 
        UnderTesting, Quarantined, Approved, Rejected 
    }

    enum QualityGrade { Premium, Standard, Basic, Substandard, Rejected }
    
    enum TestType { Purity, Potency, Contamination, Identity, Moisture }
    
    enum CertificationType { GMP, ISO, FDA, Halal, Organic }

    struct QualityTest {
        TestType testType;
        uint256 result;
        uint256 expectedMin;
        uint256 expectedMax;
        bool passed;
        address tester;
        uint timestamp;
        string remarks;
    }

    struct Certification {
        CertificationType certType;
        string certificationId;
        address issuer;
        uint issueDate;
        uint expiryDate;
        bool isValid;
    }

    struct EnvironmentalCondition {
        int256 temperature;
        uint256 humidity;
        uint256 pressure;
        uint256 lightExposure;
        uint timestamp;
        bool withinLimits;
    }

    struct SplitOperation {
        address parentBatch;
        address[] childBatches;
        uint[] quantities;
        string reason;
        uint timestamp;
    }

    struct OriginTrace {
        string farmLocation;
        string harvestDate;
        string processingFacility;
        string[] processingSteps;
        mapping(string => string) additionalMetadata;
    }

    bytes32 public constant TESTER_ROLE = keccak256("TESTER_ROLE");
    bytes32 public constant CERTIFIER_ROLE = keccak256("CERTIFIER_ROLE");
    bytes32 public constant TRANSPORTER_ROLE = keccak256("TRANSPORTER_ROLE");
    bytes32 public constant EMERGENCY_ROLE = keccak256("EMERGENCY_ROLE");
    bytes32 public constant INSPECTOR_ROLE = keccak256("INSPECTOR_ROLE");

    address public immutable batchId;
    address public immutable supplyChainContract;
    address public immutable transactionLogger;

    bytes32 public immutable description;
    uint public quantity;
    address public immutable supplier;
    address public immutable intendedManufacturer;
    uint public immutable creationTime;
    uint public immutable expiryDate;
    string public materialType;
    string public sourceCountry;

    Status public status;
    address public currentTransporter;
    uint public lastUpdateTime;
    QualityGrade public currentGrade;

    bool public isPaused;
    bool public isRecalled;
    string public recallReason;
    uint public recallTimestamp;

    QualityTest[] public qualityTests;
    Certification[] public certifications;
    EnvironmentalCondition[] public environmentalHistory;
    SplitOperation[] public splitHistory;
    OriginTrace public originTrace;

    mapping(address => mapping(bytes32 => bool)) public hasRole;
    mapping(address => bool) public authorizedCallers;
    mapping(TestType => QualityTest) public latestTestResults;

    event StatusChanged(Status indexed newStatus, uint timestamp);
    event TransporterAssigned(address indexed transporter, uint timestamp);
    event BatchDestroyed(string reason, uint timestamp);
    event BatchRecalled(string indexed reason, uint timestamp);
    event QualityTested(TestType indexed testType, bool passed, address indexed tester, uint timestamp);
    event CertificationAdded(CertificationType indexed certType, address indexed issuer, uint timestamp);
    event CertificationExpired(CertificationType indexed certType, uint timestamp);
    event EnvironmentalConditionRecorded(int256 temperature, uint256 humidity, bool withinLimits, uint timestamp);
    event BatchSplit(address indexed parentBatch, address[] childBatches, uint[] quantities, uint timestamp);
    event GradeChanged(QualityGrade indexed oldGrade, QualityGrade indexed newGrade, uint timestamp);
    event EmergencyPaused(address indexed caller, uint timestamp);
    event EmergencyUnpaused(address indexed caller, uint timestamp);
    event RoleGranted(bytes32 indexed role, address indexed account, uint timestamp);
    event RoleRevoked(bytes32 indexed role, address indexed account, uint timestamp);

    modifier onlyAuthorized() {
        if (msg.sender != supplyChainContract && !authorizedCallers[msg.sender]) {
            revert RM_UnauthorizedCaller(msg.sender, supplyChainContract);
        }
        _;
    }

    modifier onlyRole(bytes32 role) {
        if (!hasRole[msg.sender][role] && msg.sender != supplyChainContract) {
            revert RM_UnauthorizedRole(msg.sender, role);
        }
        _;
    }

    modifier whenNotPaused() {
        if (isPaused) revert RM_ContractPaused();
        _;
    }

    modifier whenNotRecalled() {
        if (isRecalled) revert RM_BatchAlreadyRecalled();
        _;
    }

    constructor(
        address _supplyChainContract,
        address _transactionLogger,
        bytes32 _description,
        uint _quantity,
        address _supplier,
        address _intendedManufacturer,
        uint _expiryDate,
        string memory _materialType,
        string memory _sourceCountry
    ) {
        if (_supplyChainContract == address(0)) revert RM_InvalidAddress("SupplyChainContract");
        if (_transactionLogger == address(0)) revert RM_InvalidAddress("TransactionLogger");
        if (_supplier == address(0)) revert RM_InvalidAddress("Supplier");
        if (_intendedManufacturer == address(0)) revert RM_InvalidAddress("IntendedManufacturer");
        if (_quantity == 0) revert RM_QuantityMustBePositive();
        if (_expiryDate <= block.timestamp) revert RM_ExpiryNotInFuture();

        batchId = address(this);
        supplyChainContract = _supplyChainContract;
        transactionLogger = _transactionLogger;
        description = _description;
        quantity = _quantity;
        supplier = _supplier;
        intendedManufacturer = _intendedManufacturer;
        expiryDate = _expiryDate;
        materialType = _materialType;
        sourceCountry = _sourceCountry;
        creationTime = block.timestamp;

        status = Status.Created;
        currentGrade = QualityGrade.Standard;
        lastUpdateTime = block.timestamp;

        authorizedCallers[_supplyChainContract] = true;
        hasRole[_supplier][EMERGENCY_ROLE] = true;

        emit StatusChanged(status, lastUpdateTime);
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

    function setInTransit(address _transporter) external onlyAuthorized whenNotPaused whenNotRecalled {
        if (status != Status.Created && status != Status.Approved) {
            revert RM_InvalidStateForAction(status, Status.Created);
        }
        if (_transporter == address(0)) {
            revert RM_InvalidAddress("transporter");
        }

        status = Status.InTransit;
        currentTransporter = _transporter;
        lastUpdateTime = block.timestamp;

        emit TransporterAssigned(_transporter, lastUpdateTime);
        emit StatusChanged(status, lastUpdateTime);
    }

    function setReceived(address _receiver) external onlyAuthorized whenNotPaused whenNotRecalled {
        if (msg.sender != supplyChainContract) {
            revert RM_UnauthorizedCaller(msg.sender, supplyChainContract);
        }
        if (status != Status.InTransit) {
            revert RM_InvalidStateForAction(status, Status.InTransit);
        }
        if (_receiver == address(0)) {
            revert RM_InvalidAddress("receiver");
        }
        if (_receiver != intendedManufacturer) {
            revert RM_ReceiverMismatch(intendedManufacturer, _receiver);
        }

        status = Status.Received;
        currentTransporter = address(0);
        lastUpdateTime = block.timestamp;

        emit StatusChanged(status, lastUpdateTime);
    }

    function setDestroyed(string calldata _reason) external onlyAuthorized whenNotPaused {
        if (status == Status.Destroyed) {
            revert RM_AlreadyDestroyed();
        }

        status = Status.Destroyed;
        currentTransporter = address(0);
        lastUpdateTime = block.timestamp;

        emit BatchDestroyed(_reason, lastUpdateTime);
        emit StatusChanged(status, lastUpdateTime);
    }

    function recallBatch(string calldata _reason) external onlyRole(EMERGENCY_ROLE) whenNotPaused {
        if (isRecalled) revert RM_BatchAlreadyRecalled();
        if (status == Status.Destroyed) revert RM_AlreadyDestroyed();

        isRecalled = true;
        recallReason = _reason;
        recallTimestamp = block.timestamp;
        status = Status.Recalled;
        lastUpdateTime = block.timestamp;

        emit BatchRecalled(_reason, recallTimestamp);
        emit StatusChanged(status, lastUpdateTime);
    }

    function performQualityTest(
        TestType _testType,
        uint256 _result,
        uint256 _expectedMin,
        uint256 _expectedMax,
        string calldata _remarks
    ) external onlyRole(TESTER_ROLE) whenNotPaused whenNotRecalled {
        bool passed = _result >= _expectedMin && _result <= _expectedMax;
        
        QualityTest memory newTest = QualityTest({
            testType: _testType,
            result: _result,
            expectedMin: _expectedMin,
            expectedMax: _expectedMax,
            passed: passed,
            tester: msg.sender,
            timestamp: block.timestamp,
            remarks: _remarks
        });

        qualityTests.push(newTest);
        latestTestResults[_testType] = newTest;

        if (!passed) {
            status = Status.UnderTesting;
            QualityGrade oldGrade = currentGrade;
            currentGrade = QualityGrade.Rejected;
            emit GradeChanged(oldGrade, currentGrade, block.timestamp);
        } else if (status == Status.UnderTesting) {
            status = Status.Approved;
        }

        lastUpdateTime = block.timestamp;
        emit QualityTested(_testType, passed, msg.sender, block.timestamp);
        emit StatusChanged(status, lastUpdateTime);
    }

    function addCertification(
        CertificationType _certType,
        string calldata _certificationId,
        address _issuer,
        uint _expiryDate
    ) external onlyRole(CERTIFIER_ROLE) whenNotPaused {
        Certification memory newCert = Certification({
            certType: _certType,
            certificationId: _certificationId,
            issuer: _issuer,
            issueDate: block.timestamp,
            expiryDate: _expiryDate,
            isValid: true
        });

        certifications.push(newCert);
        emit CertificationAdded(_certType, _issuer, block.timestamp);
    }

    function recordEnvironmentalCondition(
        int256 _temperature,
        uint256 _humidity,
        uint256 _pressure,
        uint256 _lightExposure
    ) external onlyRole(TRANSPORTER_ROLE) whenNotPaused {
        bool withinLimits = _temperature >= -20 && _temperature <= 25 && 
                           _humidity <= 60 && _pressure >= 900 && _pressure <= 1100;

        EnvironmentalCondition memory condition = EnvironmentalCondition({
            temperature: _temperature,
            humidity: _humidity,
            pressure: _pressure,
            lightExposure: _lightExposure,
            timestamp: block.timestamp,
            withinLimits: withinLimits
        });

        environmentalHistory.push(condition);
        emit EnvironmentalConditionRecorded(_temperature, _humidity, withinLimits, block.timestamp);
    }

    function splitBatch(
        uint[] calldata _quantities,
        address[] calldata _childBatches,
        string calldata _reason
    ) external onlyAuthorized whenNotPaused whenNotRecalled {
        uint totalSplitQuantity = 0;
        for (uint i = 0; i < _quantities.length; i++) {
            totalSplitQuantity += _quantities[i];
        }
        
        if (totalSplitQuantity > quantity) revert RM_InsufficientQuantityForSplit();
        if (_quantities.length != _childBatches.length) revert RM_InvalidAddress("childBatches");

        quantity -= totalSplitQuantity;

        SplitOperation memory splitOp = SplitOperation({
            parentBatch: address(this),
            childBatches: _childBatches,
            quantities: _quantities,
            reason: _reason,
            timestamp: block.timestamp
        });

        splitHistory.push(splitOp);
        emit BatchSplit(address(this), _childBatches, _quantities, block.timestamp);
    }

    function updateGrade(QualityGrade _newGrade) external onlyRole(INSPECTOR_ROLE) whenNotPaused {
        QualityGrade oldGrade = currentGrade;
        currentGrade = _newGrade;
        lastUpdateTime = block.timestamp;
        
        emit GradeChanged(oldGrade, _newGrade, block.timestamp);
    }

    function setOriginTrace(
        string calldata _farmLocation,
        string calldata _harvestDate,
        string calldata _processingFacility,
        string[] calldata _processingSteps
    ) external onlyAuthorized {
        originTrace.farmLocation = _farmLocation;
        originTrace.harvestDate = _harvestDate;
        originTrace.processingFacility = _processingFacility;
        originTrace.processingSteps = _processingSteps;
    }

    function getDetails() external view returns (
        bytes32 _description,
        uint _quantity,
        address _supplier,
        address _intendedManufacturer,
        uint _creationTime,
        uint _expiryDate,
        Status _status,
        address _currentTransporter,
        uint _lastUpdateTime,
        address _transactionLoggerAddr,
        QualityGrade _currentGrade,
        bool _isPaused,
        bool _isRecalled,
        string memory _materialType,
        string memory _sourceCountry
    ) {
        return (
            description, quantity, supplier, intendedManufacturer, creationTime,
            expiryDate, status, currentTransporter, lastUpdateTime, transactionLogger,
            currentGrade, isPaused, isRecalled, materialType, sourceCountry
        );
    }

    function getQualityTests() external view returns (QualityTest[] memory) {
        return qualityTests;
    }

    function getCertifications() external view returns (Certification[] memory) {
        return certifications;
    }

    function getEnvironmentalHistory() external view returns (EnvironmentalCondition[] memory) {
        return environmentalHistory;
    }

    function getSplitHistory() external view returns (SplitOperation[] memory) {
        return splitHistory;
    }

    function getLatestTestResult(TestType _testType) external view returns (QualityTest memory) {
        return latestTestResults[_testType];
    }

    function getOriginTrace() external view returns (
        string memory _farmLocation,
        string memory _harvestDate,
        string memory _processingFacility,
        string[] memory _processingSteps
    ) {
        return (
            originTrace.farmLocation,
            originTrace.harvestDate,
            originTrace.processingFacility,
            originTrace.processingSteps
        );
    }

    function getStatus() external view returns (Status) {
        return status;
    }

    function isExpired() external view returns (bool) {
        return block.timestamp > expiryDate;
    }

    function hasValidCertifications() external view returns (bool) {
        for (uint i = 0; i < certifications.length; i++) {
            if (certifications[i].isValid && certifications[i].expiryDate > block.timestamp) {
                return true;
            }
        }
        return false;
    }

    function hasPassedAllTests() external view returns (bool) {
        for (uint i = 0; i < qualityTests.length; i++) {
            if (!qualityTests[i].passed) {
                return false;
            }
        }
        return qualityTests.length > 0;
    }

    function getEnvironmentalCompliance() external view returns (bool) {
        if (environmentalHistory.length == 0) return true;
        
        for (uint i = 0; i < environmentalHistory.length; i++) {
            if (!environmentalHistory[i].withinLimits) {
                return false;
            }
        }
        return true;
    }
}