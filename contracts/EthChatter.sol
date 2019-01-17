pragma solidity ^0.5.0;

contract EthChatter {
    
    struct Message{
        address sender;
        bytes32 message;
        bool encrypted;
    }
    
    string chatter = "EthChatter";

    mapping (address => mapping ( uint => Message)) messages;
    mapping (address => uint256) numberMessages; 
    mapping (address => address[]) addressBook;
    
    function sendMessage (address receiver, bytes32 sentMessage, bool encrypted) public {
        Message memory message = Message(msg.sender, sentMessage, encrypted);
        uint numMessages = numberMessages[receiver];
        if(numMessages >= 0){
            messages[receiver][numMessages] = message;
        }
        else{
            messages[receiver][numMessages + 1] = message;
        }
        numberMessages[receiver] = numMessages + 1;
        emit messageSent(receiver);
    }
    
    function getLatestMessage() public view returns (address sender, bytes32 sentMessage, bool encrypted){
        uint numMessages = numberMessages[msg.sender];
        Message memory message = messages[msg.sender][numMessages - 1];
        sender = message.sender;
        encrypted = message.encrypted;
        sentMessage = message.message;
    }
    
    function getMessageByNumber(uint num) public view returns (address  sender, bytes32 sentMessage, bool encrypted){
        Message memory message = messages[msg.sender][num];
        sender = message.sender;
        encrypted = message.encrypted;
        sentMessage = message.message;
    }
    
    function getNumberOfMyMessages() public view returns(uint num){
        return numberMessages[msg.sender];
    }

    function returnName() public view returns(string memory){
        return chatter;
    }
    
    event messageSent (
        address indexed _receiver
    );
}