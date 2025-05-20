// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AccessControlWithOwner
 * @dev Secure role-based access control with distinct owner management.
 * - Owner manages ADMIN_ROLE grants/revocations.
 * - Admins manage other roles based on configuration.
 * - Owner manages role administration configuration.
 * @notice Uses custom errors for revert reasons.
 */
contract AccessControlWithOwner {
    // --- Custom Errors ---
    error AccessControlBadAdminRole(bytes32 role); // Cannot change admin for ADMIN_ROLE
    error AccessControlMissingRole(address account, bytes32 role); // Account lacks required role
    error AccessControlInvalidAdminRole(address account, bytes32 role); // Caller lacks admin role for target role grant/revoke
    error AccessControlOwnerOnly(); // Caller is not the owner
    error AccessControlZeroAddress(); // Action attempted on the zero address
    error AccessControlOwnerCannotRevokeOwnAdmin(); // Owner cannot revoke own admin role
    error AccessControlCannotGrantRoleToSelf(); // Admins cannot grant roles to themselves using grantRole

    // --- State ---
    address public owner;
    mapping(bytes32 => mapping(address => bool)) private _roles;
    mapping(bytes32 => bytes32) private _roleAdmin;

    // --- Roles (Constants) ---
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant SUPPLIER_ROLE = keccak256("SUPPLIER_ROLE");
    bytes32 public constant TRANSPORTER_ROLE = keccak256("TRANSPORTER_ROLE");
    bytes32 public constant MANUFACTURER_ROLE = keccak256("MANUFACTURER_ROLE");
    bytes32 public constant WHOLESALER_ROLE = keccak256("WHOLESALER_ROLE");
    bytes32 public constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR_ROLE");
    bytes32 public constant CUSTOMER_ROLE = keccak256("CUSTOMER_ROLE");

    // --- Events ---
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event RoleAdminChanged(bytes32 indexed role, bytes32 indexed previousAdminRole, bytes32 indexed newAdminRole);
    event RoleGranted(bytes32 indexed role, address indexed account, address indexed sender);
    event RoleRevoked(bytes32 indexed role, address indexed account, address indexed sender);

    // --- Modifiers ---
    modifier onlyOwner() {
        if (msg.sender != owner) {
            revert AccessControlOwnerOnly();
        }
        _;
    }

    // --- Constructor ---
    constructor() {
        address deployer = msg.sender;
        if (deployer == address(0)) {
             revert AccessControlZeroAddress(); // Prevent deployment with zero address owner
        }
        owner = deployer;
        emit OwnershipTransferred(address(0), deployer);
        _setupRole(ADMIN_ROLE, deployer); // Grant ADMIN_ROLE to the deployer/owner
        _initializeRoleAdmins();
    }

    // --- Role Management Functions ---

    /**
     * @dev Checks if `account` has `role`.
     */
    function hasRole(bytes32 role, address account) public view virtual returns (bool) {
        return _roles[role][account];
    }

    /**
     * @dev Returns the admin role controlling `role`.
     */
    function getRoleAdmin(bytes32 role) public view virtual returns (bytes32) {
        return _roleAdmin[role];
    }

    /**
     * @dev Grants `role` to `account`.
     * - Owner manages ADMIN_ROLE grants.
     * - Designated role admins manage other roles.
     * - Cannot grant roles to the zero address.
     */
    function grantRole(bytes32 role, address account) public virtual {
        if (account == address(0)) {
            revert AccessControlZeroAddress();
        }
        // Admins generally shouldn't grant roles to themselves via this public function
        // They should use internal functions if necessary or have owner grant it.
        if (msg.sender == account && role != ADMIN_ROLE) { // Allow owner to grant self admin if needed elsewhere
             revert AccessControlCannotGrantRoleToSelf();
        }

        if (role == ADMIN_ROLE) {
            if (msg.sender != owner) {
                revert AccessControlOwnerOnly(); // Only owner grants ADMIN_ROLE
            }
        } else {
            bytes32 adminRole = getRoleAdmin(role);
            if (!hasRole(adminRole, msg.sender)) {
                revert AccessControlInvalidAdminRole(msg.sender, adminRole);
            }
        }
        _setupRole(role, account);
    }

    /**
     * @dev Revokes `role` from `account`.
     * - Owner manages ADMIN_ROLE revocations.
     * - Designated role admins manage other roles.
     * - Cannot revoke roles from the zero address.
     * - Owner cannot revoke their own ADMIN_ROLE.
     */
    function revokeRole(bytes32 role, address account) public virtual {
         if (account == address(0)) {
            revert AccessControlZeroAddress();
        }
        if (role == ADMIN_ROLE) {
            if (msg.sender != owner) {
                revert AccessControlOwnerOnly(); // Only owner revokes ADMIN_ROLE
            }
            if (account == owner) {
                 revert AccessControlOwnerCannotRevokeOwnAdmin();
            }
        } else {
            bytes32 adminRole = getRoleAdmin(role);
            if (!hasRole(adminRole, msg.sender)) {
                 revert AccessControlInvalidAdminRole(msg.sender, adminRole);
            }
        }
        _revokeRole(role, account);
    }

    // --- Governance Functions (Owner Only) ---

    /**
     * @dev Sets the admin role for a given role. Restricted to Owner.
     * @notice Cannot change the admin for ADMIN_ROLE itself.
     */
    function setRoleAdmin(bytes32 role, bytes32 adminRole) public virtual onlyOwner {
        if (role == ADMIN_ROLE) {
             revert AccessControlBadAdminRole(role);
        }
        _setRoleAdmin(role, adminRole);
    }

    /**
     * @dev Transfers ownership to `newOwner`. Grants ADMIN_ROLE to new owner.
     * @notice Requires `newOwner` not to be the zero address.
     */
    function transferOwnership(address newOwner) public virtual onlyOwner {
        if (newOwner == address(0)) {
            revert AccessControlZeroAddress();
        }
        address oldOwner = owner;
        owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
        _setupRole(ADMIN_ROLE, newOwner); // Grant admin role to new owner
    }

    // --- Internal Functions ---

    function _initializeRoleAdmins() internal {
        // Configure ADMIN_ROLE to manage all other standard roles by default
        _setRoleAdmin(SUPPLIER_ROLE, ADMIN_ROLE);
        _setRoleAdmin(TRANSPORTER_ROLE, ADMIN_ROLE);
        _setRoleAdmin(MANUFACTURER_ROLE, ADMIN_ROLE);
        _setRoleAdmin(WHOLESALER_ROLE, ADMIN_ROLE);
        _setRoleAdmin(DISTRIBUTOR_ROLE, ADMIN_ROLE);
        _setRoleAdmin(CUSTOMER_ROLE, ADMIN_ROLE);
        // Set admin for ADMIN_ROLE itself (governance logic is owner-based)
        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);
    }

    function _setupRole(bytes32 role, address account) internal virtual {
        // Zero address check performed by caller (grantRole)
        if (!hasRole(role, account)) {
            _roles[role][account] = true;
            emit RoleGranted(role, account, msg.sender);
        }
    }

    function _revokeRole(bytes32 role, address account) internal virtual {
        // Zero address check performed by caller (revokeRole)
        if (hasRole(role, account)) {
            _roles[role][account] = false;
            emit RoleRevoked(role, account, msg.sender);
        }
    }

    function _setRoleAdmin(bytes32 role, bytes32 adminRole) internal virtual {
        bytes32 previousAdminRole = getRoleAdmin(role);
        _roleAdmin[role] = adminRole;
        emit RoleAdminChanged(role, previousAdminRole, adminRole);
    }

    /**
     * @dev Internal function to check role, reverts if missing.
     * @notice Use this for function entry checks where only the role is needed.
     */
    function _checkRole(bytes32 role, address account) internal view virtual {
        if (!hasRole(role, account)) {
            revert AccessControlMissingRole(account, role);
        }
    }
}