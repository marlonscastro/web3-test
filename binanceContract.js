const Web3 = require('web3');
const common = require('ethereumjs-common');
const tx = require('ethereumjs-tx');
const MyContractABI = require('./src/abis/Test.json');

// configurações para Testnet da Binance 
const chain = common.default.forCustomChain(
  'mainnet', {
  name: 'bnb',
  networkId: 97,
  chainId: 97
},
  'petersburg'
)

// Mesmo sendo a Binance, o saldo é expresso em ether pois a Binance foi um Hard Fork de Geth com Proof of Stake ao inves de Work
const init = async () => {
  const web3 = new Web3('https://data-seed-prebsc-1-s1.binance.org:8545')

  // const id = await web3.eth.net.getId();
  // Endereço do Contrato na rede 
  const contractAddress = '0x406FF89AEEdb514c35161440Ab6760b14928F5F1';

  // Cria uma instância do Contrato 
  const contract = new web3.eth.Contract(
    MyContractABI,
    contractAddress
  )
  // Busca se tem alguma conta adicionada ao navegador, ex: Metamask
  const addresses = await web3.eth.getAccounts();
  console.log('Lista de endereços de payer: ', addresses);

  // Conta que executará o contrato (não necessariamente é a mesma que fez o deploy)
  // Contém 0.9929 BNB
  const account = '0x8d5176A8E81f4cA7B0a160CC08BC0D130640bd60';

  // Chave privada da conta (Necessária caso tenha que fazer transações payable)
  const privateKey = Buffer.from('4fca24389e8280d485756a46e1ddbff02b41626dfdb32048953d65873cdd0f99', 'hex');

  // Busca o saldo da conta
  const balanceWei = await web3.eth.getBalance(account)
  const etherBalance = web3.utils.fromWei(balanceWei, 'ether')
  console.log('Balance: ', etherBalance);

  // Executa um Metodo presente no contrato, => Somente leitura / Não altera estado, portanto, não precisa de assinatura e não paga taxas
  const data = await contract.methods.getCount().call();
  console.log('Antes: ', data);

  // Calculando o gas estimado da operação que altera estado 
  const contractFunction = contract.methods.count(1);
  const estimatedGas = await contractFunction.estimateGas({ from: account })
  console.log('Estimated gas: ', estimatedGas);

  // Busca o Nonce 
  const nonce = await web3.eth.getTransactionCount(account)
  console.log('Nonce: ', nonce.toString(16))

  const txParams = {
    gasPrice: 10000000000,
    gasLimit: estimatedGas,
    to: contractAddress,
    data: contractFunction.encodeABI(),
    from: account,
    nonce: '0x' + nonce.toString(16)
  };
  // Cria a Transação com os parametros desejados 
  const rawTx = new tx.Transaction(txParams, {
    common: chain
  });

  // Assina a transação com a chave privada
  rawTx.sign(privateKey);

  // Envia a transação para alterar o estado no Contrato 
  web3.eth.sendSignedTransaction('0x' + rawTx.serialize().toString('hex'))
  .on('receipt', async receipt => {
    const data = await contract.methods.getCount().call();
    console.log('depois: ', data);
  }).catch(err => {
    console.log(err);
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