import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import "./connection.ts";
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import { formatAddress } from "./utils.ts";

function App() {
  const { isConnected, address } = useAppKitAccount();

  // controls popup of wallet connect monal
  const { open } = useAppKit();

  return (
    <>
      <div className="img">
        <img src="/rootstock.png" className="logo" alt="Logo" />
      </div>
      <div className="">
        <button onClick={() => open()}>
          {isConnected ? formatAddress(address ?? "") : <>Connect Wallet</>}
        </button>
      </div>

      <ToastContainer />
    </>
  );
}

export default App;
