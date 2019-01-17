const EthCrypto = require('eth-crypto');

const App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  init: function() {
    return App.initWeb3();
  },
  
  initEthChatterContract: function(){
    $.getJSON("EthChatter.json", function(chatter) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.EthChatter = TruffleContract(chatter);
      // Connect provider to interact with contract
      App.contracts.EthChatter.setProvider(App.web3Provider);
    }).done(function(){
      return App.render();
    });
  },

  initWeb3: function() {
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      //web3 = new Web3(web3.currentProvider);
      console.log(EthCrypto);
    } else {
      alert("please install MetaMask plugin for a Web3 Provider");
        App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
        web3 = new Web3(App.web3Provider);
    }

    return App.initEthChatterContract();
    //return App.initContract();
  },

  initContract: function() {
    $.getJSON("Election.json", function(election) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.Election = TruffleContract(election);
      // Connect provider to interact with contract
      App.contracts.Election.setProvider(App.web3Provider);
      App.listenForEvents();
    }).done(function(){
      return App.render();
    });
  },

  render: () => {
    let ethChatterInstance;
    // let electionInstance;
    const loader = $("#loader");
    const content = $("#content");
    const latestMessage = $("#latest-message");
    const latestFromAddress = $("#latest-address");
    const latestEncrypted = $("#latest-encrypted");
    const numberOfMessages = $("#number-messages");
    loader.show();
    content.hide();
  
    // Load account data
    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;
        $("#accountAddress").html("Your Account: " + account);
      }
    });
  
    App.contracts.EthChatter.deployed().then(function(instance){
      ethChatterInstance = instance;
      ethChatterInstance.returnName().then(function(name){
        let title = $("#dapp-name");
        title.html(name);
        loader.hide();
      }).then(function(){
        ethChatterInstance.getLatestMessage().then(function(data){
          latestMessage.html(web3.toAscii(data[1]));
          latestFromAddress.html(data[0]);
          latestEncrypted.html(data[2].toString()); 
          ethChatterInstance.getNumberOfMyMessages().then(function(data){
            numberOfMessages.html(data.toNumber());
          })  
        })
      })
    });

    // App.contracts.Election.deployed().then(function(instance) {
    //   electionInstance = instance;
    //   return electionInstance.candidatesCount();
    // }).then(function(candidatesCount) {
    //   var candidatesResults = $("#candidatesResults");
    //   candidatesResults.empty();
  
    //   var candidatesSelect = $('#candidatesSelect');
    //   candidatesSelect.empty();
  
    //   for (var i = 1; i <= candidatesCount; i++) {
    //     electionInstance.candidates(i).then(function(candidate) {
    //       var id = candidate[0];
    //       var name = candidate[1];
    //       var voteCount = candidate[2];
  
    //       // Render candidate Result
    //       var candidateTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + voteCount + "</td></tr>"
    //       candidatesResults.append(candidateTemplate);
  
    //       // Render candidate ballot option
    //       var candidateOption = "<option value='" + id + "' >" + name + "</ option>"
    //       candidatesSelect.append(candidateOption);
    //     });
    //   }
    //   return electionInstance.voters(App.account);
    // }).then(function(hasVoted) {
    //   // Do not allow a user to vote
    //   if(hasVoted) {
    //     $('form').hide();
    //   }
    //   loader.hide();
    //   content.show();
    // }).catch(function(error) {
    //   console.warn(error);
    // });
  }, 
  castVote: function() {
    var candidateId = $('#candidatesSelect').val();
    App.contracts.Election.deployed().then(function(instance) {
      return instance.vote(candidateId, { from: App.account });
    }).then(function(result) {
      // Wait for votes to update
      $("#content").hide();
      $("#loader").show();
    }).catch(function(err) {
      console.error(err);
    });
  },
  listenForEvents: function() {
    App.contracts.Election.deployed().then(function(instance) {
      instance.votedEvent({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function(error, event) {
        console.log("event triggered", event)
        // Reload when a new vote is recorded
        //App.render();
      });
    });
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});