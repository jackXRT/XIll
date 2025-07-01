// API Configuration
const ETHERSCAN_API_KEY = '25I5W4JWTAVHTEVYNNQJW6XZMIPBYIBBBB';
const BLOCKCYPHER_API_KEY = '60eed12249d94d3cb76739032fd6e84f';
const ETHEREUM_NETWORK = 'mainnet';
const BITCOIN_NETWORK = 'main';

// Scanner Types
const SCAN_TYPES = {
  ETH_ADDRESS: 'Ethereum Address',
  ETH_TX: 'Ethereum Transaction',
  BTC_ADDRESS: 'Bitcoin Address',
  IPFS_CID: 'IPFS Content ID',
  MD5: 'MD5 Hash',
  SHA1: 'SHA-1 Hash',
  SHA256: 'SHA-256 Hash',
  SHA512: 'SHA-512 Hash',
  URL: 'Web URL',
  CONTRACT: 'Smart Contract',
  UNKNOWN: 'Unknown'
};

// Main Scan Function
async function scanHash() {
  const input = document.getElementById('hashInput').value.trim();
  const resultDiv = document.getElementById('result');

  if (!input) {
    showResult('Please enter a hash or address', 'error');
    return;
  }

  try {
    resultDiv.innerHTML = '<div class="loading">🔍 Analyzing input...</div>';
    
    const scanType = detectInputType(input);
    let resultHTML = '';

    switch(scanType) {
      case SCAN_TYPES.ETH_ADDRESS:
        resultHTML = await scanEthereumAddress(input);
        break;
      case SCAN_TYPES.ETH_TX:
        resultHTML = await scanEthereumTransaction(input);
        break;
      case SCAN_TYPES.BTC_ADDRESS:
        resultHTML = await scanBitcoinAddress(input);
        break;
      case SCAN_TYPES.IPFS_CID:
        resultHTML = await scanIPFSContent(input);
        break;
      case SCAN_TYPES.URL:
        resultHTML = await scanWebsiteURL(input);
        break;
      default:
        resultHTML = analyzeHash(input, scanType);
    }

    showResult(resultHTML, 'success');
  } catch (error) {
    showResult(`❌ Scan failed: ${error.message}`, 'error');
    console.error('Scan error:', error);
  }
}

// Enhanced Ethereum Address Scanner
async function scanEthereumAddress(address) {
  const [balanceData, txData, contractData] = await Promise.all([
    fetchEthereumBalance(address),
    fetchEthereumTransactions(address),
    checkContract(address)
  ]);

  const isContract = contractData.status === '1' && contractData.result !== '0x';
  const balance = parseInt(balanceData.result) / 1e18;
  const txCount = txData.result?.length || 0;

  return `
    <div class="result-card">
      <h3>${SCAN_TYPES.ETH_ADDRESS} ${isContract ? '<span class="contract-badge">Contract</span>' : ''}</h3>
      <div class="result-grid">
        <div class="result-item">
          <span class="label">Address:</span>
          <span class="value monospace">${address}</span>
        </div>
        <div class="result-item">
          <span class="label">Balance:</span>
          <span class="value">${balance.toFixed(4)} ETH</span>
        </div>
        <div class="result-item">
          <span class="label">Transactions:</span>
          <span class="value">${txCount}</span>
        </div>
        ${isContract ? `
        <div class="result-item">
          <span class="label">Contract:</span>
          <span class="value">Verified</span>
        </div>` : ''}
      </div>
      <div class="action-buttons">
        <a href="https://etherscan.io/address/${address}" target="_blank" class="explorer-btn">
          <i class="fas fa-external-link-alt"></i> View on Etherscan
        </a>
        <button onclick="trackAddress('${address}')" class="track-btn">
          <i class="fas fa-eye"></i> Track Address
        </button>
      </div>
    </div>
  `;
}

// Ethereum API Calls
async function fetchEthereumBalance(address) {
  const url = `https://api.etherscan.io/api?module=account&action=balance&address=${address}&tag=latest&apikey=${ETHERSCAN_API_KEY}`;
  const response = await fetch(url);
  return await response.json();
}

async function fetchEthereumTransactions(address) {
  const url = `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=asc&apikey=${ETHERSCAN_API_KEY}`;
  const response = await fetch(url);
  return await response.json();
}

async function checkContract(address) {
  const url = `https://api.etherscan.io/api?module=proxy&action=eth_getCode&address=${address}&tag=latest&apikey=${ETHERSCAN_API_KEY}`;
  const response = await fetch(url);
  return await response.json();
}

