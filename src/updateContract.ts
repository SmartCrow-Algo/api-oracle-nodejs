import algosdk from 'algosdk';
import process from 'process';
import * as abi from '../contract/contract.json';
export async function updateContract(appIndex: number, propertyNumber: string, propertySold: boolean, meetSalesCondition: boolean, postDeadlineCheck: boolean) {
    // Import Wallet
    console.log("UPDATING THE CONTRACT ...", appIndex)
    const mnemonic:any = process.env.OWNER_WALLET_MNEMONIC;
    const account = algosdk.mnemonicToSecretKey(mnemonic);
    console.log('Wallet import successful ...')

    // Create connection to network via public algod API
    const algodToken = '';
    const algodServer = 'https://testnet-api.algonode.cloud';
    const algodPort = undefined;
    const algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);
    console.log('algodClient connect successful ...')
  
    // Get basic information needed for every transcation
    const suggestedParams = await algodClient.getTransactionParams().do();
    // Read our ABI JSON file to create an ABIContract object
    const contract = new algosdk.ABIContract(abi);
    console.log('ABI import successful ...')
   
    // Call app with ATC
    const atc = new algosdk.AtomicTransactionComposer();
    const boxKey = new Uint8Array(Buffer.from(propertyNumber));
    const signerFunc = async (unsignedTxns: any[]) => unsignedTxns.map((t) => {
      const note = algosdk.encodeObj({ nonce: Math.random() });
      t.note = note;
      return t.signTxn(account.sk);
    });
    
    //For update
    const methodArgs = [
      propertyNumber,
      propertySold,
      meetSalesCondition,
      postDeadlineCheck
    ]
  
    atc.addMethodCall({
      suggestedParams,
      sender: account.addr,
      // Signer is a function that takes in unsigned txns and returns signed txns
      boxes: [
        {
        appIndex: appIndex,
        name: boxKey,
        },
        ],
      appID: appIndex,
      method: algosdk.getMethodByName(contract.methods, 'updateSenderFundsItem'),
      // Note how we don't have to manually encode the string
      methodArgs: methodArgs,
      signer: signerFunc,
      
    });
  
    const executeResponse = await atc.execute(algodClient, 3);
    console.log(`Box updated! See the app at https://testnet.algoscan.app/app/${appIndex}`, executeResponse.methodResults[0].returnValue);
  
  }