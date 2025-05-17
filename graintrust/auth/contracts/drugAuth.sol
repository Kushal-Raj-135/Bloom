// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./openzeppelin/contracts/access/Ownable.sol";

contract DrugRegistry is Ownable {
    struct Drug {
        string drugname;
        string dosage;
        string sideeffect;
        string proddate;
        string expirydate;
        address producedby;
        uint256 timestamp;
    }

    // Company management
    mapping(address => string) private companyAccts;
    address[] private companiesList;

    // Drug management
    mapping(string => Drug) private drugs;
    string[] private mdrugCodes;
    mapping(string => bool) private drugCodeExists;

    // Events
    event CompanyAdded(address indexed companyAddress, string name);
    event DrugAdded(
        string indexed drugcode,
        address indexed producer,
        uint256 timestamp
    );

    constructor() Ownable(msg.sender) {}

    // Company registration (NAFDAC only)
    function setCompany(
        address _address,
        string memory _companyname
    ) public onlyOwner {
        require(
            bytes(companyAccts[_address]).length == 0,
            "Company already registered"
        );
        companyAccts[_address] = _companyname;
        companiesList.push(_address);
        emit CompanyAdded(_address, _companyname);
    }

    // Drug registration (approved companies only)
    function addDrug(
        string memory _drugcode,
        string memory _drugname,
        string memory _dosage,
        string memory _sideeffect,
        string memory _proddate,
        string memory _expirydate
    ) public {
        require(
            bytes(companyAccts[msg.sender]).length > 0,
            "Unauthorized company"
        );
        require(!drugCodeExists[_drugcode], "Drug code already exists");

        drugs[_drugcode] = Drug({
            drugname: _drugname,
            dosage: _dosage,
            sideeffect: _sideeffect,
            proddate: _proddate,
            expirydate: _expirydate,
            producedby: msg.sender,
            timestamp: block.timestamp
        });

        mdrugCodes.push(_drugcode);
        drugCodeExists[_drugcode] = true;
        emit DrugAdded(_drugcode, msg.sender, block.timestamp);
    }

    // Getter functions
    function getCompanies() public view returns (address[] memory) {
        return companiesList;
    }

    function getCompany(address _address) public view returns (string memory) {
        return companyAccts[_address];
    }

    function getDrug(
        string memory _code
    )
        public
        view
        returns (
            string memory,
            string memory,
            string memory,
            string memory,
            string memory,
            address,
            uint256
        )
    {
        Drug memory d = drugs[_code];
        return (
            d.drugname,
            d.dosage,
            d.sideeffect,
            d.proddate,
            d.expirydate,
            d.producedby,
            d.timestamp
        );
    }

    function getAllDrugCodes() public view returns (string[] memory) {
        return mdrugCodes;
    }

    function mdrugCodesLength() public view returns (uint256) {
        return mdrugCodes.length;
    }
}