// Bitcoin Address Scanner
async function scanBitcoinAddress(address) {
  const url = `https://api.blockcypher.com/v1/btc/${BITCOIN_NETWORK}/addrs/${address}/balance?token=${BLOCKCYPHER_API_KEY}`;
  const response = await fetch(url);
  const data = await response.json();
  
  return `
    <div class="result-card">
      <h3>${SCAN_TYPES.BTC_ADDRESS}</h3>
      <div class="result-grid">
        <div class="result-item">
          <span class="label">Address:</span>
          <span class="value monospace">${address}</span>
        </div>
        <div class="result-item">
          <span class="label">Balance:</span>
          <span class="value">${(data.final_balance / 1e8).toFixed(8)} BTC</span>
        </div>
        <div class="result-item">
          <span class="label">Transactions:</span>
          <span class="value">${data.n_tx}</span>
        </div>
      </div>
      <div class="action-buttons">
        <a href="https://live.blockcypher.com/btc/address/${address}/" target="_blank" class="explorer-btn">
          <i class="fas fa-external-link-alt"></i> View on BlockCypher
        </a>
      </div>
    </div>
  `;
}

// Hash Analysis Functions
function analyzeHash(hash, type) {
  const hashInfo = {
    [SCAN_TYPES.MD5]: {
      bits: 128,
      security: 'Insecure (collisions found)',
      commonUse: 'File integrity checks',
      warning: 'Not suitable for security purposes'
    },
    [SCAN_TYPES.SHA1]: {
      bits: 160,
      security: 'Broken (theoretical collisions)',
      commonUse: 'Old checksums, git repositories',
      warning: 'Deprecated for security use'
    },
    [SCAN_TYPES.SHA256]: {
      bits: 256,
      security: 'Secure (used in Bitcoin)',
      commonUse: 'Blockchains, security applications',
      warning: ''
    },
    [SCAN_TYPES.SHA512]: {
      bits: 512,
      security: 'Highly secure',
      commonUse: 'Cryptographic applications',
      warning: ''
    }
  };

  const info = hashInfo[type] || {
    bits: hash.length * 4,
    security: 'Unknown',
    commonUse: 'Various applications',
    warning: 'Unrecognized hash format'
  };

  return `
    <div class="result-card">
      <h3>${type}</h3>
      <div class="result-grid">
        <div class="result-item">
          <span class="label">Hash:</span>
          <span class="value monospace">${hash}</span>
        </div>
        <div class="result-item">
          <span class="label">Length:</span>
          <span class="value">${hash.length} chars (${info.bits} bits)</span>
        </div>
        <div class="result-item">
          <span class="label">Security:</span>
          <span class="value">${info.security}</span>
        </div>
        <div class="result-item">
          <span class="label">Common Uses:</span>
          <span class="value">${info.commonUse}</span>
        </div>
        ${info.warning ? `
        <div class="result-item warning">
          <span class="label">Warning:</span>
          <span class="value">${info.warning}</span>
        </div>` : ''}
      </div>
      ${type === SCAN_TYPES.SHA256 ? `
      <div class="note">
        <i class="fas fa-info-circle"></i> This could be a Bitcoin transaction hash
      </div>` : ''}
    </div>
  `;
}

// Helper Functions
function detectInputType(input) {
  if (/^0x[a-fA-F0-9]{40}$/.test(input)) return SCAN_TYPES.ETH_ADDRESS;
  if (/^0x[a-fA-F0-9]{64}$/.test(input)) return SCAN_TYPES.ETH_TX;
  if (/^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,39}$/.test(input)) return SCAN_TYPES.BTC_ADDRESS;
  if (/^(Qm|b)[a-zA-Z0-9]{44,59}$/.test(input)) return SCAN_TYPES.IPFS_CID;
  if (/^[a-fA-F0-9]{32}$/.test(input)) return SCAN_TYPES.MD5;
  if (/^[a-fA-F0-9]{40}$/.test(input)) return SCAN_TYPES.SHA1;
  if (/^[a-fA-F0-9]{64}$/.test(input)) return SCAN_TYPES.SHA256;
  if (/^[a-fA-F0-9]{128}$/.test(input)) return SCAN_TYPES.SHA512;
  if (/^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/.test(input)) return SCAN_TYPES.URL;
  return SCAN_TYPES.UNKNOWN;
}

function showResult(content, type) {
  const resultDiv = document.getElementById('result');
  resultDiv.innerHTML = `<div class="result-${type}">${content}</div>`;
}

// Initialize Scanner
function initScanner() {
  document.getElementById('scan-btn').addEventListener('click', scanHash);
  document.getElementById('hashInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') scanHash();
  });
}

// Make functions available globally
window.scanHash = scanHash;
window.trackAddress = (address) => {
  alert(`Tracking address: ${address}`);
  // Implement actual tracking logic here
};
