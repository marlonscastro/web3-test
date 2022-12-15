import 'dotenv/config'
import Web3 from 'web3'
import { AbiItem } from 'web3-utils'
import { Chain, Common, Hardfork, CustomChain } from '@ethereumjs/common'
import { Transaction } from '@ethereumjs/tx'
import MyContractABI from './abis/Test.json'

// configurações para Testnet da AVAX 
// const chain = common.forCustomChain(
//   'mainnet', {
//   name: 'avax',
//   networkId: 97,
//   chainId: 43113
// },
//   'petersburg'
// )

// Mesmo sendo a Binance, o saldo é expresso em ether pois a Binance foi um Hard Fork de Geth com Proof of Stake ao inves de Work
const init = async () => {
  if (!process.env.URL) return
  const web3 = new Web3(process.env.URL)

  // const id = await web3.eth.net.getId();
  // Endereço do Contrato a ser executado na rede 
  if (!process.env.CONTRACT_ADDR) return
  const contractAddress = process.env.CONTRACT_ADDR;

  // Cria uma instância do Contrato 
  const contract = new web3.eth.Contract(
    MyContractABI as AbiItem[],
    contractAddress
  )
  // Busca se tem alguma conta adicionada ao navegador, ex: Metamask
  // const addresses = await web3.eth.getAccounts();
  // console.log('Lista de endereços de payer: ', addresses);

  // Conta que executará o contrato (não necessariamente é a mesma que fez o deploy)
  // Contém 0.9929 BNB
  if (!process.env.ACCOUNT) return
  const account = process.env.ACCOUNT;

  // Chave privada da conta (Necessária caso tenha que fazer transações payable)
  if (!process.env.PRIVATE_KEY) return
  const privateKey = Buffer.from(process.env.PRIVATE_KEY, 'hex');
  console.log('Private Key: ', privateKey)
  // Executa um Metodo presente no contrato, => Somente leitura / Não altera estado, portanto, não precisa de assinatura e não paga taxas
  const data = await contract.methods.getCount().call();
  console.log('Antes: ', data);

  // Calculando o gas estimado da operação que altera estado 
  const contractFunction = contract.methods.count(6);
  const estimatedGas = await contractFunction.estimateGas({ from: account })
  console.log('Gas estimado: ', estimatedGas);

  // Busca o Nonce 
  const nonce = await web3.eth.getTransactionCount(account)
  
  const common = Common.custom({ chainId: 43113, networkId: 97, name: 'avax'})

  const txParams = {
    from: account,
    nonce: web3.utils.toHex(nonce),
    to: contractAddress,
    value: '0x00',
    gasPrice: web3.utils.toHex(21000),
    gasLimit: web3.utils.toHex(web3.utils.toWei('10', 'gwei')),
    data: contractFunction.encodeABI(),
    chainId: 43113,
    common 
  };


  const tx = Transaction.fromTxData(txParams, { common })

  // Assina a transação com a chave privada
  const signedTx = tx.sign(privateKey);

  const serializeTx = signedTx.serialize()

  // Envia a transação para alterar o estado no Contrato 
  web3.eth.sendSignedTransaction(serializeTx.toString('hex'))
    .on('receipt', async receipt => {
      const data = await contract.methods.getCount().call();
      console.log('Depois: ', data);
    }).catch(err => {
      console.log('Erro =>>>> ', err);
    })
}

init()





{/** 

const Web3 = require('web3')
const Tx = require('@ethereumjs/tx');
const Common = require('@ethereumjs/common') 

const common = new Common.default({ chain: 'ropsten' })

const w3 = new Web3('https://ropsten.infura.io/v3/<apikey>')

 const key = '3c9...'
 const address = '0x3c6E2d83dFAd3858B55C978576b0Ba697C50a43c'

var privateKey = Buffer.from(key, 'hex')

const rawTx = {
    nonce: w3.utils.toHex(0), //to be incremented for each new transaction with this account
    from: address,
    to: '0xe381c25de995d62b453af8b931aac84fccaa7a62',
    gasLimit: w3.utils.toHex(21000),
    gasPrice: w3.utils.toHex(10e9), //10 Gwei
    value: w3.utils.toHex(0),
    //chainId: w3.utils.toHex(3), optional parameter
};

let tx = Tx.Transaction.fromTxData(rawTx, {common})
const signedTx = tx.sign(privateKey);
//encode the transaction in rlp format
const serializedTx = signedTx.serialize()

let tx_hash = w3.eth.sendSignedTransaction(w3.utils.toHex(serializedTx))
  .on('receipt', console.log)
     .catch(e => console.log('e: ', e));

*/}













// mainnet 
// const web3 = new Web3('https://bsc-dataseed1.binance.org:443');
// testnet
// const web3 = new Web3('https://data-seed-prebsc-1-s1.binance.org:8545');




// Mainnet Binance 
// import Common from 'ethereumjs-common';
// import transaction from 'ethereumjs-tx';

// const common = Common.default.forCustomChain('mainnet', {
//   name: 'bnb',
//   networkId: 56,
//   chainId: 56
// }, 'petersburg');

// const tx = new transaction.Transaction(data, {
//   common
// });

// TestNet Binance 
// const createRawTransaction = require('ethereumjs-tx').Transaction;
// const common = require('ethereumjs-common');

//  const chain = common.default.forCustomChain(
//    'mainnet',{
//      name: 'bnb',
//      networkId: 97,
//      chainId: 97
//    },
//    'petersburg'
//  )
//  var rawTx = new createRawTransaction(rawData, {common: chain});