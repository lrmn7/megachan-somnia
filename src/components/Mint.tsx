import { useState } from "react";
import { ethers } from "ethers";
import { motion } from "framer-motion";
import megaChanJson from "../components/MegaChanABI.json";
import { CheckCircle, XCircle } from "lucide-react";
import Confetti from "react-confetti";

declare global {
  interface Window {
    ethereum?: any;
  }
}

const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS || " ";
const SOMNIA_CHAIN_ID = process.env.REACT_APP_SOMNIA_CHAIN_ID || 50312;

const BuyMega = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [txError, setTxError] = useState<string | null>(null);
  const [amount, setAmount] = useState<string>("0.001"); // Default donation 0.001 STT

  const megaChanAbi = megaChanJson.abi;

  const connectWallet = async () => {
    if (!window.ethereum) return alert("Metamask not detected!");
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAccount(accounts[0]);

      const network = await provider.getNetwork();
      if (network.chainId !== BigInt(SOMNIA_CHAIN_ID)) {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: SOMNIA_CHAIN_ID }],
        });
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      alert("Failed to connect wallet!");
    }
  };

  const buyMega = async () => {
    if (!account) return alert("Please connect your wallet first!");
    setLoading(true);
    // Reset state before a new transaction
    setTxError(null);
    setTxHash(null);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, megaChanAbi, signer);

      if (contract.buyMega) {
        const tx = await contract.buyMega(message, { value: ethers.parseEther(amount) });
        await tx.wait();
        // If the transaction is successful, set txHash and reset error
        setTxHash(tx.hash);
        setTxError(null);
      } else {
        setTxError("buyMega function not found! Check ABI or function name.");
        setTxHash(null);
      }
    } catch (error: any) {
      // If an error occurs, set txError and reset txHash
      setTxError("Transaction failed or was canceled!");
      setTxHash(null);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-dark-bg text-white p-4 text-center">
      {txHash && <Confetti numberOfPieces={200} recycle={false} />}

      <motion.img
        src="/megawati-somnia-putri.png"
        alt="MegaChan"
        className="object-cover rounded-full shadow-lg mb-6"
        style={{ width: "100px", height: "100px" }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />

      <motion.h1
        className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        💖 MegaChan – Powered by Your Support!
      </motion.h1>

      {!account ? (
        <motion.button
          onClick={connectWallet}
          className="btn btn-primary shadow-lg hover:shadow-pink-500/50"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Connect Wallet & Support 💜
        </motion.button>
      ) : (
        <motion.div
          className="transaction-card p-6 bg-gray-800 rounded-lg shadow-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <label className="input-label text-lg font-semibold text-pink-300">
            Support Message 🌟 (Optional)
          </label>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write an inspirational message... ✨"
            className="input-field p-2 mt-2 text-black rounded w-full"
          />

          <label className="input-label text-lg font-semibold text-pink-300 mt-4">
            Select Donation Amount 💰
          </label>
          <select
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="input-field p-2 mt-2 text-black rounded w-full"
          >
            <option value="0.001">0.001 STT</option>
            <option value="0.002">0.002 STT</option>
            <option value="0.005">0.005 STT</option>
            <option value="0.01">0.01 STT</option>
          </select>

          <motion.button
            onClick={buyMega}
            disabled={loading}
            className={`btn btn-success mt-4 ${loading ? "disabled" : "hover:shadow-green-400/50"}`}
            whileHover={!loading ? { scale: 1.05 } : {}}
            whileTap={!loading ? { scale: 0.95 } : {}}
          >
            {loading ? "Please wait..." : `🚀 Support with ${amount} STT`}
          </motion.button>
        </motion.div>
      )}

      {(txHash || txError) && (
        <motion.div
          className="success-card bg-green-700 text-white p-6 rounded-lg shadow-xl mt-6"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          {txError ? (
            <>
              <XCircle className="text-white w-12 h-12 mb-2" />
              <p className="text-xl font-semibold">{txError}</p>
            </>
          ) : (
            <>
              <CheckCircle className="text-white w-12 h-12 mb-2" />
              <p className="text-xl font-semibold">Thank you, Hero! 🌟</p>
              <p className="text-sm">Your support is recorded on the blockchain forever!</p>
              <a
                href={`https://somnia-testnet.socialscan.io/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block-explorer-link mt-2 underline text-white"
              >
                🔍 View transaction on Block Explorer
              </a>
            </>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default BuyMega;
