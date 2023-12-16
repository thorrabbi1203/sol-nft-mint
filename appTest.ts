import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import {
  Metaplex,
  keypairIdentity,
  bundlrStorage,
  toMetaplexFile,
  toBigNumber,
  CreateCandyMachineInput,
  DefaultCandyGuardSettings,
  CandyMachineItem,
  toDateTime,
  sol,
  TransactionBuilder,
  CreateCandyMachineBuilderContext,
} from "@metaplex-foundation/js";
import base58 from "bs58";

const WALLET = Keypair.fromSecretKey(
  base58.decode(
    ""
  )
);
const QUICKNODE_RPC = "https://api.devnet.solana.com";
const SOLANA_CONNECTION = new Connection(QUICKNODE_RPC);
const NFT_METADATA =
  "https://mfp2m2qzszjbowdjl2vofmto5aq6rtlfilkcqdtx2nskls2gnnsa.arweave.net/YV-mahmWUhdYaV6q4rJu6CHozWVC1CgOd9NkpctGa2Q";
// const COLLECTION_NFT_MINT = "5DJALtezTPrjYgH6fXMRUHTUzKmXeVJnMDdCkD1XVQXc";
// const CANDY_MACHINE_ID = "Fspxid4jax1SEa8DRjxxoMcqahjGzdUrKmQYtsGjJFLa";
const METAPLEX = Metaplex.make(SOLANA_CONNECTION)
  .use(keypairIdentity(WALLET))
  .use(
    bundlrStorage({
      address: "https://devnet.bundlr.network",
      providerUrl: QUICKNODE_RPC,
      timeout: 60000,
    })
  );

async function createCollectionNft() {
  const { nft: collectionNft } = await METAPLEX.nfts().create(
    {
      name: "QuickNode Demo NFT Collection",
      uri: NFT_METADATA,
      sellerFeeBasisPoints: 0,
      isCollection: true,
      updateAuthority: WALLET,
      maxSupply: 10,
    },
    { commitment: "finalized" }
  );

  return collectionNft.address.toString();
}

async function generateCandyMachine(COLLECTION_NFT_MINT: string) {
  const candyMachineSettings: CreateCandyMachineInput<DefaultCandyGuardSettings> =
  {
    itemsAvailable: toBigNumber(3), // Collection Size: 3
    sellerFeeBasisPoints: 1000, // 10% Royalties on Collection
    symbol: "DEMO",
    maxEditionSupply: toBigNumber(0), // 0 reproductions of each NFT allowed
    isMutable: true,
    creators: [{ address: WALLET.publicKey, share: 100 }],
    collection: {
      address: new PublicKey(COLLECTION_NFT_MINT), // Can replace with your own NFT or upload a new one
      updateAuthority: WALLET,
    },
  };
  const { candyMachine } = await METAPLEX.candyMachines().create(
    candyMachineSettings,
    { commitment: "finalized" }
  );
  console.log(candyMachine.address.toString());
  return candyMachine.address.toString();
}

async function updateCandyMachine(CANDY_MACHINE_ID: string) {
  const candyMachine = await METAPLEX.candyMachines().findByAddress({
    address: new PublicKey(CANDY_MACHINE_ID),
  });

  const { response } = await METAPLEX.candyMachines().update(
    {
      candyMachine,
      guards: {
        startDate: { date: toDateTime("2022-10-17T16:00:00Z") },
        mintLimit: {
          id: 1,
          limit: 2,
        },
        solPayment: {
          amount: sol(0.1),
          destination: METAPLEX.identity().publicKey,
        },
      },
    },
    { commitment: "finalized" }
  );

  return CANDY_MACHINE_ID;
}

// updateCandyMachine();
async function addItems(CANDY_MACHINE_ID: string) {
  const candyMachine = await METAPLEX.candyMachines().findByAddress({
    address: new PublicKey(CANDY_MACHINE_ID),
  });
  const items = [];
  for (let i = 0; i < 3; i++) {
    // Add 3 NFTs (the size of our collection)
    items.push({
      name: `QuickNode Demo NFT # ${i + 1}`,
      uri: NFT_METADATA,
    });
  }
  const { response } = await METAPLEX.candyMachines().insertItems(
    {
      candyMachine,
      items: items,
    },
    { commitment: "finalized" }
  );
  return CANDY_MACHINE_ID;
}
// addItems();
async function mintNft(CANDY_MACHINE_ID: string) {
  const candyMachine = await METAPLEX.candyMachines().findByAddress({
    address: new PublicKey(CANDY_MACHINE_ID),
  });
  let { nft, response } = await METAPLEX.candyMachines().mint(
    {
      candyMachine,
      collectionUpdateAuthority: WALLET.publicKey,
    },
    { commitment: "finalized" }
  );

  console.log(`✅ - Minted NFT: ${nft.address.toString()}`);
  console.log(`✅ - Machine id: ${CANDY_MACHINE_ID}`);
  console.log(
    `     https://explorer.solana.com/address/${nft.address.toString()}?cluster=devnet`
  );
  console.log(
    `     https://explorer.solana.com/tx/${response.signature}?cluster=devnet`
  );
}
async function main() {
  createCollectionNft().then((res) =>
    generateCandyMachine(res).then((gs) =>
      updateCandyMachine(gs).then((asd) =>
        addItems(asd).then((rtesdf) => mintNft(rtesdf))
      )
    )
  );
}
main();
