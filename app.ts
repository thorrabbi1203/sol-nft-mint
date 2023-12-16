import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import {
  Metaplex,
  keypairIdentity,
  bundlrStorage,
  toMetaplexFile,
  toBigNumber,
  token,
} from "@metaplex-foundation/js";
import * as fs from "fs";
import base58 from "bs58";
const QUICKNODE_RPC = "https://api.mainnet-beta.solana.com";
const SOLANA_CONNECTION = new Connection(QUICKNODE_RPC);

const WALLET = Keypair.fromSecretKey(
  base58.decode(
    ""
  )
);
const METAPLEX = Metaplex.make(SOLANA_CONNECTION)
  .use(keypairIdentity(WALLET))
  .use(
    bundlrStorage({
      // address: "https://devnet.bundlr.network",
      providerUrl: QUICKNODE_RPC,
      timeout: 60000,
    })
  );
const CONFIG = {
  uploadPath: "uploads/",
  imgFileName: "image.jpg",
  imgType: "image/png",
  imgName: "QuickNode Pixel 123",
  description: "Pixel infrastructure for everyone!",
  attributes: [
    { trait_type: "Speed", value: "Quick" },
    { trait_type: "Type", value: "Pixelated" },
    { trait_type: "Background", value: "QuickNode Blue" },
  ],
  sellerFeeBasisPoints: 500, //500 bp = 5%
  symbol: "QNPIX",
  creators: [{ address: WALLET.publicKey, share: 100 }],
};
async function uploadMetadata(
  imgUri: string,
  imgType: string,
  nftName: string,
  description: string,
  attributes: { trait_type: string; value: string }[]
) {
  console.log(`Step 2 - Uploading Metadata`);
  const { uri } = await METAPLEX.nfts().uploadMetadata({
    name: nftName,
    description: description,
    image: imgUri,
    attributes: attributes,
    properties: {
      files: [
        {
          type: imgType,
          uri: imgUri,
        },
      ],
    },
  });
  console.log("   Metadata URI:", uri);
  return uri;
}
async function uploadImage(
  filePath: string,
  fileName: string
): Promise<string> {
  console.log(`Step 1 - Uploading Image`);
  const imgBuffer = fs.readFileSync(filePath + fileName);
  const imgMetaplexFile = toMetaplexFile(imgBuffer, fileName);
  const imgUri = await METAPLEX.storage().upload(imgMetaplexFile);
  console.log(`   Image URI:`, imgUri);
  return imgUri;
}
async function mintNft(
  metadataUri: string,
  name: string,
  sellerFee: number,
  symbol: string,
  creators: { address: PublicKey; share: number }[]
) {
  console.log(`Step 3 - Minting NFT`);
  const { sft } = await METAPLEX.nfts().createSft({
    uri: metadataUri,
    name: name,
    sellerFeeBasisPoints: sellerFee,
    symbol: symbol,
    creators: creators,
    isMutable: false,
    maxSupply: toBigNumber(10),
    isCollection: true
  }, { commitment: "finalized" });
  // const res = await METAPLEX.nfts().mint({ nftOrSft: sft, amount: token(5) }, { commitment: "finalized" })
  console.log(`   Success!🎉`);
  console.log(
    `   Minted NFT: https://explorer.solana.com/address/${sft}?cluster=devnet`
  );
  // console.log(res.response.)
}
async function main() {
  // console.log(
  //   `Minting ${CONFIG.imgName
  //   } to an NFT in Wallet ${WALLET.publicKey.toBase58()}.`
  // );
  // const imgUri = await uploadImage(CONFIG.uploadPath, CONFIG.imgFileName);
  // console.log(imgUri);
  // //Step 2 - Upload Metadata
  // const metadataUri = await uploadMetadata(
  //   imgUri,
  //   CONFIG.imgType,
  //   CONFIG.imgName,
  //   CONFIG.description,
  //   CONFIG.attributes
  // );
  // console.log(metadataUri);
  // //Step 3 - Mint NFT
  // mintNft(
  //   metadataUri,
  //   CONFIG.imgName,
  //   CONFIG.sellerFeeBasisPoints,
  //   CONFIG.symbol,
  //   CONFIG.creators
  // );
  // METAPLEX.nfts().findAllByOwner({ owner: new PublicKey('DZnQZ8UVyMgG3xvTszMNjzT5JhuBKMnuZ9jcrqXXpYDY') }).then(res => {
  //   // const [fnft, snft] = res
  //   console.log(res)
  //   // METAPLEX.nfts().findByAssetId({
  //   //   assetId: new PublicKey('FQUH9W4EfmvugdbPiKkyfTbf5WQmHYRfn3AV1NLfb3r5')
  //   // }).then(s => console.log(s))
  //   return
  // })
  METAPLEX.nfts().findByAssetId({
    assetId: new PublicKey('D1MhpT4MZeWztkCjogdtupX4VCvsMbYpdBcpYx9NYJhJ')
  }).then(s => console.log(s))
}
main();
