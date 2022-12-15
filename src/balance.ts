import 'dotenv/config'
import Web3 from 'web3'
import { AbiItem } from 'web3-utils'
import { Chain, Common, Hardfork } from '@ethereumjs/common'
import { Transaction } from '@ethereumjs/tx'
import MyContractABI from './abis/Test.json'

// Mesmo sendo a Binance, o saldo é expresso em ether pois a Binance foi um Hard Fork de Geth com Proof of Stake ao inves de Work
const init = async () => {
  if(!process.env.URL) return
  const web3 = new Web3(process.env.URL)

  // const id = await web3.eth.net.getId();
  // Endereço do Contrato a ser executado na rede 
  if(!process.env.CONTRACT_ADDR) return
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
  if(!process.env.ACCOUNT) return
  const account = process.env.ACCOUNT;

  // Busca o saldo da conta
  const balanceWei = await web3.eth.getBalance(account)
  const etherBalance = web3.utils.fromWei(balanceWei, 'ether')
  console.log('Account Balance: ', etherBalance);

  // Executa um Metodo presente no contrato, => Somente leitura / Não altera estado, portanto, não precisa de assinatura e não paga taxas
  const data = await contract.methods.getCount().call();
  console.log('Count value at Contract: ', data);

  // Calculando o gas estimado da operação que altera estado 
  const contractFunction = contract.methods.count(6);
  const estimatedGas = await contractFunction.estimateGas({ from: account })
  console.log('Estimated Gas: ', estimatedGas);
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