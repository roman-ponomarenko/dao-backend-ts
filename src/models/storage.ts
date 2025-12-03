import {config} from "../config/config";

export interface Storage {
    proposals: Map<string, Proposal>;
    totalProposals: number;
    totalExecutedProposals: number;
    lastBlockProcessed: number;
}

export interface Proposal {
    id: string; // proposal id
    creator: string; // proposal creator (address)
    description: string; // proposal description
    startBlock: number; // proposal start block
    createdAt: string | null; // proposal created at (string)
    endBlock: string | null; // proposal end block
    executedAt: string | null; // proposal executed at (string)
    executed: boolean | null; // proposal executed (boolean)
    voteCountFor: string; // proposal vote count for (number)
    voteCountAgainst: string; // proposal vote count against (number)
    transactionHash: string; // proposal transaction hash (string)
    votes: Vote[]; // array of votes
}

export interface Vote {
    id: number;
    voter: string;
    support: boolean;
    amount: string;
    blockNumber: number;
    timestamp: string | null;
    transactionHash: string;
}

export const storage: Storage = {
    proposals: new Map<string, Proposal>(),
    totalProposals: 0,
    totalExecutedProposals: 0,
    lastBlockProcessed: config.START_BLOCK
}