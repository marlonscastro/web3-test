import 'dotenv/config'
import Web3 from 'web3'
import { AbiItem } from 'web3-utils'
import { Chain, Common, Hardfork } from '@ethereumjs/common'
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
  const web3 = new Web3('https://api.avax-test.network/ext/bc/C/rpc')

  // const id = await web3.eth.net.getId();
  // Endereço do Contrato a ser executado na rede 
  const contractAddress = '0x1ffAE3286A101151098ce63bB915Db5B71B48Be7';

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
  if(!process.env.ACCOUNT) return
  const account = process.env.ACCOUNT;

  // Chave privada da conta (Necessária caso tenha que fazer transações payable)
  if (!process.env.PRIVATE_KEY) return
  const privateKey = Buffer.from(process.env.PRIVATE_KEY, 'hex');

  // Busca o saldo da conta
  const balanceWei = await web3.eth.getBalance(account)
  const etherBalance = web3.utils.fromWei(balanceWei, 'ether')
  console.log('Balance: ', etherBalance);

  // Executa um Metodo presente no contrato, => Somente leitura / Não altera estado, portanto, não precisa de assinatura e não paga taxas
  const data = await contract.methods.getCount().call();
  console.log('Antes: ', data);

  // Calculando o gas estimado da operação que altera estado 
  const contractFunction = contract.methods.count(6);
  const estimatedGas = await contractFunction.estimateGas({ from: account })
  console.log('Gas estimado: ', estimatedGas);

  // Busca o Nonce 
  const nonce = await web3.eth.getTransactionCount(account)

  const txParams = {
    nonce: web3.utils.toHex(nonce),
    to: contractAddress,
    value: web3.utils.toHex(web3.utils.toWei('0', 'ether')),
    gasPrice: web3.utils.toHex(2100000),
    gasLimit: web3.utils.toHex(web3.utils.toWei('6', 'gwei')),
    data: contractFunction.encodeABI(),
    chainId: web3.utils.toHex(43114)
  };

  const common = new Common({ chain: Chain.Mainnet, hardfork: Hardfork.Istanbul })

  // Cria a Transação com os parametros desejados 
  // const rawTx = new tx.Transaction(txParams, {
  //   common: chain
  // });
  
  const tx = Transaction.fromTxData(txParams, { common })

  // Assina a transação com a chave privada
  tx.sign(privateKey);

  const serializeTx = tx.serialize().toString('hex')
  const raw = web3.utils.toHex(serializeTx)
  // Envia a transação para alterar o estado no Contrato 
  web3.eth.sendSignedTransaction(raw)
    .on('receipt', async receipt => {
      const data = await contract.methods.getCount().call();
      console.log('Depois: ', data);
    }).catch(err => {
      console.log('Erro =>>>> ', err);
    })

}

init()











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