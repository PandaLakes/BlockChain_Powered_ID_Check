// DOM Elements
const connectWalletMsg = document.querySelector("#connectWalletMessage");
const connectWalletBtn = document.querySelector("#connectWallet");
const appContent = document.querySelector("#appContent");
const adminSection = document.querySelector("#adminSection");
const userSection = document.querySelector("#userSection");
const userList = document.querySelector("#userList");
const userTable = document.querySelector("#userTable");

const sidebar = document.getElementById("sidebar");
const menuIcon = document.getElementById("menuIcon");
const darkOverlay = document.getElementById("darkOverlay");

const userLink = document.getElementById("userLink");
const adminLink = document.getElementById("adminLink");
const registeredLink = document.getElementById("registeredLink");

// Smart contract details
const contractAddress = "0x5C4d19d78d13e7311cDC49Fc602BDb4467E4ec8B";
const contractABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "admin",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllUsers",
    "outputs": [
      {
        "internalType": "address[]",
        "name": "",
        "type": "address[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_user",
        "type": "address"
      }
    ],
    "name": "getUserHash",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_user",
        "type": "address"
      }
    ],
    "name": "isVerified",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_userHash",
        "type": "string"
      }
    ],
    "name": "registerUser",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_user",
        "type": "address"
      }
    ],
    "name": "removeUser",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_newAdmin",
        "type": "address"
      }
    ],
    "name": "transferAdmin",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_newHash",
        "type": "string"
      }
    ],
    "name": "updateUserHash",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "userList",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "users",
    "outputs": [
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "userHash",
        "type": "string"
      },
      {
        "internalType": "bool",
        "name": "isVerified",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_user",
        "type": "address"
      }
    ],
    "name": "verifyUser",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

let provider, signer, contract;

// Function to show the Sidebar and Menu Icon after Wallet Connection
function showSidebar() {
    sidebar.style.visibility = "visible";
    menuIcon.classList.add("visible");
}

// Function to hide the Sidebar
function hideSidebar() {
    sidebar.style.visibility = "hidden";
    menuIcon.classList.remove("visible");
}

// Check and handle admin section visibility
async function toggleAdminSection(userAddress) {
    try {
        const adminAddress = await contract.admin();
        if (adminAddress.toLowerCase() === userAddress.toLowerCase()) {
            adminLink.style.display = "block"; // Show admin section
        } else {
            adminLink.style.display = "none"; // Hide admin section
        }
    } catch (error) {
        console.error("Error toggling admin section:", error);
        adminLink.style.display = "none"; // Default to hidden
    }
}

// Setup MetaMask connection
async function setup() {
    try {
        provider = await detectEthereumProvider();

        if (provider && provider === window.ethereum) {
            const ethersProvider = new ethers.providers.Web3Provider(window.ethereum);
            signer = ethersProvider.getSigner();
            contract = new ethers.Contract(contractAddress, contractABI, signer);

            const userAddress = await signer.getAddress();

            connectWalletBtn.textContent = `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`;
            connectWalletMsg.textContent = "Wallet connected.";
            connectWalletBtn.disabled = true;

            document.getElementById("connectMetamask").style.display = "none";

            // Show sidebar and menu icon
            showSidebar();

            // Toggle admin section visibility
            await toggleAdminSection(userAddress);

            // Load Registered Users
            await loadUsers();

            // Display the application content
            appContent.style.display = "block";
        } else {
            alert("MetaMask is not detected. Please install MetaMask.");
        }
    } catch (error) {
        console.error("Error connecting wallet:", error);
        alert("An error occurred while connecting your wallet.");
    }
}

// Function to load registered users
async function loadUsers() {
    userTable.innerHTML = ""; // Clear the table

    try {
        const addresses = await contract.getAllUsers();

        for (const address of addresses) {
            const user = await contract.users(address);

            const row = `
                <tr>
                    <td>${address}</td>
                    <td>${user.name}</td>
                    <td>${user.userHash}</td>
                    <td>${user.isVerified ? "Yes" : "No"}</td>
                </tr>`;
            userTable.innerHTML += row;
        }
    } catch (error) {
        console.error("Error loading users:", error);
    }
}

// Register User
async function registerUser() {
    const name = document.querySelector("#userName").value;
    const hash = document.querySelector("#userHash").value;

    if (name && hash) {
        try {
            const tx = await contract.registerUser(name, hash);
            await tx.wait();
            alert("User registered successfully!");
            await loadUsers();
        } catch (error) {
            console.error("Error registering user:", error);
            alert("An error occurred while registering the user.");
        }
    } else {
        alert("Please provide both name and hash.");
    }
}

// Verify User
async function verifyUser() {
    const address = document.querySelector("#verifyAddress").value;

    if (address) {
        try {
            const tx = await contract.verifyUser(address);
            await tx.wait();
            alert("User verified successfully!");
            await loadUsers();
        } catch (error) {
            console.error("Error verifying user:", error);
        }
    } else {
        alert("Please provide an address.");
    }
}

// Remove User
async function removeUser() {
    const address = document.querySelector("#removeAddress").value;

    if (address) {
        try {
            const tx = await contract.removeUser(address);
            await tx.wait();
            alert("User removed successfully!");
            await loadUsers();
        } catch (error) {
            console.error("Error removing user:", error);
        }
    } else {
        alert("Please provide an address.");
    }
}

// Sidebar and Section Toggle
const toggleSidebar = () => {
    const isOpen = sidebar.classList.contains("open");
    sidebar.classList.toggle("open", !isOpen);
    darkOverlay.style.display = isOpen ? "none" : "block";
    appContent.classList.toggle("blur", !isOpen);
};

const toggleSection = (section) => {
    const isActive = section.classList.contains("active");

    document.querySelectorAll("main > section").forEach((sec) => {
        sec.classList.remove("active");
        sec.style.display = "none";
    });

    if (!isActive) {
        section.classList.add("active");
        section.style.display = "block";
    }
};

// Function to Assign a New Admin
async function assignAdmin() {
  const newAdminAddress = document.querySelector("#newAdminAddress").value;

  if (newAdminAddress) {
      try {
          // Call the transferAdmin function in the smart contract
          const tx = await contract.transferAdmin(newAdminAddress);
          await tx.wait(); // Wait for the transaction to be confirmed
          alert("New admin assigned successfully!");
      } catch (error) {
          console.error("Error assigning new admin:", error);
          alert("An error occurred while assigning the new admin. Ensure you are the current admin.");
      }
  } else {
      alert("Please provide a valid address for the new admin.");
  }
}


// Event Listeners
document.querySelector("#assignAdmin").addEventListener("click", assignAdmin);


menuIcon.addEventListener("click", toggleSidebar);
darkOverlay.addEventListener("click", toggleSidebar);

userLink.addEventListener("click", () => toggleSection(userSection));
adminLink.addEventListener("click", () => toggleSection(adminSection));
registeredLink.addEventListener("click", () => toggleSection(userList));

connectWalletBtn.addEventListener("click", setup);

document.querySelector("#registerUser").addEventListener("click", registerUser);
document.querySelector("#verifyUser").addEventListener("click", verifyUser);
document.querySelector("#removeUser").addEventListener("click", removeUser);
