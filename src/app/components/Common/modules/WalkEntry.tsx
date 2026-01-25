"use client";

import Image from "next/image";
import { FunctionComponent, JSX } from "react";

const WalkEntry: FunctionComponent<{ dict: any }> = ({ dict }): JSX.Element => {
  return (
    <div className="relative w-full items-center justify-center h-fit flex flex-col gap-4">
      <div className="relative flex flex-col w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-200 p-6 max-h-[60vh]">
        <div className="relative flex flex-row gap-3 w-full flex-shrink-0 pb-4 border-b border-gray-200">
          <div className="relative flex w-12 h-12 rounded-full overflow-hidden">
            <Image
              alt="vitalik"
              draggable={false}
              layout="fill"
              objectFit="cover"
              src="https://ik.imagekit.io/lens/tr:w-100,h-100/6a5c67c2bff07e56d352d29cf0a858b67690dc25fc49d2f30ecf347d00348184_kX7EqG2mt.webp"
            />
          </div>
          <div className="relative flex flex-col gap-1">
            <span className="text-gray-900 font-bold text-base">
              Vitalik Buterin
            </span>
            <span className="text-gray-500 text-sm">@vitalik</span>
          </div>
        </div>
        <div className="relative flex flex-col w-full overflow-y-scroll pt-4">
          <div className="relative flex flex-col gap-3 w-full text-gray-900 text-base leading-relaxed">
            <p>
              An important, and perenially underrated, aspect of
              &quot;trustlessness&quot;, &quot;passing the walkaway test&quot;
              and &quot;self-sovereignty&quot; is protocol simplicity.
            </p>
            <p>
              Even if a protocol is super decentralized with hundreds of
              thousands of nodes, and it has 49% byzantine fault tolerance, and
              nodes fully verify everything with quantum-safe peerdas and
              starks, if the protocol is an unwieldy mess of hundreds of
              thousands of lines of code and five forms of PhD-level
              cryptography, ultimately that protocol fails all three tests:
            </p>
            <p>
              It&apos;s not trustless because you have to trust a small class of
              high priests who tell you what properties the protocol has
            </p>
            <p>
              It doesn&apos;t pass the walkaway test because if existing client
              teams go away, it&apos;s extremely hard for new teams to get up to
              the same level of quality
            </p>
            <p>
              It&apos;s not self-sovereign because if even the most technical
              people can&apos;t inspect and understand the thing, it&apos;s not
              fully yours
            </p>
            <p>
              It&apos;s also less secure, because each part of the protocol,
              especially if it can interact with other parts in complicated
              ways, carries a risk of the protocol breaking.
            </p>
            <p>
              One of my fears with Ethereum protocol development is that we can
              be too eager to add new features to meet highly specific needs,
              even if those features bloat the protocol or add entire new types
              of interacting components or complicated cryptography as critical
              dependencies. This can be nice for short-term functionality gains,
              but it is highly destructive to preserving long-term
              self-sovereignty, and creating a hundred-year decentralized
              hyperstructure that transcends the rise and fall of empires and
              ideologies.
            </p>
            <p>
              The core problem is that if protocol changes are judged from the
              perspective of &quot;how big are they as changes to the existing
              protocol&quot;, then the desire to preserve backwards
              compatibility means that additions happen much more often than
              subtractions, and the protocol inevitably bloats over time. To
              counteract this, the Ethereum development process needs an
              explicit &quot;simplification&quot; / &quot;garbage
              collection&quot; function.
            </p>
            <p>&quot;Simplification&quot; has three metrics:</p>
            <p>
              Minimizing total lines of code in the protocol. An ideal protocol
              fits onto a single page - or at least a few pages
            </p>
            <p>
              Avoiding unnecessary dependencies on fundamentally complex
              technical components. For example, a protocol whose security
              solely depends on hashes (even better: on exactly one hash
              function) is better than one that depends on hashes and lattices.
              Throwing in isogenies is worst of all, because (sorry to the truly
              brilliant hardworking nerds who figured that stuff out) nobody
              understands isogenies.
            </p>
            <p>
              Adding more invariants: core properties that the protocol can rely
              on, for example EIP-6780 (selfdestruct removal) added the property
              that at most N storage slots can be changedakem per slot,
              significantly simplifying client development, and EIP-7825 (per-tx
              gas cap) added a maximum on the cost of processing one
              transaction, which greatly helps ZK-EVMs and parallel execution.
            </p>
            <p>
              Garbage collection can be piecemeal, or it can be large-scale. The
              piecemeal approach tries to take existing features, and streamline
              them so that they are simpler and make more sense. One example is
              the gas cost reforms in Glamsterdam, which make many gas costs
              that were previously arbitrary, instead depend on a small number
              of parameters that are clearly tied to resource consumption.
            </p>
            <p>
              One large-scale garbage collection was replacing PoW with PoS.
              Another is likely to happen as part of Lean consensus, opening the
              room to fix a large number of mistakes at the same time (
              youtube.com/watch?v=10Ym34y3E… ).
            </p>
            <p>
              Another approach is &quot;Rosetta-style backwards
              compatibility&quot;, where features that are complex but
              little-used remain usable but are &quot;demoted&quot; from being
              part of the mandatory protocol and instead become smart contract
              code, so new client developers do not need to bother with them.
              Examples:
            </p>
            <p>
              After we upgrade to full native account abstraction, all old tx
              types can be retired, and EOAs can be converted into smart
              contract wallets whose code can process all of those transaction
              types
            </p>
            <p>
              We can replace existing precompiles (except those that are really
              needed) with EVM or later RISC-V code
            </p>
            <p>
              We can eventually change the VM from EVM to RISC-V (or other
              simpler VM); EVM could be turned into a smart contract in the new
              VM.
            </p>
            <p>
              Finally, we want to move away from client developers feeling the
              need to handle all older versions of the Ethereum protocol. That
              can be left to older client versions running in docker containers.
            </p>
            <p>
              In the long term, I hope that the rate of change to Ethereum can
              be slower. I think for various reasons that ultimately that must
              happen. These first fifteen years should in part be viewed as an
              adolescence stage where we explored a lot of ideas and saw what
              works and what is useful and what is not. We should strive to
              avoid the parts that are not useful being a permanent drag on the
              Ethereum protocol.
            </p>
            <p>
              Basically, we want to improve Ethereum in a way that looks like
              this:
            </p>
            <div className="relative flex w-full rounded-xl overflow-hidden border border-gray-300 mt-2">
              <Image
                alt="ethereum improvement visualization"
                draggable={false}
                width={1000}
                height={600}
                className="w-full h-auto"
                src="https://ik.imagekit.io/lens/tr:w-1000/f61e73e8bca90719e62580586d1d16e8873b4b028bd68bd09312267fa8599d82_6MJycGTb0.png"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalkEntry;
