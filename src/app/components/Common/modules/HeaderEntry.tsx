"use client";

import { INFURA_GATEWAY } from "@/app/lib/constants";
import { ConnectKitButton } from "connectkit";
import Image from "next/image";
import { FunctionComponent } from "react";

const HeaderEntry: FunctionComponent<{ dict: any }> = ({ dict }) => {
  return (
    <div className="relative top-0 w-full h-fit flex items-center justify-center gap-3 mt-auto">
      <ConnectKitButton.Custom>
        {({ isConnected, show, address }) => (
          <div className={`relative cursor-pointer flex w-fit h-fit`}>
            <div
              id={"select2"}
              className={`relative w-fit items-center justify-center h-fit px-3 py-2 rounded-t-lg rounded-b-lg cursor-pointer flex flex-row gap-3`}
              onClick={show}
            >
              <div className="relative w-fit h-fit flex">
                <div className="relative w-2 h-4 flex">
                  <Image
                    src={`${INFURA_GATEWAY}/ipfs/QmVhUPaoLCk8Yz6TfP9p7atJMA6JfDbFB65ZxyqFEMCdyD`}
                    alt={"Connect"}
                    layout="fill"
                    draggable={false}
                  />
                </div>
              </div>
              <div className="relative w-fit text-xs h-fit text-white font-dosis lowercase text-center items-center justify-center flex">
                {isConnected && address
                  ? `${address.slice(0, 6)}...${address.slice(-4)}`
                  : dict?.connectWallet}
              </div>
            </div>
          </div>
        )}
      </ConnectKitButton.Custom>
    </div>
  );
};

export default HeaderEntry;
