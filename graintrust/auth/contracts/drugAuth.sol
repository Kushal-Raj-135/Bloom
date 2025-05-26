// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

/**
 * @title DrugRegistry
 * @dev A comprehensive drug registry system for pharmaceutical tracking
 * @dev Self-contained version without external dependencies
 */
contract DrugRegistry {
    // Owner functionality (replaces OpenZeppelin Ownable)
    address private _owner;

    enum DrugStatus { Active, Suspended, Recalled, Expired }

    struct Drug {
        string drugname;
        string dosage;
        string sideeffect;
        uint256 proddate;      // Changed to timestamp
        uint256 expirydate;    // Changed to timestamp
        address producedby;
        uint256 timestamp;
        DrugStatus status;
        uint256 version;       // For tracking updates
    }

    struct Company {
        string name;
        bool isActive;
        uint256 registrationDate;
        uint256 drugCount;
    }

    // Company management
    mapping(address => Company) private companies;
    address[] private companiesList;
    mapping(address => bool) private companyExists;

    // Drug management
    mapping(string => Drug) private drugs;
    string[] private drugCodesList;
    mapping(string => bool) private drugCodeExists;
    
    // Access control for drug queries
    mapping(address => bool) private authorizedViewers;

    // Constants
    uint256 public constant MAX_STRING_LENGTH = 200;
    uint256 public constant MIN_PRODUCTION_TO_EXPIRY_DAYS = 30; // Minimum 30 days shelf life

    // Events
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event CompanyAdded(address indexed companyAddress, string name, uint256 timestamp);
    event CompanyStatusChanged(address indexed companyAddress, bool isActive);
    event DrugAdded(
        string indexed drugcode,
        address indexed producer,
        string drugname,
        uint256 timestamp
    );
    event DrugUpdated(
        string indexed drugcode,
        address indexed updatedBy,
        uint256 version,
        uint256 timestamp
    );
    event DrugStatusChanged(
        string indexed drugcode,
        DrugStatus oldStatus,
        DrugStatus newStatus,
        address indexed changedBy
    );
    event ViewerAuthorized(address indexed viewer, bool authorized);

    // Custom errors
    error OnlyOwner();
    error CompanyAlreadyRegistered();
    error CompanyNotRegistered();
    error CompanyNotActive();
    error DrugCodeAlreadyExists();
    error DrugCodeNotFound();
    error InvalidStringLength();
    error InvalidDateRange();
    error UnauthorizedViewer();
    error InvalidDrugStatus();
    error ZeroAddress();
    error NotAuthorizedToUpdate();

    constructor() {
        _transferOwnership(msg.sender);
        // Owner is automatically authorized to view drugs
        authorizedViewers[msg.sender] = true;
    }

    // Owner functionality
    modifier onlyOwner() {
        if (msg.sender != _owner) {
            revert OnlyOwner();
        }
        _;
    }

    function owner() public view returns (address) {
        return _owner;
    }

    function transferOwnership(address newOwner) public onlyOwner {
        if (newOwner == address(0)) {
            revert ZeroAddress();
        }
        _transferOwnership(newOwner);
    }

    function _transferOwnership(address newOwner) internal {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }

    function renounceOwnership() public onlyOwner {
        _transferOwnership(address(0));
    }

    // Modifiers
    modifier onlyRegisteredCompany() {
        if (!companyExists[msg.sender] || !companies[msg.sender].isActive) {
            revert CompanyNotActive();
        }
        _;
    }

    modifier onlyAuthorizedViewer() {
        if (!authorizedViewers[msg.sender]) {
            revert UnauthorizedViewer();
        }
        _;
    }

    modifier validStringLength(string memory _str) {
        if (bytes(_str).length == 0 || bytes(_str).length > MAX_STRING_LENGTH) {
            revert InvalidStringLength();
        }
        _;
    }

    modifier drugExists(string memory _drugcode) {
        if (!drugCodeExists[_drugcode]) {
            revert DrugCodeNotFound();
        }
        _;
    }

    // Company management functions
    function addCompany(
        address _address,
        string memory _companyname
    ) 
        external 
        onlyOwner 
        validStringLength(_companyname)
    {
        if (_address == address(0)) {
            revert ZeroAddress();
        }
        if (companyExists[_address]) {
            revert CompanyAlreadyRegistered();
        }

        companies[_address] = Company({
            name: _companyname,
            isActive: true,
            registrationDate: block.timestamp,
            drugCount: 0
        });
        
        companiesList.push(_address);
        companyExists[_address] = true;
        
        emit CompanyAdded(_address, _companyname, block.timestamp);
    }

    function setCompanyStatus(address _address, bool _isActive) 
        external 
        onlyOwner 
    {
        if (!companyExists[_address]) {
            revert CompanyNotRegistered();
        }

        companies[_address].isActive = _isActive;
        emit CompanyStatusChanged(_address, _isActive);
    }

    // Viewer authorization
    function authorizeViewer(address _viewer, bool _authorized) 
        external 
        onlyOwner 
    {
        if (_viewer == address(0)) {
            revert ZeroAddress();
        }
        authorizedViewers[_viewer] = _authorized;
        emit ViewerAuthorized(_viewer, _authorized);
    }

    // Drug registration and management
    function addDrug(
        string memory _drugcode,
        string memory _drugname,
        string memory _dosage,
        string memory _sideeffect,
        uint256 _proddate,
        uint256 _expirydate
    ) 
        public 
        onlyRegisteredCompany
        validStringLength(_drugcode)
        validStringLength(_drugname)
        validStringLength(_dosage)
        validStringLength(_sideeffect)
    {
        if (drugCodeExists[_drugcode]) {
            revert DrugCodeAlreadyExists();
        }

        // Validate dates
        if (_proddate >= _expirydate || 
            _expirydate < _proddate + (MIN_PRODUCTION_TO_EXPIRY_DAYS * 1 days)) {
            revert InvalidDateRange();
        }

        drugs[_drugcode] = Drug({
            drugname: _drugname,
            dosage: _dosage,
            sideeffect: _sideeffect,
            proddate: _proddate,
            expirydate: _expirydate,
            producedby: msg.sender,
            timestamp: block.timestamp,
            status: DrugStatus.Active,
            version: 1
        });

        drugCodesList.push(_drugcode);
        drugCodeExists[_drugcode] = true;
        companies[msg.sender].drugCount++;

        emit DrugAdded(_drugcode, msg.sender, _drugname, block.timestamp);
    }

    function updateDrug(
        string memory _drugcode,
        string memory _drugname,
        string memory _dosage,
        string memory _sideeffect,
        uint256 _proddate,
        uint256 _expirydate
    ) 
        external 
        drugExists(_drugcode)
        validStringLength(_drugname)
        validStringLength(_dosage)
        validStringLength(_sideeffect)
    {
        Drug storage drug = drugs[_drugcode];
        
        // Only the producer or owner can update
        if (drug.producedby != msg.sender && msg.sender != _owner) {
            revert NotAuthorizedToUpdate();
        }

        // If not owner, must be registered company
        if (msg.sender != _owner && (!companyExists[msg.sender] || !companies[msg.sender].isActive)) {
            revert CompanyNotActive();
        }

        // Validate dates
        if (_proddate >= _expirydate || 
            _expirydate < _proddate + (MIN_PRODUCTION_TO_EXPIRY_DAYS * 1 days)) {
            revert InvalidDateRange();
        }

        drug.drugname = _drugname;
        drug.dosage = _dosage;
        drug.sideeffect = _sideeffect;
        drug.proddate = _proddate;
        drug.expirydate = _expirydate;
        drug.version++;

        emit DrugUpdated(_drugcode, msg.sender, drug.version, block.timestamp);
    }

    function changeDrugStatus(
        string memory _drugcode, 
        DrugStatus _newStatus
    ) 
        external 
        onlyOwner 
        drugExists(_drugcode)
    {
        Drug storage drug = drugs[_drugcode];
        DrugStatus oldStatus = drug.status;
        
        drug.status = _newStatus;
        
        emit DrugStatusChanged(_drugcode, oldStatus, _newStatus, msg.sender);
    }

    // Batch operations
    function addMultipleDrugs(
        string[] memory _drugcodes,
        string[] memory _drugnames,
        string[] memory _dosages,
        string[] memory _sideeffects,
        uint256[] memory _proddates,
        uint256[] memory _expirydates
    ) external onlyRegisteredCompany {
        require(
            _drugcodes.length == _drugnames.length &&
            _drugnames.length == _dosages.length &&
            _dosages.length == _sideeffects.length &&
            _sideeffects.length == _proddates.length &&
            _proddates.length == _expirydates.length,
            "Array lengths must match"
        );

        for (uint256 i = 0; i < _drugcodes.length; i++) {
            addDrug(
                _drugcodes[i],
                _drugnames[i],
                _dosages[i],
                _sideeffects[i],
                _proddates[i],
                _expirydates[i]
            );
        }
    }

    // View functions
    function getCompanies() external view returns (address[] memory) {
        return companiesList;
    }

    function getCompany(address _address) 
        external 
        view 
        returns (
            string memory name,
            bool isActive,
            uint256 registrationDate,
            uint256 drugCount
        ) 
    {
        Company memory company = companies[_address];
        return (
            company.name,
            company.isActive,
            company.registrationDate,
            company.drugCount
        );
    }

    function getDrug(string memory _drugcode) 
        external 
        view 
        onlyAuthorizedViewer
        drugExists(_drugcode)
        returns (Drug memory) 
    {
        return drugs[_drugcode];
    }

    function getDrugBasicInfo(string memory _drugcode)
        external
        view
        drugExists(_drugcode)
        returns (
            string memory drugname,
            string memory dosage,
            DrugStatus status,
            uint256 expirydate
        )
    {
        Drug memory drug = drugs[_drugcode];
        return (
            drug.drugname,
            drug.dosage,
            drug.status,
            drug.expirydate
        );
    }

    function getAllDrugCodes() external view returns (string[] memory) {
        return drugCodesList;
    }

    function getDrugCodesPaginated(uint256 _offset, uint256 _limit) 
        external 
        view 
        returns (string[] memory) 
    {
        require(_offset < drugCodesList.length, "Offset out of bounds");
        
        uint256 end = _offset + _limit;
        if (end > drugCodesList.length) {
            end = drugCodesList.length;
        }
        
        string[] memory result = new string[](end - _offset);
        for (uint256 i = _offset; i < end; i++) {
            result[i - _offset] = drugCodesList[i];
        }
        
        return result;
    }

    function getDrugsByCompany(address _company) 
        external 
        view 
        onlyAuthorizedViewer
        returns (string[] memory) 
    {
        uint256 count = 0;
        
        // First pass: count drugs by company
        for (uint256 i = 0; i < drugCodesList.length; i++) {
            if (drugs[drugCodesList[i]].producedby == _company) {
                count++;
            }
        }
        
        // Second pass: populate result array
        string[] memory result = new string[](count);
        uint256 index = 0;
        
        for (uint256 i = 0; i < drugCodesList.length; i++) {
            if (drugs[drugCodesList[i]].producedby == _company) {
                result[index] = drugCodesList[i];
                index++;
            }
        }
        
        return result;
    }

    function getDrugsByStatus(DrugStatus _status) 
        external 
        view 
        onlyAuthorizedViewer
        returns (string[] memory) 
    {
        uint256 count = 0;
        
        // First pass: count drugs by status
        for (uint256 i = 0; i < drugCodesList.length; i++) {
            if (drugs[drugCodesList[i]].status == _status) {
                count++;
            }
        }
        
        // Second pass: populate result array
        string[] memory result = new string[](count);
        uint256 index = 0;
        
        for (uint256 i = 0; i < drugCodesList.length; i++) {
            if (drugs[drugCodesList[i]].status == _status) {
                result[index] = drugCodesList[i];
                index++;
            }
        }
        
        return result;
    }

    function getExpiredDrugs() external view returns (string[] memory) {
        uint256 count = 0;
        
        // First pass: count expired drugs
        for (uint256 i = 0; i < drugCodesList.length; i++) {
            if (drugs[drugCodesList[i]].expirydate < block.timestamp) {
                count++;
            }
        }
        
        // Second pass: populate result array
        string[] memory result = new string[](count);
        uint256 index = 0;
        
        for (uint256 i = 0; i < drugCodesList.length; i++) {
            if (drugs[drugCodesList[i]].expirydate < block.timestamp) {
                result[index] = drugCodesList[i];
                index++;
            }
        }
        
        return result;
    }

    function getTotalDrugCount() external view returns (uint256) {
        return drugCodesList.length;
    }

    function getTotalCompanyCount() external view returns (uint256) {
        return companiesList.length;
    }

    function isCompanyRegistered(address _company) external view returns (bool) {
        return companyExists[_company] && companies[_company].isActive;
    }

    function isDrugExpired(string memory _drugcode) 
        external 
        view 
        drugExists(_drugcode)
        returns (bool) 
    {
        return drugs[_drugcode].expirydate < block.timestamp;
    }

    function isViewerAuthorized(address _viewer) external view returns (bool) {
        return authorizedViewers[_viewer];
    }
}