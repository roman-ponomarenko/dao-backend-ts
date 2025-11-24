/*
* Storage
* * events: array of events
* * proposals: map of proposals
* * * id: proposal id
* * * creator: proposal creator (address)
* * * description: proposal description
* * * startBlock: proposal start block
* * * createdAt: proposal created at (string)
* * * endBlock: proposal end block
* * * executedAt: proposal executed at (string)
* * * executed: proposal executed (boolean)
* * * voteCountFor: proposal vote count for (number)
* * * voteCountAgainst: proposal vote count against (number)
* * * transactionHash: proposal transaction hash (string)
* * * votes: array of votes
* * * * voter: vote voter (address)
* * * * support: vote support (boolean)
* * * * amount: vote amount (number)
* * * * blockNumber: vote block number (number)
* * * * timestamp: vote timestamp (string)
* * * * transactionHash: vote transaction hash (string)
*/
interface Storage {
    events: Event[]; // array of events
    proposals: Map<number, Proposal>; // map of proposals
}

interface Proposal {
    id: number; // proposal id
    creator: string; // proposal creator (address)
    description: string; // proposal description
    startBlock: number; // proposal start block
    createdAt: string; // proposal created at (string)
    endBlock: number; // proposal end block
    executedAt: string; // proposal executed at (string)
    executed: boolean; // proposal executed (boolean)
    voteCountFor: number; // proposal vote count for (number)
    voteCountAgainst: number; // proposal vote count against (number)
    transactionHash: string; // proposal transaction hash (string)
    votes: Vote[]; // array of votes
}

interface Vote {
    id: number;
    voter: string;
    support: boolean;
    amount: string;
    blockNumber: number;
    timestamp: string;
    transactionHash: string;
}

interface Event {
    // Define event structure based on your needs
    [key: string]: any;
}

const storage: Storage = {
    events: [],
    proposals: new Map<number, Proposal>()
}

const proposal1: Proposal = {
    id: 1,
    creator: "0x0000000000000000000000000000000000000000",
    description: "Proposal description",
    startBlock: 1,
    createdAt: "2022-01-01T00:00:00Z",
    endBlock: 1,
    executedAt: "2022-01-01T00:00:00Z",
    executed: false,
    voteCountFor: 0,
    voteCountAgainst: 0,
    transactionHash: "0x0000000000000000000000000000000000000000000000000000000000000000",
    votes: [
        {
            id: 1,
            voter: '0x0000000000000000000000000000000000000000',
            support: true,
            amount: "100",
            blockNumber: 1,
            timestamp: '2023-01-01T00:00:00Z',
            transactionHash: '0x0000000000000000000000000000000000000000000000000000000000000000'
        },
        {
            id: 2,
            voter: '0x0000000000000000000000000000000000000000',
            support: false,
            amount: "100",
            blockNumber: 1,
            timestamp: '2023-01-01T00:00:00Z',
            transactionHash: '0x0000000000000000000000000000000000000000000000000000000000000000'
        }
    ]
}

const proposal2: Proposal = {
    id: 2,
    creator: "0x0000000000000000000000000000000000000000",
    description: "Proposal description #2",
    startBlock: 2,
    createdAt: "2022-01-01T00:00:00Z",
    endBlock: 3,
    executedAt: "2022-01-01T00:00:00Z",
    executed: false,
    voteCountFor: 0,
    voteCountAgainst: 0,
    transactionHash: "0x0000000000000000000000000000000000000000000000000000000000000000",
    votes: []
}

storage.proposals.set(1, proposal1);
storage.proposals.set(2, proposal2);

export {
    Storage,
    Proposal,
    Vote,
    Event,
    storage
}
